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
    pci: 72,
    desc: "도로 균열",
    image: "/crack1.jpg",
  },
  {
    id: 40,
    lat: 37.22007,
    lng: 127.18572,
    name: "균열 40",
    pci: 70,
    desc: "도로 균열",
    image: "/crack40.jpg",
  },
  {
    id: 80,
    lat: 37.22067,
    lng: 127.1868,
    name: "균열 80",
    pci: 68,
    desc: "도로 균열",
    image: "/crack80.jpg",
  },
  {
    id: 130,
    lat: 37.22124,
    lng: 127.18773,
    name: "균열 130",
    pci: 66,
    desc: "도로 균열",
    image: "/crack130.jpg",
  },
  {
    id: 190,
    lat: 37.22146,
    lng: 127.18806,
    name: "균열 190",
    pci: 64,
    desc: "도로 균열",
    image: "/crack190.jpg",
  },
];

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCChGpVfC1kWBxgsikIZiwfdMLR7iA5kPw">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100vh" }}
        center={center}
        zoom={17}
      >
        {cracks.map((crack) => (
          <Marker
            key={crack.id}
            position={{ lat: crack.lat, lng: crack.lng }}
            onClick={() => setSelected(crack)}
            label={{
              text: String(crack.id),
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ width: "230px" }}>
              <h3 style={{ marginBottom: "8px" }}>{selected.name}</h3>

              <img
                src={selected.image}
                alt={selected.name}
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              />

              <p><strong>PCI:</strong> {selected.pci}</p>
              <p><strong>설명:</strong> {selected.desc}</p>
              <p><strong>위도:</strong> {selected.lat}</p>
              <p><strong>경도:</strong> {selected.lng}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;