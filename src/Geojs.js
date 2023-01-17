import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Marker, MapContainer, TileLayer, Tooltip, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Recharts from './Recharts';
import L from "leaflet";
import axios from 'axios';

// const data = require('./dataGeo3.json')

const Geojs = () => {
    const [selected, setSelected] = useState({});
    const [data, setGeo] = useState([])
    const [currentIndex, setCurrentIndex] = useState(data.length - 1);
    const [oke, setOke] = useState(false);
    const ref = useRef(null)
    const mapRef = useRef();

    const icontpi = L.icon({
        iconRetinaUrl: require("./assets/tpi.png"),
        iconUrl: require("./assets/tpi.png"),
        iconSize: [25, 30],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
    });

    const iconkanim = L.icon({
        iconRetinaUrl: require("./assets/kanim.png"),
        iconUrl: require("./assets/kanim.png"),
        iconSize: [25, 30],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
    });

    const iconkanwil = L.icon({
        iconRetinaUrl: require("./assets/kanwil.png"),
        iconUrl: require("./assets/kanwil.png"),
        iconSize: [25, 30],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
    });

    const style = (feature, index) => {
        return {
            fillColor: '#ffffff00',
            weight: feature.region_number === currentIndex ? 8 : 2,
            opacity: 0.5,
            color: feature.region_number === currentIndex ? 'green' : '#ffffff00',
            dashArray: "1",
            fillOpacity: 0.6,
        };
    }

    const options = {
        duration: 2,
        easeLinearity: 0.25,
        animate: true
    };

    const searchByRegion = (array, region_number) => {
        return array.filter(item => item.region_number === region_number)[0];
    }

    const zoomToFeature = async (i) => {
        const searchResult = await searchByRegion(data, i);
        mapRef.current.flyToBounds(searchResult?.coordinate_bound, options);
    }

    const onSelected = async (i) => {
        const searchResult = await searchByRegion(data, i);
        setSelected({
            province: `${searchResult?.name} | ${i} | ${searchResult?.region_number}`
        });
    }

    const findGeoJson = async () => {
        try {
            const response = await axios.get('http://localhost:11612/rest/geojson');
            setGeo(response.data.data);
            setOke(true);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        findGeoJson();
    }, []);

    useEffect(() => {
        if (oke) {
            ref.current = setInterval(() => {
                setCurrentIndex(currentIndex => {
                    const nextIndex = (currentIndex + 1) % data.length;
                    onSelected(nextIndex, data);
                    zoomToFeature(nextIndex, data)
                    return nextIndex;
                });
            }, 5000);
        }
        return () => {
            clearInterval(ref.current);
        }
    }, [oke])

    return (
        <MapContainer zoom={6} scrollWheelZoom={false} center={[-1.228195643523448, 117.72946322077586]} ref={mapRef}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* <TileLayer
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      /> */}

            <button
                className="full-extent"
            />
            {!selected.province && (
                <div className="hover-info">Loading...</div>
            )}
            {selected.province && (
                <div className="info">
                    <strong style={{ margin: 20 }}>{selected?.province}</strong>
                    <Recharts />
                </div>
            )}
            {data?.map((feature, index) => (
                <GeoJSON
                    key={index}
                    data={feature}
                    style={style(feature, index)}
                >
                    <Marker position={feature?.coordinate} icon={iconkanwil}>
                        <Tooltip options={{ className: "custom-tooltip" }} permanent>{feature?.name}</Tooltip>
                    </Marker>

                    {!!feature && feature.region_number === currentIndex && feature?.kanims.map((knm, index) => (
                        <div>
                            <Marker position={knm?.coordinate} icon={iconkanim} key={index}>
                                <Tooltip permanent>{knm?.name}</Tooltip>
                            </Marker>
                            {!!knm && !!knm?.tpis && Array.isArray(knm?.tpis) && knm?.tpis.map((tp, index) => (
                                <Marker position={tp?.coordinate} icon={icontpi} key={index}>
                                    <Tooltip permanent>{tp?.name}</Tooltip>
                                </Marker>
                            ))}
                        </div>
                    ))}

                </GeoJSON>
            ))}
        </MapContainer>
    )
}
export default Geojs;
