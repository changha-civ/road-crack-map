import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const center = {
  lat: 37.2205,
  lng: 127.186,
};

const calcReduction = (before, after) => {
  if (before === 0) return "0.0";
  return (((before - after) / before) * 100).toFixed(1);
};

const cracks = [
  { id: 1, lat: 37.21913, lng: 127.18441, name: "균열 1", desc: "선형균열", beforeRate: 12, afterRate: 2, imageBefore: "/images/crack1.jpg", imageAfter: "/images/repair1.jpg" },
  { id: 2, lat: 37.218956, lng: 127.184314, name: "균열 2", desc: "선형균열", beforeRate: 10, afterRate: 0, imageBefore: "/images/crack2.jpg", imageAfter: "/images/repair2.jpg" },
  { id: 20, lat: 37.219648, lng: 127.184668, name: "균열 20", desc: "선형균열", beforeRate: 26, afterRate: 5, imageBefore: "/images/crack20.jpg", imageAfter: "/images/repair20.jpg" },
  { id: 40, lat: 37.22007, lng: 127.18572, name: "균열 40", desc: "망상균열", beforeRate: 61, afterRate: 28, imageBefore: "/images/crack40.jpg", imageAfter: "/images/repair40.jpg" },
  { id: 60, lat: 37.220271, lng: 127.18659, name: "균열 60", desc: "망상균열", beforeRate: 44, afterRate: 16, imageBefore: "/images/crack60.jpg", imageAfter: "/images/repair60.jpg" },
  { id: 80, lat: 37.22067, lng: 127.1868, name: "균열 80", desc: "선형균열", beforeRate: 42, afterRate: 25, imageBefore: "/images/crack80.jpg", imageAfter: "/images/repair80.jpg" },
  { id: 110, lat: 37.2212, lng: 127.187486, name: "균열 110", desc: "망상균열", beforeRate: 62, afterRate: 21, imageBefore: "/images/crack110.jpg", imageAfter: "/images/repair110.jpg" },
  { id: 130, lat: 37.22124, lng: 127.18773, name: "균열 130", desc: "선형균열", beforeRate: 32, afterRate: 9, imageBefore: "/images/crack130.jpg", imageAfter: "/images/repair130.jpg" },
  { id: 160, lat: 37.221404, lng: 127.187829, name: "균열 160", desc: "기타손상", beforeRate: 48, afterRate: 15, imageBefore: "/images/crack160.jpg", imageAfter: "/images/repair160.jpg" },
  { id: 190, lat: 37.22146, lng: 127.18806, name: "균열 190", desc: "망상균열", beforeRate: 54, afterRate: 23, imageBefore: "/images/crack190.jpg", imageAfter: "/images/repair190.jpg" },
];

const folderData = {
  before_repair: cracks.map((c) => `crack${c.id}.jpg`),
  after_repair: cracks.map((c) => `repair${c.id}.jpg`),
  crack_rate: cracks.map((c) => `crack${c.id}.txt`),
  coordinates: cracks.map((c) => `crack${c.id}.txt`),
  maintenance_history: cracks.map((c) => `crack${c.id}.txt`),
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

const previewBoxStyle = {
  marginTop: "5px",
  backgroundColor: "white",
  padding: "7px",
  borderRadius: "7px",
  fontSize: "12px",
  whiteSpace: "pre-wrap",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  color: "#111",
  fontWeight: "600",
};

const imageStyle = {
  width: "100%",
  marginTop: "5px",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

function App() {
  const [selected, setSelected] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [textContents, setTextContents] = useState({});

  useEffect(() => {
    if (!selectedFolder) return;

    const isTextFileFolder =
      selectedFolder === "crack_rate" ||
      selectedFolder === "maintenance_history";

    if (!isTextFileFolder) return;

    folderData[selectedFolder].forEach((file) => {
      fetch(`/road-crack-data/${selectedFolder}/${file}`)
        .then((res) => {
          if (!res.ok) throw new Error("파일 없음");
          return res.text();
        })
        .then((text) => {
          setTextContents((prev) => ({
            ...prev,
            [`${selectedFolder}/${file}`]: text,
          }));
        })
        .catch(() => {
          setTextContents((prev) => ({
            ...prev,
            [`${selectedFolder}/${file}`]: "파일 내용을 불러올 수 없습니다.",
          }));
        });
    });
  }, [selectedFolder]);

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
          🚧 도로 균열 관리 시스템
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
            width: "280px",
            color: "#111",
          }}
        >
          <div style={{ textAlign: "center", fontWeight: "bold", color: "#111" }}>
            데이터 기준
          </div>
          <div style={{ textAlign: "center", fontWeight: "600" }}>
            📷 2026-04-10 현장 촬영<br />
            🛠️ 2026-05-10 보수 시뮬레이션
          </div>

          <hr style={{ margin: "8px 0" }} />

          <div style={{ textAlign: "center", fontWeight: "bold", color: "#111" }}>
            최종 데이터 관리 구조
          </div>

          {Object.keys(folderData).map((folder) => (
            <div
              key={folder}
              onClick={() =>
                setSelectedFolder(selectedFolder === folder ? null : folder)
              }
              style={{
                cursor: "pointer",
                color: selectedFolder === folder ? "#e74c3c" : "#111",
                fontWeight: selectedFolder === folder ? "bold" : "600",
                padding: "2px 4px",
                borderRadius: "5px",
                backgroundColor: selectedFolder === folder ? "#fff0ec" : "transparent",
              }}
            >
              📁 {folder}
            </div>
          ))}

          {selectedFolder && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              <strong style={{ color: "#111" }}>{selectedFolder}</strong>

              {folderData[selectedFolder].map((file) => {
                const isImageFolder =
                  selectedFolder === "before_repair" ||
                  selectedFolder === "after_repair";

                const imagePath = isImageFolder
                  ? `/road-crack-data/${selectedFolder}/${file}`
                  : null;

                const textKey = `${selectedFolder}/${file}`;
                const crackId = file.replace("crack", "").replace(".txt", "");
                const crack = cracks.find((c) => String(c.id) === crackId);

                return (
                  <div
                    key={file}
                    style={{
                      marginTop: "8px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#111" }}>📄 {file}</div>

                    {isImageFolder ? (
                      <img src={imagePath} alt={file} style={imageStyle} />
                    ) : selectedFolder === "coordinates" ? (
                      <div style={previewBoxStyle}>
                        위도: {crack?.lat}
                        <br />
                        경도: {crack?.lng}
                      </div>
                    ) : (
                      <div style={previewBoxStyle}>
                        {textContents[textKey] || "불러오는 중..."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
            <div style={{ width: "430px", color: "#111" }}>
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "8px",
                  color: "#2c3e50",
                  borderBottom: "2px solid #eee",
                  paddingBottom: "6px",
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                {selected.name}
              </h2>

              <div
                style={{
                  textAlign: "center",
                  margin: "8px 0",
                  fontSize: "17px",
                  fontWeight: "bold",
                  color: "#111",
                }}
              >
                분류: {selected.desc}
              </div>

              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  textAlign: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  color: "#111",
                }}
              >
                <strong style={{ color: "#111", fontSize: "16px" }}>균열률 분석</strong><br />
                <span style={{ fontWeight: "bold", color: "#111" }}>
                  보수 전 균열률: {selected.beforeRate}%
                </span>
                <br />
                <span style={{ fontWeight: "bold", color: "#111" }}>
                  보수 후 균열률: {selected.afterRate}%
                </span>
                <br />
                <span style={{ color: "#27ae60", fontWeight: "bold", fontSize: "16px" }}>
                  감소율: {calcReduction(selected.beforeRate, selected.afterRate)}%
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "50%", textAlign: "center" }}>
                  <p><strong>보수 전</strong><br />2026-04-10</p>
                  <img
                    src={selected.imageBefore}
                    alt="현장 촬영 이미지"
                    style={imageStyle}
                  />
                </div>

                <div style={{ width: "50%", textAlign: "center" }}>
                  <p><strong>보수 후</strong><br />2026-05-10</p>
                  <img
                    src={selected.imageAfter}
                    alt="보수 시뮬레이션 이미지"
                    style={imageStyle}
                  />
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