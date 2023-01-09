// import logo from './logo.svg';
// import './App.css';
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { Marker, MapContainer, TileLayer, Popup, CircleMarker, Tooltip } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// function App() {
//   return (
//     <MapContainer center={[-3.3165212087692626, 114.60065413261525]} zoom={6} scrollWheelZoom={true}>
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       <CircleMarker
//         center={[-6.20551397194474, 106.84187761829968]}
//         pathOptions={{ color: 'red' }}
//         radius={20}>
//         <Tooltip>Imigrasi Jakarta</Tooltip>
//       </CircleMarker>
//       <CircleMarker
//         center={[-6.905064512919327, 107.61525730857888]}
//         pathOptions={{ color: 'yellow' }}
//         radius={20}>
//         <Tooltip>Tooltip for CircleMarker</Tooltip>
//       </CircleMarker>
//     </MapContainer>
//   );
// }

// export default App;

import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { FaMapMarkerAlt } from "react-icons/fa";
import { Marker, MapContainer, TileLayer, Popup, CircleMarker, Tooltip, GeoJSON } from "react-leaflet";
import Choropleth from 'react-leaflet-choropleth'
import "leaflet/dist/leaflet.css";

const data = require('./dataGeo.json')
function App() {
  const [selected, setSelected] = useState({});
  let mapRef;
  const COLOR_0 = "#F06E45";
  const COLOR_RED = "red";
  const COLOR_YELLOW = "yellow";
  const COLOR_BLUE = "blue";

  const getColor = (d) => {
    return d > 80
      ? COLOR_RED
      : d > 40
        ? COLOR_YELLOW
        : d > 0
          ? COLOR_BLUE
          : COLOR_0;
  }

  const style = (feature) => {
    return {
      fillColor: getColor(feature.properties.COUNT),
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "6",
      fillOpacity: 0.8
    };
  }

  const zoomToFeature = (e) => {
    mapRef.fitBounds(e.target.getBounds());
  }

  const highlightFeature = (e) => {
    var layer = e.target;
    const { Propinsi, COUNT } = e.target.feature.properties;
    setSelected({
      province: `${Propinsi}`,
      count: COUNT
    });
    layer.setStyle({
      weight: 1,
      dashArray: "4",
      fillOpacity: 1
    });
  }

  const resetHighlight = (e) => {
    setSelected({});
    e.target.setStyle(style(e.target.feature));
  }

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  let currentIndex = 0;
  let interval;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && map && layer) {
      map.leafletElement.fitBounds(layer.leafletElement.getBounds());
      layer.leafletElement.openPopup();
      isFirstRender.current = false;
    }

    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % data.length;
      if (map && layer) {
        map.leafletElement.fitBounds(layer.leafletElement.getBounds());
        layer.leafletElement.openPopup();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  let map;
  let layer;


  return (
    <MapContainer center={[-1.228195643523448, 117.72946322077586]} zoom={6} scrollWheelZoom={true}
      whenReady={e => {
        mapRef = e.target;
        e.target.flyToBounds([
          [-6.3707299199999996, 106.686210630000005],
          [-6.0890359900000002, 106.9728240999999969]
        ]);
      }} ref={ref => (map = ref)}>
      <button
        onClick={() => {
          mapRef.flyToBounds([
            [-6.3707299199999996, 106.686210630000005],
            [-6.0890359900000002, 106.9728240999999969]
          ]);
        }}
        className="full-extent"
      />
      {!selected.province && (
        <div className="hover-info">Hover over an Area</div>
      )}
      {selected.province && (
        <div className="info">
          <strong>{selected.province}</strong>
          <span>{selected.count} Orang</span>
        </div>
      )}
      <div className="legend">
        <div style={{ "--color": 'red' }}>Ramai 100-80</div>
        <div style={{ "--color": 'yellow' }}>Padat 80-40</div>
        <div style={{ "--color": 'blue' }}>Lancar 40-0</div>
      </div>
      {data && (
        <GeoJSON data={data} style={style} onEachFeature={onEachFeature} ref={ref => (layer = ref)} />
      )}
      {/* <Choropleth
        data={{ type: 'FeatureCollection', features: data }}
        valueProperty={(feature) => feature.properties.value}
        // visible={(feature) => feature.id !== active.id}
        scale={['#b3cde0', '#011f4b']}
        steps={7}
        mode='e'
        style={style}
        onEachFeature={(feature, layer) => layer.bindPopup(feature.properties.label)}
        // ref={(el) => this.choropleth = el.leafletElement}
      /> */}
    </MapContainer>
  );
}

export default App;
