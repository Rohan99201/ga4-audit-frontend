import React, { useState } from "react";

function App() {
  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState("30daysAgo");
  const [endDate, setEndDate] = useState("today");
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState("");

  const runAudit = async () => {
    if (!propertyId) return alert("Enter Property ID");
    setLoading(true);
    setError("");
    setAuditData(null);
    try {
      const res = await fetch("https://ga4-audit-backend.onrender.com/run-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: propertyId, start_date: startDate, end_date: endDate })
      });
      const data = await res.json();
      if (data.success) setAuditData(data.data);
      else setError("Something went wrong");
    } catch (e) {
      setError("API Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🔍 GA4 Audit Tool</h1>
      <input
        type="text"
        placeholder="GA4 Property ID"
        value={propertyId}
        onChange={(e) => setPropertyId(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "1rem" }}
      />
      <input
        type="text"
        placeholder="Start Date (e.g. 30daysAgo)"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "1rem" }}
      />
      <input
        type="text"
        placeholder="End Date (e.g. today)"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "1rem" }}
      />
      <button onClick={runAudit} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
        {loading ? "Running..." : "Run Audit"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {auditData &&
        Object.entries(auditData).map(([section, rows]) => (
          <div key={section} style={{ marginTop: "2rem" }}>
            <h2>{section}</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {Object.keys(rows[0] || {}).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}

export default App;
