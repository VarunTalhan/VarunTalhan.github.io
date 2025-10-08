import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";

export default function TableWithTTS() {
  const [data, setData] = useState([]);
  const pressTimer = useRef(null);

  useEffect(() => {
    // Change the filename here if needed
    fetch("/test_data/noise_sine_wave.csv")
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: false });
        const tableData = parsed.data
          .filter((row) => row.length === 2 && row[0] && row[1])
          .map(([t, y]) => ({
            t,
            y,
            explanation: `At time ${parseFloat(t).toFixed(3)}, value is ${parseFloat(y).toFixed(3)}.`,
          }));
        setData(tableData);
      });
  }, []);

  const handleLongPress = (text) => {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const handleMouseDown = (text) => {
    pressTimer.current = setTimeout(() => {
      handleLongPress(text);
    }, 600); // 600ms long press threshold
  };

  const handleMouseUp = () => {
    clearTimeout(pressTimer.current);
  };

  if (data.length === 0) return <div>Loading data...</div>;

  return (
    <table border="1" style={{ borderCollapse: "collapse", margin: "20px auto", width: "80%" }}>
      <thead>
        <tr>
          <th>Time (t)</th>
          <th>Value (y)</th>
        </tr>
      </thead>
      <tbody>
        {data.map(({ t, y, explanation }, i) => (
          <tr key={i}>
            <td
              onMouseDown={() => handleMouseDown(explanation)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() => handleMouseDown(explanation)}
              onTouchEnd={handleMouseUp}
              style={{ cursor: "pointer", padding: "8px" }}
            >
              {t}
            </td>
            <td
              onMouseDown={() => handleMouseDown(explanation)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() => handleMouseDown(explanation)}
              onTouchEnd={handleMouseUp}
              style={{ cursor: "pointer", padding: "8px" }}
            >
              {y}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
