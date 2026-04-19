import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const crackData = [
  {
    id: 1,
    name: "1번 균열",
    image: "/crack1.jpg",
    lat: 37.21913,
    lng: 127.18441,
    type: "도로 균열",
    desc: "균열이 관찰된 지점",
  },
  {
    id: 40,
    name: "40번 균열",
    image: "/crack40.jpg",
    lat: 37.22007,
    lng: 127.18572,
    type: "도로 균열",
    desc: "균열이 관찰된 지점",
  },
  {
    id: 80,
    name: "80번 균열",
    image: "/crack80.jpg",
    lat: 37.22067,
    lng: 127.1868,
    type: "도로 균열",
    desc: "균열이 관찰된 지점",
  },
  {
    id: 130,
    name: "130번 균열",
    image: "/crack130.jpg",
    lat: 37.22124,
    lng: 127.18773,
    type: "도로 균열",
    desc: "균열이 관찰된 지점",
  },
  {
    id: 190,
    name: "190번 균열",
    image: "/crack190.jpg",
    lat: 37.22146,
    lng: 127.18806,
    type: "도로 균열",
    desc: "균열이 관찰된 지점",
  },
];

export default function CrackMap() {
  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h2>도로 균열 지도 시각화</h2>

      <MapContainer
        center={[37.2205, 127.186]}
        zoom={17}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {crackData.map((data) => (
          <Marker key={data.id} position={[data.lat, data.lng]}>
            <Popup>
              <div style={{ width: "220px" }}>
                <h3>{data.name}</h3>
                <img
                  src={data.image}
                  alt={data.name}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
                <p><strong>유형:</strong> {data.type}</p>
                <p><strong>설명:</strong> {data.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}