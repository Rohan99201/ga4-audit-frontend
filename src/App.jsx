import { useState } from "react";
import axios from "axios";

function App() {
  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);

  const runAudit = async () => {
    try {
      const res = await axios.get("https://ga4-audit-backend.onrender.com/run-audit", {
        params: {
          property_id: propertyId,
          start_date: startDate,
          end_date: endDate,
        },
      });
      setData(res.data.data);
    } catch (err) {
      alert("Audit failed: " + err.message);
      console.error(err);
    }
  };

  const renderTable = (entries, type) => (
    <div className="table-responsive">
      <table className="table table-bordered table-sm table-hover">
        <thead className="table-light">
          <tr>
            {type === "transaction" ? (
              <>
                <th>Transaction ID</th>
                <th>Revenue</th>
              </>
            ) : type === "item" ? (
              <>
                <th>Transaction ID</th>
                <th>Item ID</th>
                <th>Item Name</th>
              </>
            ) : (
              <>
                <th>Check</th>
                <th>Result</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              {type === "transaction" && (
                <>
                  <td>{entry.transactionId}</td>
                  <td>{entry.revenue}</td>
                </>
              )}
              {type === "item" && (
                <>
                  <td>{entry.transactionId}</td>
                  <td>{entry.itemId}</td>
                  <td>
                    {entry.itemName === "(not set)" || !entry.itemName ? (
                      <span className="text-danger">⚠️ Not Set</span>
                    ) : (
                      entry.itemName
                    )}
                  </td>
                </>
              )}
              {!type && (
                <>
                  <td>{entry.Check || entry.transactionId || entry.itemId}</td>
                  <td>{entry.Result || entry.revenue || entry.itemName}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container-fluid p-5" style={{ background: "#f4f4f4", minHeight: "100vh" }}>
      <div className="container bg-white p-4 rounded shadow">
        <h1 className="text-primary mb-4 text-center">
          <img
            src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg"
            alt="GA4"
            width="30"
            className="me-2"
          />
          GA4 Audit Dashboard
        </h1>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="GA4 Property ID"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Start Date (YYYY-MM-DD)"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="End Date (YYYY-MM-DD)"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={runAudit}>
              Run Audit
            </button>
          </div>
        </div>

        {data ? (
          Object.entries(data).map(([section, entries]) => (
            <div key={section} className="mb-5">
              <h4 className="text-secondary mb-3">{section}</h4>
              {section === "Transaction Mapping"
                ? (
                    <>
                      <h6>Revenue Entries</h6>
                      {renderTable(entries.filter(e => e.source === "Revenue Table"), "transaction")}

                      <h6 className="mt-4">Item Entries</h6>
                      {renderTable(entries.filter(e => e.source === "Item Table"), "item")}
                    </>
                  )
                : renderTable(entries)}
            </div>
          ))
        ) : (
          <p className="text-muted text-center">Enter details and click "Run Audit" to begin.</p>
        )}
      </div>
    </div>
  );
}

export default App;
