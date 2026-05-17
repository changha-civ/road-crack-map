import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const center = { lat: 37.2205, lng: 127.186 };

const calcReduction = (before, after) => {
  if (!before || before === 0) return "0.0";
  return (((before - after) / before) * 100).toFixed(1);
};

const getRiskInfo = (rate) => {
  if (rate >= 30) return { label: "위험", color: "#e74c3c" };
  if (rate >= 10) return { label: "주의", color: "#f39c12" };
  return { label: "양호", color: "#27ae60" };
};

const getMarkerColor = (type) => {
  if (type?.includes("망상")) return "#e74c3c";
  if (type?.includes("선형")) return "#f39c12";
  if (type?.includes("기타")) return "#3498db";
  return "#8e44ad";
};

const getMarkerIcon = (color) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "white",
  strokeWeight: 2,
  scale: 1.8,
  labelOrigin: { x: 12, y: 9 },
});

const imageStyle = {
  width: "100%",
  height: "180px",
  objectFit: "cover",
  marginTop: "6px",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

function CrackRateGraph({ history }) {
  if (!history || history.length < 2) return null;

  const width = 420;
  const height = 130;
  const padding = 28;
  const maxRate = Math.max(...history.map((h) => Number(h.crack_rate || 0)), 40);

  const points = history.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(history.length - 1, 1);
    const y = height - padding - (Number(item.crack_rate || 0) / maxRate) * (height - padding * 2);
    return { x, y, item };
  });

  return (
    <div style={{ marginBottom: "10px", padding: "8px", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px solid #ddd" }}>
      <div style={{ fontWeight: "800", fontSize: "13px", marginBottom: "4px" }}>📈 위치별 균열률 변화</div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#bbb" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#bbb" />
        <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#2c3e50" strokeWidth="3" />
        {points.map((p, index) => (
          <g key={index}>
            <circle cx={p.x} cy={p.y} r="5" fill={getRiskInfo(p.item.crack_rate).color} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="11" fontWeight="700">{p.item.crack_rate}%</text>
            <text x={p.x} y={height - 8} textAnchor="middle" fontSize="10">{p.item.date.slice(5)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function VerticalTypeBarChart({ typeCount }) {
  const entries = Object.entries(typeCount);
  if (entries.length === 0) return null;

  const max = Math.max(...entries.map(([, count]) => count), 1);
  const width = 250;
  const height = 150;
  const padding = 28;
  const barWidth = 38;

  return (
    <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#f7f7f7", borderRadius: "8px" }}>
      <strong>📊 균열 종류 세로 막대그래프</strong>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#bbb" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#bbb" />

        {entries.map(([type, count], index) => {
          const gap = (width - padding * 2) / entries.length;
          const x = padding + gap * index + gap / 2 - barWidth / 2;
          const barHeight = (count / max) * (height - padding * 2);
          const y = height - padding - barHeight;

          return (
            <g key={type}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="5"
                fill={getMarkerColor(type)}
              />
              <text x={x + barWidth / 2} y={y - 7} textAnchor="middle" fontSize="11" fontWeight="800">
                {count}개
              </text>
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10">
                {type.replace("균열", "")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function AverageRateLineChart({ cracks, getSortedHistory }) {
  const dateMap = {};

  cracks.forEach((location) => {
    getSortedHistory(location).forEach((item) => {
      if (!dateMap[item.date]) dateMap[item.date] = [];
      dateMap[item.date].push(Number(item.crack_rate || 0));
    });
  });

  const data = Object.entries(dateMap)
    .map(([date, rates]) => ({
      date,
      avg: rates.reduce((a, b) => a + b, 0) / rates.length,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (data.length < 2) return null;

  const width = 250;
  const height = 115;
  const padding = 25;
  const maxRate = Math.max(...data.map((d) => d.avg), 40);

  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - (item.avg / maxRate) * (height - padding * 2);
    return { x, y, item };
  });

  return (
    <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#f7f7f7", borderRadius: "8px" }}>
      <strong>📈 전체 평균 균열률 변화</strong>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#bbb" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#bbb" />
        <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#2c3e50" strokeWidth="3" />

        {points.map((p, index) => (
          <g key={index}>
            <circle cx={p.x} cy={p.y} r="4" fill={getRiskInfo(p.item.avg).color} />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fontWeight="700">
              {p.item.avg.toFixed(1)}%
            </text>
            <text x={p.x} y={height - 7} textAnchor="middle" fontSize="9">
              {p.item.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function App() {
  const [cracks, setCracks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDataStructure, setShowDataStructure] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  const [searchText, setSearchText] = useState("");
  const mapRef = useRef(null);

  useEffect(() => {
    fetch("/data/cracks.json")
      .then((res) => {
        if (!res.ok) throw new Error("cracks.json 파일을 불러올 수 없습니다.");
        return res.json();
      })
      .then((data) => setCracks(data))
      .catch((err) => console.error("JSON 불러오기 실패:", err));
  }, []);

  const getSortedHistory = (location) =>
    [...(location.history || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  const latestData = cracks.map((location) => {
    const history = getSortedHistory(location);
    return history[history.length - 1];
  });

  const averageRate =
    latestData.length > 0
      ? (latestData.reduce((sum, item) => sum + Number(item?.crack_rate || 0), 0) / latestData.length).toFixed(1)
      : "0.0";

  const typeCount = latestData.reduce((acc, item) => {
    const type = item?.crack_type || "기타";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const selectLocation = (location) => {
    setSelected(location);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: location.lat, lng: location.lng });
      mapRef.current.setZoom(19);
    }
  };

  const handleSearch = () => {
    const keyword = searchText.trim().toUpperCase();
    if (!keyword) return;

    const found = cracks.find(
      (location) =>
        location.location_id.toUpperCase().includes(keyword) ||
        location.location_name?.toUpperCase().includes(keyword)
    );

    if (found) selectLocation(found);
    else alert("해당 위치를 찾을 수 없습니다.");
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyCChGpVfC1kWBxgsikIZiwfdMLR7iA5kPw">
      <GoogleMap
        onLoad={(map) => (mapRef.current = map)}
        mapContainerStyle={{ width: "100%", height: "100vh" }}
        center={center}
        zoom={17}
        mapTypeId="satellite"
      >
        <div style={{ position: "absolute", top: "18px", left: "50%", transform: "translateX(-50%)", zIndex: 10, backgroundColor: "#2c3e50", color: "white", padding: "10px 20px", borderRadius: "14px", fontWeight: "bold", fontSize: "17px", boxShadow: "0 4px 12px rgba(0,0,0,0.35)" }}>
          🚧 도로 균열 유지관리 시스템
        </div>

        <button onClick={() => setShowPanel(!showPanel)} style={{ position: "absolute", top: "75px", right: "12px", zIndex: 11, padding: "7px 12px", borderRadius: "10px", border: "none", backgroundColor: "#2c3e50", color: "white", fontWeight: "bold", cursor: "pointer" }}>
          {showPanel ? "패널 접기" : "패널 보기"}
        </button>

        {showPanel && (
          <div style={{ position: "absolute", top: "115px", right: "12px", zIndex: 10, backgroundColor: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.25)", fontSize: "12px", lineHeight: "1.55", width: "280px", color: "#111", maxHeight: "78vh", overflowY: "auto" }}>
            <div style={{ textAlign: "center", fontWeight: "bold" }}>데이터 관리 방식</div>

            <hr style={{ margin: "7px 0" }} />

            <div>
              📍 위치 기준 관리<br />
              🗓️ 날짜별 이력 저장<br />
              📊 균열률 변화 추적<br />
              🛠️ 보수 전/후 비교 가능
            </div>

            <hr style={{ margin: "7px 0" }} />

            <div style={{ fontWeight: "bold" }}>
              등록 위치 수: {cracks.length}개<br />
              평균 최신 균열률: {averageRate}%
            </div>

            <button
              onClick={() => setShowStatistics(!showStatistics)}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "7px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#f7f7f7",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              📊 전체 통계 {showStatistics ? "접기" : "보기"}
            </button>

            {showStatistics && (
              <>
                <VerticalTypeBarChart typeCount={typeCount} />
                <AverageRateLineChart cracks={cracks} getSortedHistory={getSortedHistory} />
              </>
            )}

            <div style={{ marginTop: "7px", padding: "7px", backgroundColor: "#f7f7f7", borderRadius: "8px" }}>
              <strong>위험도 기준</strong><br />
              <span style={{ color: "#27ae60", fontWeight: "bold" }}>● 양호</span> 0~10%<br />
              <span style={{ color: "#f39c12", fontWeight: "bold" }}>● 주의</span> 10~30%<br />
              <span style={{ color: "#e74c3c", fontWeight: "bold" }}>● 위험</span> 30% 이상
            </div>

            <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="예: A-40" style={{ flex: 1, padding: "6px", border: "1px solid #ddd", borderRadius: "7px", fontSize: "12px" }} />
              <button onClick={handleSearch} style={{ padding: "6px 9px", border: "none", borderRadius: "7px", backgroundColor: "#2c3e50", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>검색</button>
            </div>

            <div style={{ marginTop: "8px", padding: "7px", backgroundColor: "#fafafa", borderRadius: "8px", fontSize: "11px" }}>
              <strong>마커 범례</strong><br />
              <span style={{ color: "#e74c3c", fontWeight: "bold" }}>●</span> 망상균열&nbsp;
              <span style={{ color: "#f39c12", fontWeight: "bold" }}>●</span> 선형균열&nbsp;
              <span style={{ color: "#3498db", fontWeight: "bold" }}>●</span> 기타손상
            </div>

            <button onClick={() => setShowDataStructure(!showDataStructure)} style={{ marginTop: "8px", width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f7f7f7", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
              📁 종합 데이터 구조 {showDataStructure ? "접기" : "보기"}
            </button>

            {showDataStructure && (
              <div style={{ marginTop: "8px", maxHeight: "180px", overflowY: "auto", backgroundColor: "#f8f8f8", padding: "8px", borderRadius: "8px", fontSize: "11px", lineHeight: "1.5" }}>
                {cracks.map((location) => {
                  const history = getSortedHistory(location);
                  return (
                    <div key={location.location_id} style={{ marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid #ddd" }}>
                      <strong>📍 {location.location_id}</strong><br />
                      좌표: {location.lat}, {location.lng}
                      {history.map((item, index) => (
                        <div key={index} style={{ marginLeft: "6px", marginTop: "3px" }}>
                          🗓️ {item.date}<br />└ {item.crack_type} / {item.crack_rate}%
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: "6px", fontSize: "11px", color: "#333" }}>
              ※ public/data/cracks.json 파일에 데이터를 추가하면 지도에 자동 반영됩니다.
            </div>
          </div>
        )}

        {cracks.map((location) => {
          const history = getSortedHistory(location);
          const first = history[0];
          const markerColor = getMarkerColor(first?.crack_type);

          return (
            <Marker
              key={location.location_id}
              position={{ lat: location.lat, lng: location.lng }}
              icon={getMarkerIcon(markerColor)}
              onClick={() => selectLocation(location)}
              label={{ text: location.location_id, color: "white", fontSize: "10px", fontWeight: "bold" }}
            />
          );
        })}

        {selected &&
          (() => {
            const history = getSortedHistory(selected);
            const first = history[0];
            const latest = history[history.length - 1];
            const risk = getRiskInfo(latest?.crack_rate);
            const reduction = first && latest ? calcReduction(first.crack_rate, latest.crack_rate) : "0.0";

            return (
              <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
                <div style={{ width: "460px", color: "#111" }}>
                  <h2 style={{ marginTop: 0, marginBottom: "8px", color: "#2c3e50", borderBottom: "2px solid #eee", paddingBottom: "6px", textAlign: "center", fontSize: "20px", fontWeight: "800" }}>
                    {selected.location_id}
                  </h2>

                  <div style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "10px", marginBottom: "10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontSize: "19px", fontWeight: "800", color: "#2c3e50" }}>{latest?.date}</div>
                    <div style={{ marginTop: "7px", fontSize: "14px", fontWeight: "700" }}>균열 종류: {first?.crack_type}</div>
                    <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: "800", color: risk.color }}>
                      최신 균열률: {latest?.crack_rate}% / 위험도: {risk.label}
                    </div>
                    {history.length >= 2 && (
                      <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: "800", color: "#27ae60" }}>
                        감소율: {reduction}%
                      </div>
                    )}
                  </div>

                  <CrackRateGraph history={history} />

                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "8px" }}>
                    {history.map((item, index) => {
                      const itemRisk = getRiskInfo(item.crack_rate);
                      return (
                        <div key={index} style={{ minWidth: "190px", textAlign: "center", border: `2px solid ${itemRisk.color}`, borderRadius: "10px", padding: "7px", backgroundColor: "#fff" }}>
                          <div style={{ fontSize: "15px", fontWeight: "800", color: "#2c3e50" }}>{item.date}</div>
                          <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "3px" }}>{item.event}</div>
                          <img src={item.image} alt={item.event} style={imageStyle} />
                          <div style={{ marginTop: "5px", fontSize: "12px", fontWeight: "700" }}>{item.crack_type}</div>
                          <div style={{ fontSize: "12px", fontWeight: "800", color: itemRisk.color }}>
                            균열률: {item.crack_rate}% / {itemRisk.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ maxHeight: "115px", overflowY: "auto", borderTop: "1px solid #ddd", paddingTop: "7px" }}>
                    <strong>날짜별 유지관리 이력</strong>
                    {history.map((item, index) => (
                      <div key={index} style={{ marginTop: "5px", padding: "6px", backgroundColor: "#f7f7f7", borderRadius: "7px", fontSize: "11px" }}>
                        🗓️ {item.date} | {item.event}<br />
                        균열 종류: {item.crack_type} / 균열률: {item.crack_rate}% / 위험도: {getRiskInfo(item.crack_rate).label}<br />
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