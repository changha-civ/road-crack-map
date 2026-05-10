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
    desc: "선형균열",
    imageBefore: "/images/crack1.jpg",
    imageAfter: "/images/repair1.jpg",
  },
  {
    id: 2,
    lat: 37.218956,
    lng: 127.184314,
    name: "균열 2",
    desc: "선형균열",
    imageBefore: "/images/crack2.jpg",
    imageAfter: null,
  },
  {
    id: 20,
    lat: 37.219648,
    lng: 127.184668,
    name: "균열 20",
    desc: "선형균열",
    imageBefore: "/images/crack20.jpg",
    imageAfter: null,
  },
  {
    id: 40,
    lat: 37.22007,
    lng: 127.18572,
    name: "균열 40",
    desc: "망상균열",
    imageBefore: "/images/crack40.jpg",
    imageAfter: "/images/repair40.jpg",
  },
  {
    id: 60,
    lat: 37.220271,
    lng: 127.18659,
    name: "균열 60",
    desc: "망상균열",
    imageBefore: "/images/crack60.jpg",
    imageAfter: null,
  },
  {
    id: 80,
    lat: 37.22067,
    lng: 127.1868,
    name: "균열 80",
    desc: "선형균열",
    imageBefore: "/images/crack80.jpg",
    imageAfter: "/images/repair80.jpg",
  },
  {
    id: 110,
    lat: 37.2212,
    lng: 127.187486,
    name: "균열 110",
    desc: "망상균열",
    imageBefore: "/images/crack110.jpg",
    imageAfter: null,
  },
  {
    id: 130,
    lat: 37.22124,
    lng: 127.18773,
    name: "균열 130",
    desc: "선형균열",
    imageBefore: "/images/crack130.jpg",
    imageAfter: "/images/repair130.jpg",
  },
  {
    id: 160,
    lat: 37.221404,
    lng: 127.187829,
    name: "균열 160",
    desc: "기타손상",
    imageBefore: "/images/crack160.jpg",
    imageAfter: null,
  },
  {
    id: 190,
    lat: 37.22146,
    lng: 127.18806,
    name: "균열 190",
    desc: "망상균열",
    imageBefore: "/images/crack190.jpg",
    imageAfter: "/images/repair190.jpg",
  },
];

const getMarkerIcon = () => {
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: "#e74c3c",
    fillOpacity: 1,
    strokeColor: "white",
    strokeWeight: 2,
    scale: 1.8,
    labelOrigin: { x: 12, y: 9 },
  };
};

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCChGpVfC1kWBxgsikIZiwfdMLR7iA5kPw">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100vh" }}
        center={center}
        zoom={17}
      >
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
            boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
          }}
        >
          🚧 도로 균열 관리 시스템
        </div>

        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "12px",
            zIndex: 10,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            fontSize: "13px",
          }}
        >
          <div><strong>데이터 기준</strong></div>
          📷 2026-04-10 현장 촬영<br />
          🛠️ 2026-05-10 보수 시뮬레이션
        </div>

        {cracks.map((crack) => (
          <Marker
            key={crack.id}
            position={{ lat: crack.lat, lng: crack.lng }}
            icon={getMarkerIcon()}
            onClick={() => setSelected(crack)}
            label={{
              text: String(crack.id),
              color: "white",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ width: "400px" }}>
              <h3>{selected.name}</h3>

              <p>
                <strong>분류:</strong> {selected.desc}
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "50%" }}>
                  <p><strong>2026-04-10</strong></p>
                  <img
                    src={selected.imageBefore}
                    alt="현장 촬영 이미지"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </div>

                <div style={{ width: "50%" }}>
                  <p><strong>2026-05-10</strong></p>
                  {selected.imageAfter ? (
                    <img
                      src={selected.imageAfter}
                      alt="보수 시뮬레이션 이미지"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "150px",
                        backgroundColor: "#f1f1f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#777",
                        borderRadius: "8px",
                        textAlign: "center",
                        padding: "10px",
                      }}
                    >
                      보수 시뮬레이션 이미지<br />추후 추가 예정
                    </div>
                  )}
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;