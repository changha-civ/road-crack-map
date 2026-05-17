import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const center = {
  lat: 37.2205,
  lng: 127.186,
};

const calcReduction = (before, after) => {
  if (!before || before === 0) return "0.0";
  return (((before - after) / before) * 100).toFixed(1);
};

const getMarkerIcon = () => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: "#e74c3c",
  fillOpacity: 1,
  strokeColor: "white",
  strokeWeight: 2,
  scale: 1.8,
  labelOrigin: { x: 12, y: 9 },
});

const imageStyle = {
  width: "100%",
  marginTop: "5px",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

function App() {
  const [cracks, setCracks] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/data/cracks.json")
      .then((res) => {
        if (!res.ok) throw new Error("cracks.json 파일을 불러올 수 없습니다.");
        return res.json();
      })
      .then((data) => setCracks(data))
      .catch((err) => console.error("JSON 불러오기 실패:", err));
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCChGpVfC1kWBxgsikIZiwfdMLR7iA5kPw">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100vh" }}
        center={center}
        zoom={17}
        mapTypeId="satellite"
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
            padding: "11px 22px",
            borderRadius: "14px",
            fontWeight: "bold",
            fontSize: "18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
          }}
        >
          🚧 도로 균열 유지관리 시스템
        </div>

        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "12px",
            zIndex: 10,
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
            fontSize: "13px",
            lineHeight: "1.6",
            width: "290px",
            color: "#111",
          }}
        >
          <div style={{ textAlign: "center", fontWeight: "bold" }}>
            데이터 관리 방식
          </div>

          <hr style={{ margin: "8px 0" }} />

          <div>
            📍 위치 기준 관리<br />
            🗓️ 날짜별 이력 저장<br />
            📊 균열률 변화 추적<br />
            🛠️ 보수 전/후 비교 가능
          </div>

          <hr style={{ margin: "8px 0" }} />

          <div style={{ fontWeight: "bold" }}>
            등록 위치 수: {cracks.length}개
          </div>

          <div style={{ marginTop: "6px", fontSize: "12px", color: "#333" }}>
            ※ public/data/cracks.json 파일에 데이터를 추가하면 지도에 자동 반영됩니다.
          </div>
        </div>

        {cracks.map((location) => (
          <Marker
            key={location.location_id}
            position={{ lat: location.lat, lng: location.lng }}
            icon={getMarkerIcon()}
            onClick={() => setSelected(location)}
            label={{
              text: location.location_id,
              color: "white",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          />
        ))}

        {selected && (() => {
          const history = selected.history || [];
          const first = history[0];
          const latest = history[history.length - 1];

          return (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ width: "460px", color: "#111" }}>
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: "8px",
                    color: "#2c3e50",
                    borderBottom: "2px solid #eee",
                    paddingBottom: "6px",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  {selected.location_id} | {selected.location_name}
                </h2>

                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    textAlign: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  <strong style={{ fontSize: "16px" }}>최신 상태</strong>
                  <br />
                  날짜: {latest?.date}
                  <br />
                  이벤트: {latest?.event}
                  <br />
                  균열 종류: {latest?.crack_type}
                  <br />
                  균열률: {latest?.crack_rate}%
                </div>

                {first && latest && history.length >= 2 && (
                  <div
                    style={{
                      backgroundColor: "#ecf9f1",
                      padding: "10px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    보수 전 균열률: {first.crack_rate}%<br />
                    보수 후 균열률: {latest.crack_rate}%<br />
                    <span style={{ color: "#27ae60", fontSize: "16px" }}>
                      감소율: {calcReduction(first.crack_rate, latest.crack_rate)}%
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  {history.map((item, index) => (
                    <div key={index} style={{ width: `${100 / history.length}%`, textAlign: "center" }}>
                      <p style={{ margin: "4px 0", fontWeight: "bold" }}>
                        {item.event}
                        <br />
                        {item.date}
                      </p>
                      <img src={item.image} alt={item.event} style={imageStyle} />
                      <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "600" }}>
                        {item.crack_type} / {item.crack_rate}%
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    borderTop: "1px solid #ddd",
                    paddingTop: "8px",
                  }}
                >
                  <strong>날짜별 유지관리 이력</strong>
                  {history.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginTop: "6px",
                        padding: "7px",
                        backgroundColor: "#f7f7f7",
                        borderRadius: "7px",
                        fontSize: "12px",
                      }}
                    >
                      🗓️ {item.date} | {item.event}
                      <br />
                      분류: {item.crack_type} / 균열률: {item.crack_rate}%
                      <br />
                      메모: {item.memo}
                    </div>
                  ))}
                </div>
              </div>
            </InfoWindow>
          );
        })()}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;