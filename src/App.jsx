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
        params: { property_id: propertyId, start_date: startDate, end_date: endDate },
      });
      setData(res.data.data);
    } catch (err) {
      alert("Audit failed: " + err.message);
    }
  };

  return (
    <div
      className="container-fluid p-5"
      style={{
        backgroundImage: url('/ga4.jpg'),
        backgroundSize: "cover",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <div   className="container text-dark p-4 rounded shadow"
  style={{
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(8px)",
  }}
>
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

        {data &&
          Object.entries(data).map(([section, entries]) => (
            <div key={section} className="mb-5">
              <h3 className="text-secondary">{section}</h3>

              {/* Custom handling for transaction_mapping */}
              {section === "transaction_mapping" ? (
                <div className="row">
                  <div className="col-md-6">
                    <h5>Transaction Revenue</h5>
                    <table className="table table-bordered table-sm table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Transaction ID</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries
                          .filter((e) => e.source === "Revenue Table")
                          .map((entry, index) => (
                            <tr key={index}>
                              <td>{entry.transactionId}</td>
                              <td>{entry.revenue}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="col-md-6">
                    <h5>Items in Purchase Events</h5>
                    <table className="table table-bordered table-sm table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Item ID</th>
                          <th>Item Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries
                          .filter((e) => e.source === "Item Table")
                          .map((entry, index) => (
                            <tr key={index}>
                              <td>{entry.itemId}</td>
                              <td>{entry.itemName}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Check</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={index}>
                          <td>{entry.Check || entry.transactionId || entry.itemId}</td>
                          <td>{entry.Result || entry.revenue || entry.itemName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;

app.jsx