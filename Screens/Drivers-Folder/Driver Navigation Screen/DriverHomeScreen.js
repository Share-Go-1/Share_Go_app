import React, {useRef, useEffect, useState} from 'react';
import {View, StyleSheet, PermissionsAndroid, Platform, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import {useRoute} from '@react-navigation/native';

const DriverHomeScreen = () => {
  const route = useRoute();
  const {pickup, dropoff} = route.params || {};
  const webviewRef = useRef(null);
  const [watchId, setWatchId] = useState(null);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    let intervalId;

    const startTracking = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      intervalId = setInterval(() => {
        Geolocation.getCurrentPosition(
          position => {
            const current = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            webviewRef.current?.postMessage(
              JSON.stringify({driver: current}),
            );
          },
          error => {
            console.error('Location error:', error);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }, 5000);
    };

    startTracking();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (watchId) Geolocation.clearWatch(watchId);
    };
  }, []);

  const mapHtml = `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; }
        #startBtn, #endBtn {
          position: absolute;
          top: 80px;
          z-index: 999;
          background-color: #1e90ff;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
        }
        #startBtn { left: 10px; }
        #endBtn { right: 10px; background-color: #ff4d4d; }
      </style>
    </head>
    <body>
      <button id="startBtn">Start Ride</button>
      <button id="endBtn">End Ride</button>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
      <script>
        const map = L.map('map').setView([33.6844, 73.0479], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'OSM contributors'
        }).addTo(map);

        let pickupCoords = null, dropoffCoords = null;
        let pickupMarker = null, dropoffMarker = null;
        let routeLine = null;
        let driverMarker = null;
        let lastDriverCoords = null;

        function drawRouteWithAPI() {
          if (!pickupCoords || !dropoffCoords) {
            alert("Pickup or Dropoff location missing.");
            return;
          }

          const apiKey = "5b3ce3597851110001cf6248648afa3da02b4f99982cd4f009d549ce";
          const url = \`https://api.openrouteservice.org/v2/directions/driving-car?api_key=\${apiKey}&start=\${pickupCoords[1]},\${pickupCoords[0]}&end=\${dropoffCoords[1]},\${dropoffCoords[0]}\`;

          fetch(url)
            .then(res => res.json())
            .then(data => {
              const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
              if (routeLine) map.removeLayer(routeLine);
              routeLine = L.polyline(coords, {color: 'red', weight: 4}).addTo(map);
              map.fitBounds(routeLine.getBounds().pad(0.3));
              window.ReactNativeWebView.postMessage("🚗 Route drawn");
            })
            .catch(err => {
              console.error("Error fetching route:", err);
              alert("Failed to draw route.");
              const bounds = L.latLngBounds([pickupCoords, dropoffCoords]);
              map.fitBounds(bounds.pad(0.3));
            });
        }

        function handleMessage(event) {
          try {
            const data = JSON.parse(event.data);

            if (data.pickup) {
              pickupCoords = [data.pickup.latitude, data.pickup.longitude];
              if (pickupMarker) map.removeLayer(pickupMarker);
              pickupMarker = L.marker(pickupCoords).addTo(map).bindTooltip("📍 Pickup", {permanent: true}).openTooltip();
            }

            if (data.dropoff) {
              dropoffCoords = [data.dropoff.latitude, data.dropoff.longitude];
              if (dropoffMarker) map.removeLayer(dropoffMarker);
              dropoffMarker = L.marker(dropoffCoords).addTo(map).bindTooltip("🏁 Dropoff", {permanent: true}).openTooltip();
            }

            if (data.driver) {
              const driverCoords = [data.driver.latitude, data.driver.longitude];
              lastDriverCoords = driverCoords;

              if (!driverMarker) {
                driverMarker = L.marker(driverCoords, {
                  icon: L.icon({
                    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    iconSize: [30, 30]
                  })
                }).addTo(map);
              } else {
                driverMarker.setLatLng(driverCoords);
              }
            }

            if (pickupCoords && dropoffCoords) {
              const bounds = L.latLngBounds([pickupCoords, dropoffCoords]);
              map.fitBounds(bounds.pad(0.3));
            } else if (pickupCoords) {
              map.setView(pickupCoords, 13);
            }

          } catch (err) {
            console.error("Message parse error:", err);
          }
        }

        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
          const R = 6371; // Radius of earth in km
          const dLat = (lat2-lat1) * Math.PI / 180;
          const dLon = (lon2-lon1) * Math.PI / 180;
          const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        }

        function handleEndRide() {
          if (!lastDriverCoords || !dropoffCoords) {
            alert("Insufficient data to end ride.");
            return;
          }

          const [lat1, lon1] = lastDriverCoords;
          const [lat2, lon2] = dropoffCoords;

          const distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);

          if (distance < 0.05) {
            window.ReactNativeWebView.postMessage("✅ Ride ended");
            alert("Ride ended successfully.");
          } else {
            alert("You are not at the dropoff location yet.");
          }
        }

        document.getElementById("startBtn").addEventListener("click", drawRouteWithAPI);
        document.getElementById("endBtn").addEventListener("click", handleEndRide);

        document.addEventListener("message", handleMessage);
        window.addEventListener("message", handleMessage);
        window.ReactNativeWebView.postMessage("✅ Map rendered");
      </script>
    </body>
    </html>
  `;

  const sendInitialCoords = () => {
    const payload = {pickup, dropoff};
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(payload));
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{html: mapHtml}}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        onMessage={event => {
          const msg = event.nativeEvent.data;
          console.log('WebView:', msg);

          if (msg === '✅ Map rendered') {
            sendInitialCoords();
          } else if (msg === '✅ Ride ended') {
            Alert.alert('Ride Completed', 'You have successfully ended the ride.');
            // Optionally, you can navigate somewhere:
            // navigation.goBack();
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
});

export default DriverHomeScreen;
