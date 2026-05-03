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
    imageBefore: "/crack1.jpg",
    imageAfter: "/repair1.jpg",
  },
  {
    id: 40,
    lat: 37.22007,
    lng: 127.18572,
    name: "균열 40",
    pciBefore: 30,
    pciAfter: 82,
    desc: "거북등 균열 및 패치 손상",
    imageBefore: "/crack40.jpg",
    imageAfter: "/repair40.jpg",
  },
  {
    id: 80,
    lat: 37.22067,
    lng: 127.1868,
    name: "균열 80",
    pciBefore: 55,
    pciAfter: 88,
    desc: "광범위한 블록 균열",
    imageBefore: "/crack80.jpg",
    imageAfter: "/repair80.jpg",
  },
  {
    id: 130,
    lat: 37.22124,
    lng: 127.18773,
    name: "균열 130",
    pciBefore: 50,
    pciAfter: 87,
    desc: "종방향 균열",
    imageBefore: "/crack130.jpg",
    imageAfter: "/repair130.jpg",
  },
  {
    id: 190,
    lat: 37.22146,
    lng: 127.18806,
    name: "균열 190",
    pciBefore: 25,
    pciAfter: 85,
    desc: "심각한 거북등 균열",
    imageBefore: "/crack190.jpg",
    imageAfter: "/repair190.jpg",
  },
];

const getMarkerIcon = (pci) => {
  let color = "#e74c3c";

  if (pci >= 85) color = "#2ecc71";
  else if (pci >= 70) color = "#f1c40f";
  else if (pci >= 40) color = "#e67e22";

  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "white",
    strokeWeight: 2,
    scale: 1.8,
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

        {/* 🔥 제목 UI */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            backgroundColor: "#2c3e50",
            color: "white",
            padding: "10px 20px",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "18px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.3)"
          }}
        >
          🚧 도로 균열 관리 시스템
        </div>

        {/* 버튼 */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "12px",
            zIndex: 10,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          <button
            onClick={() => setShowAfter(false)}
            style={{
              backgroundColor: showAfter ? "#eee" : "#3498db",
              color: showAfter ? "black" : "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            보수 전
          </button>

          <button
            onClick={() => setShowAfter(true)}
            style={{
              backgroundColor: showAfter ? "#3498db" : "#eee",
              color: showAfter ? "white" : "black",
              border: "none",
              padding: "6px 10px",
              borderRadius: "6px",
              marginLeft: "6px",
              cursor: "pointer"
            }}
          >
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
                fontSize: "14px",
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
            <div style={{ width: "380px", fontSize: "14px" }}>
              <h3 style={{ marginBottom: "8px" }}>
                {selected.name} (균열 위치)
              </h3>

              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "50%" }}>
                  <p style={{ fontWeight: "bold" }}>보수 전</p>
                  <img
                    src={selected.imageBefore}
                    style={{
                      width: "100%",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ width: "50%" }}>
                  <p style={{ fontWeight: "bold" }}>보수 후</p>
                  <img
                    src={selected.imageAfter}
                    style={{
                      width: "100%",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: "17px", fontWeight: "bold", color: "#2c3e50" }}>
                PCI: {selected.pciBefore} → {selected.pciAfter}
              </p>

              <p style={{ fontSize: "14px" }}>
                <strong>설명:</strong> {selected.desc}
              </p>

              <p>위도: {selected.lat}</p>
              <p>경도: {selected.lng}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;