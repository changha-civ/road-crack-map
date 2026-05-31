import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const CSV_URL = "https://docs.google.com/spreadsheets/d/1FlwEk0RewgYCFvmgU7qctDJwqDjS6eNP3hekUx5qlm4/export?format=csv";

const center = { lat: 37.2205, lng: 127.186 };

const calcReduction = (before, after) => {
  if (!before || before === 0) return "0.0";
  return (((before - after) / before) * 100).toFixed(1);
};

const getRiskInfo = (rate) => {
  const value = Number(rate || 0);
  if (value >= 5) return { label: "위험", icon: "🚨", color: "#e74c3c" };
  if (value >= 1) return { label: "주의", icon: "⚠️", color: "#f39c12" };
  return { label: "양호", icon: "🟢", color: "#27ae60" };
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

const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
};

function CrackRateGraph({ history }) {
  if (!history || history.length < 2) return null;

  const width = 460;
  const height = 220;
  const padding = 35;
  const maxRate = 10;

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
        <text x={padding - 8} y={padding + 4} textAnchor="end" fontSize="10">10%</text>
        <text x={padding - 8} y={height - padding + 4} textAnchor="end" fontSize="10">0%</text>

        <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#2c3e50" strokeWidth="3" />
        {points.map((p, index) => (
          <g key={index}>
            <circle cx={p.x} cy={p.y} r="6" fill={getRiskInfo(p.item.crack_rate).color} />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="12" fontWeight="700">{p.item.crack_rate}%</text>
            <text x={p.x} y={height - 10} textAnchor="middle" fontSize="11">{p.item.date?.slice(5)}</text>
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
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={getMarkerColor(type)} />
              <text x={x + barWidth / 2} y={y - 7} textAnchor="middle" fontSize="11" fontWeight="800">{count}개</text>
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10">{type.replace("균열", "")}</text>
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

  const width = 300;
  const height = 220;
  const padding = 35;
  const maxRate = 10;

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
        <text x={padding - 8} y={padding + 4} textAnchor="end" fontSize="10">10%</text>
        <text x={padding - 8} y={height - padding + 4} textAnchor="end" fontSize="10">0%</text>

        <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#2c3e50" strokeWidth="3" />
        {points.map((p, index) => (
          <g key={index}>
            <circle cx={p.x} cy={p.y} r="5" fill={getRiskInfo(p.item.avg).color} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="11" fontWeight="700">{p.item.avg.toFixed(1)}%</text>
            <text x={p.x} y={height - 9} textAnchor="middle" fontSize="10">{p.item.date.slice(5)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function App() {
  const [cracks, setCracks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showPanel, setShowPanel] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showStructure, setShowStructure] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [bouncingId, setBouncingId] = useState(null);

  const mapRef = useRef(null);
  const bounceTimerRef = useRef(null);

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error("구글시트 데이터를 불러올 수 없습니다.");
        return res.text();
      })
      .then((csvText) => {
        const rows = parseCSV(csvText);
        const grouped = {};

        rows.forEach((row) => {
          if (!row.location_id) return;

          if (!grouped[row.location_id]) {
            grouped[row.location_id] = {
              location_id: row.location_id,
              section: row.section,
              location_name: `${row.section}구간 ${row.location_id}`,
              lat: Number(row.lat),
              lng: Number(row.lng),
              history: [],
            };
          }

          grouped[row.location_id].history.push({
            date: row.date,
            event: row.event || "조사 데이터",
            crack_type: row.crack_type,
            crack_rate: Number(row.crack_rate),
            image: row.image_url,
            memo: row.memo || "구글시트 연동 데이터",
          });
        });

        setCracks(Object.values(grouped));
      })
      .catch((err) => console.error("구글시트 불러오기 실패:", err));
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
    setBouncingId(location.location_id);

    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);

    bounceTimerRef.current = setTimeout(() => {
      setBouncingId(null);
    }, 1400);

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
          <>
            <div style={{ position: "absolute", top: "115px", left: "12px", zIndex: 10, backgroundColor: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.25)", width: "210px", fontSize: "12px", lineHeight: "1.6", color: "#111" }}>
              <div style={{ fontWeight: "800", marginBottom: "7px", color: "#2c3e50", textAlign: "center" }}>⚠️ 위험도 기준</div>
              🟢 양호 0~1%<br />
              ⚠️ 주의 1~5%<br />
              🚨 위험 5% 이상

              <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #ddd" }} />

              <div style={{ fontWeight: "800", marginBottom: "6px", color: "#2c3e50", textAlign: "center" }}>📍 마커 범례</div>
              <span style={{ color: "#e74c3c", fontWeight: "bold" }}>●</span> 망상균열<br />
              <span style={{ color: "#f39c12", fontWeight: "bold" }}>●</span> 선형균열<br />
              <span style={{ color: "#3498db", fontWeight: "bold" }}>●</span> 기타손상
            </div>

            <div style={{ position: "absolute", bottom: "25px", left: "12px", zIndex: 10, backgroundColor: "white", padding: showStructure ? "10px" : "7px 10px", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.25)", width: "320px", maxHeight: showStructure ? "38vh" : "36px", overflowY: "auto", fontSize: "11px", lineHeight: "1.5", color: "#111" }}>
              <div onClick={() => setShowStructure(!showStructure)} style={{ fontWeight: "800", color: "#2c3e50", textAlign: "center", cursor: "pointer", lineHeight: "20px" }}>
                📁 종합 데이터 구조 <span style={{ fontSize: "15px", fontWeight: "900" }}>{showStructure ? "▲" : "▼"}</span>
              </div>

              {showStructure && (
                <>
                  {cracks.map((location) => {
                    const history = getSortedHistory(location);
                    return (
                      <div key={location.location_id} style={{ marginTop: "8px", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid #ddd" }}>
                        <strong>📍 {location.location_id}</strong> / {location.section}구간<br />
                        좌표: {location.lat}, {location.lng}
                        {history.map((item, index) => (
                          <div key={index} style={{ marginLeft: "6px", marginTop: "3px" }}>
                            🗓️ {item.date} └ {item.event} / {item.crack_type} / {item.crack_rate}%
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#333", textAlign: "center" }}>
                    ※ Google Sheets에 데이터를 추가하면 웹사이트 새로고침 시 자동 반영됩니다.
                  </div>
                </>
              )}
            </div>

            <div style={{ position: "absolute", top: "115px", right: "12px", zIndex: 10, backgroundColor: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.25)", width: "255px", fontSize: "12px", lineHeight: "1.55", color: "#111" }}>
              <div style={{ fontWeight: "800", marginBottom: "7px", color: "#2c3e50", textAlign: "center" }}>📂 데이터 관리 방식</div>
              📍 위치 기준 관리<br />
              🗓️ 날짜별 이력 저장<br />
              📊 균열률 변화 추적<br />
              🛠️ 보수 전/후 비교 가능<br />
              🧾 Google Sheets 자동 연동

              <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #ddd" }} />

              <div style={{ fontWeight: "800", marginBottom: "5px", color: "#2c3e50", textAlign: "center" }}>🧭 구간 관리 체계</div>
              A구간: 4공학관 ~ 건축관<br />
              B구간: 건축관 ~ 함박관<br />
              C구간: 함박관 ~ 체육관

              <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #ddd" }} />

              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="예: A-1"
                  style={{ flex: 1, height: "26px", padding: "4px 6px", border: "1px solid #ddd", borderRadius: "7px", fontSize: "12px", boxSizing: "border-box" }}
                />
                <button onClick={handleSearch} style={{ height: "26px", padding: "3px 8px", border: "none", borderRadius: "7px", backgroundColor: "#2c3e50", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  검색
                </button>
              </div>
            </div>

            <div style={{ position: "absolute", bottom: "25px", right: "12px", zIndex: 10, backgroundColor: "white", padding: showStats ? "10px" : "7px 10px", borderRadius: "12px", boxShadow: "0 3px 10px rgba(0,0,0,0.25)", width: "285px", maxHeight: showStats ? "60vh" : "36px", overflowY: "auto", fontSize: "12px", color: "#111" }}>
              <div onClick={() => setShowStats(!showStats)} style={{ fontWeight: "800", color: "#2c3e50", textAlign: "center", cursor: "pointer", lineHeight: "20px" }}>
                📊 전체 통계 및 그래프 <span style={{ fontSize: "15px", fontWeight: "900" }}>{showStats ? "▲" : "▼"}</span>
              </div>

              {showStats && (
                <>
                  <div style={{ marginTop: "8px", padding: "7px", backgroundColor: "#f7f7f7", borderRadius: "8px", fontWeight: "bold", textAlign: "center" }}>
                    등록 위치 수: {cracks.length}개<br />
                    평균 최신 균열률: {averageRate}%
                  </div>
                  <VerticalTypeBarChart typeCount={typeCount} />
                  <AverageRateLineChart cracks={cracks} getSortedHistory={getSortedHistory} />
                </>
              )}
            </div>
          </>
        )}

        {cracks.map((location) => {
          const history = getSortedHistory(location);
          const first = history[0];
          const markerColor = getMarkerColor(first?.crack_type);
          const isBouncing = bouncingId === location.location_id;

          return (
            <Marker
              key={location.location_id}
              position={{ lat: location.lat, lng: location.lng }}
              icon={getMarkerIcon(markerColor)}
              animation={isBouncing && window.google ? window.google.maps.Animation.BOUNCE : undefined}
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
                      최신 균열률: {latest?.crack_rate}% / 위험도: {risk.icon} {risk.label}
                    </div>
                    {history.length >= 2 && (
                      <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: "800", color: "#27ae60" }}>
                        감소율: {reduction}%
                      </div>
                    )}
                  </div>

                  <CrackRateGraph history={history} />

                  <div style={{ display: "flex", alignItems: "stretch", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "8px" }}>
                    {history.map((item, index) => {
                      const itemRisk = getRiskInfo(item.crack_rate);
                      return (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ minWidth: "190px", textAlign: "center", border: "2px solid #ddd", borderRadius: "10px", padding: "7px", backgroundColor: "#fff" }}>
                            <div style={{ fontSize: "15px", fontWeight: "800", color: "#2c3e50" }}>{item.date}</div>
                            <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "3px" }}>{item.event}</div>
                            <img src={item.image} alt={item.event} style={imageStyle} />
                            <div style={{ marginTop: "5px", fontSize: "12px", fontWeight: "700" }}>{item.crack_type}</div>
                            <div style={{ fontSize: "12px", fontWeight: "800", color: itemRisk.color }}>
                              균열률: {item.crack_rate}% / {itemRisk.icon} {itemRisk.label}
                            </div>
                          </div>

                          {index < history.length - 1 && (
                            <div style={{ fontSize: "24px", fontWeight: "900", color: "#2c3e50", display: "flex", alignItems: "center" }}>→</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ maxHeight: "115px", overflowY: "auto", borderTop: "1px solid #ddd", paddingTop: "7px" }}>
                    <strong>날짜별 유지관리 이력</strong>
                    {history.map((item, index) => {
                      const itemRisk = getRiskInfo(item.crack_rate);
                      return (
                        <div key={index} style={{ marginTop: "5px", padding: "6px", backgroundColor: "#f7f7f7", borderRadius: "7px", fontSize: "11px" }}>
                          🗓️ {item.date} | {item.event}<br />
                          균열 종류: {item.crack_type} / 균열률: {item.crack_rate}% / 위험도: {itemRisk.icon} {itemRisk.label}<br />
                          메모: {item.memo}
                        </div>
                      );
                    })}
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