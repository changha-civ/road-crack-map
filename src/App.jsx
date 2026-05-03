import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

const center = {
  lat: 37.2205,
  lng: 127.186,
};

const cracks = [
  {
    id: 1,
    lat: 37.21913,
    lng: 127.18441,
    name: "균열 1",
    pciBefore: 60,
    pciAfter: 90,
    desc: "블록 균열 및 초기 거북등 균열",
    image: "/crack1.jpg",
    repairedImage: "/repair1.jpg",
  },
  {
    id: 40,
    lat: 37.22007,
    lng: 127.18572,
    name: "균열 40",
    pciBefore: 30,
    pciAfter: 82,
    desc: "거북등 균열, 도색 손상 및 패치부 손상",
    image: "/crack40.jpg",
    repairedImage: "/repair40.jpg",
  },
  {
    id: 80,
    lat: 37.22067,
    lng: 127.1868,
    name: "균열 80",
    pciBefore: 55,
    pciAfter: 88,
    desc: "광범위한 블록 균열",
    image: "/crack80.jpg",
    repairedImage: "/repair80.jpg",
  },
  {
    id: 130,
    lat: 37.22124,
    lng: 127.18773,
    name: "균열 130",
    pciBefore: 50,
    pciAfter: 87,
    desc: "종방향 균열 및 분기형 균열",
    image: "/crack130.jpg",
    repairedImage: "/repair130.jpg",
  },
  {
    id: 190,
    lat: 37.22146,
    lng: 127.18806,
    name: "균열 190",
    pciBefore: 25,
    pciAfter: 85,
    desc: "심각한 거북등 균열",
    image: "/crack190.jpg",
    repairedImage: "/repair190.jpg",
  },
];

const getMarkerIcon = (pci) => {
  let color = "#e74c3c"; // 빨강

  if (pci >= 85) color = "#2ecc71"; // 초록
  else if (pci >= 70) color = "#f1c40f"; // 노랑
  else if (pci >= 40) color = "#e67e22"; // 주황

  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "white",
    strokeWeight: 2,
    scale: 1.8,
    labelOrigin: new window.google.maps.Point(12, 9),
    anchor: new window.google.maps.Point(12, 24),
  };
};

function App() {
  const [selected, setSelected] = useState(null);
  const [showAfter, setShowAfter] = useState(false);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCChGpVfC1kWBxgsikIZiwfdMLR7iA5kPw">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100vh" }}
        center={center}
        zoom={17}
      >
        {/* 버튼 */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 10,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          <button onClick={() => setShowAfter(false)}>보수 전</button>
          <button onClick={() => setShowAfter(true)} style={{ marginLeft: "6px" }}>
            보수 후
          </button>
        </div>

        {/* 마커 */}
        {cracks.map((crack) => {
          const pci = showAfter ? crack.pciAfter : crack.pciBefore;

          return (
            <Marker
              key={crack.id}
              position={{ lat: crack.lat, lng: crack.lng }}
              icon={getMarkerIcon(pci)}
              onClick={() => setSelected(crack)}
              label={{
                text: String(crack.id),
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            />
          );
        })}

        {/* 정보창 */}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ width: "360px" }}>
              <h3>{selected.name}</h3>

              <div style={{ display: "flex", gap: "8px" }}>
                <img src={selected.image} style={{ width: "50%" }} />
                <img src={selected.repairedImage} style={{ width: "50%" }} />
              </div>

              <p>
                PCI: {selected.pciBefore} → {selected.pciAfter}
              </p>
              <p>{selected.desc}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;