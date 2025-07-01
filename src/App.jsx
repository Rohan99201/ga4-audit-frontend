import { useState } from "react";
import axios from "axios";
// No import needed for images in the public folder

function App() {
  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    setData(null); // Clear previous data
    try {
      const res = await axios.get("https://ga4-audit-backend.onrender.com/run-audit", {
        params: { property_id: propertyId, start_date: startDate, end_date: endDate },
      });
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.error || "An unknown error occurred during audit.");
      }
    } catch (err) {
      setError("Audit failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid p-5"
      style={{
        backgroundImage: `url('/ga4.jpg')`, // Directly reference the image from the public folder
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        className="container text-dark p-4 rounded shadow"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly more opaque for readability
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
            <button className="btn btn-primary w-100" onClick={runAudit} disabled={loading}>
              {loading ? "Running Audit..." : "Run Audit"}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="text-center text-secondary">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Fetching data from GA4 API, this may take a moment...</p>
          </div>
        )}

        {data &&
          Object.entries(data).map(([section, entries]) => (
            <div key={section} className="mb-5">
              <h3 className="text-secondary">{section}</h3>

              {/* Custom handling for transaction_mapping */}
              {section === "Transaction Mapping" ? (
                <div className="row">
                  <div className="col-md-6">
                    <h5>Transaction Revenue</h5>
                    <div className="table-responsive">
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
                  </div>

                  <div className="col-md-6">
                    <h5>Items in Purchase Events</h5>
                    <div className="table-responsive">
                      <table className="table table-bordered table-sm table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Transaction ID</th>
                            <th>Item ID</th>
                            <th>Item Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries
                            .filter((e) => e.source === "Item Table")
                            .map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.transactionId}</td>
                                <td>{entry.itemId}</td>
                                <td>{entry.itemName}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        {/* Headers for existing sections */}
                        {(section === "Property Details" ||
                          section === "Streams Configuration" ||
                          section === "GA4 Property Limits" ||
                          section === "GA4 Events" ||
                          section === "PII Check" ||
                          section === "Transactions") && (
                          <>
                            <th>Check</th>
                            <th>Result</th>
                          </>
                        )}
                        {/* Headers for new Custom Dimension Details */}
                        {section === "Custom Dimension Details" && (
                          <>
                            <th>Display Name</th>
                            <th>Parameter Name</th>
                            <th>Scope</th>
                          </>
                        )}
                        {/* Headers for new Key Event Details */}
                        {section === "Key Event Details" && (
                          <>
                            <th>Event Name</th>
                            <th>Create Time</th>
                            <th>Counting Method</th>
                          </>
                        )}
                        {/* Headers for other existing sections */}
                        {(section === "Transaction Where Item Data Missing" ||
                          section === "Purchase Events Log") && (
                          <>
                            <th>Transaction ID</th>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Revenue</th>
                          </>
                        )}
                        {section === "Duplicate Transactions" && (
                          <>
                            <th>Transaction ID</th>
                            <th>Count</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Render rows based on section type */}
                      {Array.isArray(entries) && entries.length > 0 ? (
                        entries.map((entry, index) => (
                          <tr key={index}>
                            {/* Rendering for existing sections */}
                            {(section === "Property Details" ||
                              section === "Streams Configuration" ||
                              section === "GA4 Property Limits" ||
                              section === "GA4 Events" ||
                              section === "PII Check" ||
                              section === "Transactions") && (
                              <>
                                <td>{entry.Check}</td>
                                <td>
                                  {typeof entry.Result === 'object' ? JSON.stringify(entry.Result) : entry.Result}
                                </td>
                              </>
                            )}
                            {/* Rendering for new Custom Dimension Details */}
                            {section === "Custom Dimension Details" && (
                              <>
                                <td>{entry.Check}</td> {/* Check holds Display Name */}
                                <td>{entry.Result['Parameter Name']}</td>
                                <td>{entry.Result['Scope']}</td>
                              </>
                            )}
                            {/* Rendering for new Key Event Details */}
                            {section === "Key Event Details" && (
                              <>
                                <td>{entry.Check}</td> {/* Check holds Event Name */}
                                <td>{entry.Result['Create Time']}</td>
                                <td>{entry.Result['Counting Method']}</td>
                              </>
                            )}
                            {/* Rendering for other existing sections */}
                            {(section === "Transaction Where Item Data Missing" ||
                              section === "Purchase Events Log") && (
                              <>
                                <td>{entry.transactionId}</td>
                                <td>{entry.itemId}</td>
                                <td>{entry.itemName}</td>
                                <td>{entry.revenue}</td>
                              </>
                            )}
                            {section === "Duplicate Transactions" && (
                              <>
                                <td>{entry.transactionId}</td>
                                <td>{entry.count}</td>
                              </>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={
                            section === "Custom Dimension Details" ? 3 :
                            section === "Key Event Details" ? 3 :
                            section === "Transaction Where Item Data Missing" || section === "Purchase Events Log" ? 4 :
                            section === "Duplicate Transactions" ? 2 :
                            2
                          }>
                            {typeof entries === 'string' ? entries : "No data or all checks passed."}
                          </td>
                        </tr>
                      )}
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
