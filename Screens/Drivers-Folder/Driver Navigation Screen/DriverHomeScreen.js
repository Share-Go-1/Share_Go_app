import React, {useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';

const DriverHomeScreen = () => {
  const route = useRoute();
  const {pickup, dropoff} = route.params || {};
  console.log('pickup:', pickup, 'dropoff:', dropoff);
  const webviewRef = useRef(null);

  const mapHtml = `
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; }
    #startBtn {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999;
      background-color: #1e90ff;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <button id="startBtn">Start Ride</button>
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
    let pickupCoords = null;
    let dropoffCoords = null;

    function drawRouteWithAPI() {
  if (!pickupCoords || !dropoffCoords) {
    alert("Pickup or Dropoff location missing.");
    return;
  }

  const apiKey = "5b3ce3597851110001cf6248648afa3da02b4f99982cd4f009d549ce"; // Replace with your key
  const url = \https://api.openrouteservice.org/v2/directions/driving-car?api_key=\${apiKey}&start=\${pickupCoords[1]},\${pickupCoords[0]}&end=\${dropoffCoords[1]},\${dropoffCoords[0]}\;

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

      // Fallback: Fit map around both markers
      const bounds = L.latLngBounds([pickupCoords, dropoffCoords]);
      map.fitBounds(bounds.pad(0.3));
    });
}


    document.getElementById("startBtn").addEventListener("click", drawRouteWithAPI);

    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        window.ReactNativeWebView.postMessage("📦 Received coords");

        if (data.pickup) {
          pickupCoords = [data.pickup.latitude, data.pickup.longitude];
          if (pickupMarker) map.removeLayer(pickupMarker);
          pickupMarker = L.marker(pickupCoords).addTo(map).bindPopup("Pickup").openPopup();
        }

        if (data.dropoff) {
          dropoffCoords = [data.dropoff.latitude, data.dropoff.longitude];
          if (dropoffMarker) map.removeLayer(dropoffMarker);
          dropoffMarker = L.marker(dropoffCoords).addTo(map).bindPopup("Dropoff");
        }

        if (pickupCoords) {
          map.setView(pickupCoords, 13);
        }

      } catch (err) {
        console.error("Error parsing message:", err);
      }
    }

    document.addEventListener("message", handleMessage);
    window.addEventListener("message", handleMessage);

    window.ReactNativeWebView.postMessage("✅ Map rendered");
  </script>
</body>
</html>
`;

  const postCoords = () => {
    if (webviewRef.current && (pickup || dropoff)) {
      const payload = {pickup, dropoff};
      console.log("📤 Sending coords to WebView:", payload);
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
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={event => {
          console.log('WebView says:', event.nativeEvent.data);
          if (event.nativeEvent.data === '✅ Map rendered') {
            postCoords();
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
