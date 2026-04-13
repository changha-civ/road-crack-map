import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

const center = {
  lat: 37.2266,
  lng: 127.1872,
};

const cracks = [
  {
    id: 1,
    lat: 37.2266,
    lng: 127.1872,
    name: "균열 A",
    pci: 72,
    desc: "종방향 균열",
  },
  {
    id: 2,
    lat: 37.227,
    lng: 127.188,
    name: "균열 B",
    pci: 65,
    desc: "횡방향 균열",
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
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h3>{selected.name}</h3>
              <p>PCI: {selected.pci}</p>
              <p>{selected.desc}</p>
              <p>여기에 사진 넣을 예정</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;