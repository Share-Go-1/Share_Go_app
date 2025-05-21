import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Button,
  Platform,
  Alert,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';

const HomeScreen = () => {
  const route = useRoute();
  const {pickup, dropoff} = route.params || {};
  const webviewRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const watchId = navigator.geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          const coords = {latitude, longitude};
          setCurrentLocation(coords);
          sendLiveLocation(coords);
        },
        error => console.error("Geo Error:", error),
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          timeout: 10000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    })();
  }, []);

  const sendLiveLocation = coords => {
    if (webviewRef.current && coords) {
      const payload = {
        type: 'LIVE_LOCATION',
        coords,
      };
      webviewRef.current.postMessage(JSON.stringify(payload));
    }
  };

  const postCoords = () => {
    if (webviewRef.current && (pickup || dropoff)) {
      const payload = {pickup, dropoff};
      webviewRef.current.postMessage(JSON.stringify(payload));
    }
  };

  const shareLocationOnWhatsApp = () => {
    if (!pickup || !dropoff) {
      Alert.alert("Missing Info", "Pickup or dropoff location is missing.");
      return;
    }

    // Google Maps Directions Link
    const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}`;

    const message = `🚖 *Ride Info*\n\nFollow this route from Pickup to Dropoff:\n${mapsLink}`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "WhatsApp is not installed or URL scheme failed.");
    });
  };

  const mapHtml = `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
      <script>
        const map = L.map('map').setView([33.6844, 73.0479], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'OSM contributors'
        }).addTo(map);

        let pickupMarker = null;
        let dropoffMarker = null;
        let routeLine = null;
        let liveMarker = null;

        let pickupCoords = null;
        let dropoffCoords = null;

        function drawRouteWithAPI() {
          if (!pickupCoords || !dropoffCoords) return;

          const apiKey = "5b3ce3597851110001cf6248648afa3da02b4f99982cd4f009d549ce";
          const url = \`https://api.openrouteservice.org/v2/directions/driving-car?api_key=\${apiKey}&start=\${pickupCoords[1]},\${pickupCoords[0]}&end=\${dropoffCoords[1]},\${dropoffCoords[0]}\`;

          fetch(url)
            .then(res => res.json())
            .then(data => {
              const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
              if (routeLine) map.removeLayer(routeLine);
              routeLine = L.polyline(coords, {color: 'blue', weight: 4}).addTo(map);
              map.fitBounds(routeLine.getBounds().pad(0.3));
              window.ReactNativeWebView.postMessage("🚗 Route drawn");
            })
            .catch(err => {
              console.error("Route error:", err);
              alert("Failed to draw route.");
            });
        }

        function handleMessage(event) {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'LIVE_LOCATION') {
              const {latitude, longitude} = data.coords;
              const liveCoords = [latitude, longitude];
              if (liveMarker) map.removeLayer(liveMarker);
              liveMarker = L.marker(liveCoords, {
                icon: L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [0, -41],
                })
              }).addTo(map).bindPopup("📍 You are here").openPopup();
            }

            if (data.pickup) {
              pickupCoords = [data.pickup.latitude, data.pickup.longitude];
              if (pickupMarker) map.removeLayer(pickupMarker);
              pickupMarker = L.marker(pickupCoords).addTo(map).bindPopup("📦 Pickup").openPopup();
            }

            if (data.dropoff) {
              dropoffCoords = [data.dropoff.latitude, data.dropoff.longitude];
              if (dropoffMarker) map.removeLayer(dropoffMarker);
              dropoffMarker = L.marker(dropoffCoords).addTo(map).bindPopup("🏁 Dropoff").openPopup();
            }

            if (pickupCoords && dropoffCoords) {
              drawRouteWithAPI();
            }

          } catch (err) {
            console.error("Parse error:", err);
          }
        }

        document.addEventListener("message", handleMessage);
        window.addEventListener("message", handleMessage);

        window.ReactNativeWebView.postMessage("✅ Map rendered");
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{html: mapHtml}}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={event => {
          if (event.nativeEvent.data === '✅ Map rendered') {
            postCoords();
          }
        }}
      />
      <View style={styles.buttonContainer}>
        <Button
          title="📤 Share Ride via WhatsApp"
          onPress={shareLocationOnWhatsApp}
          color="#25D366"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  buttonContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;
