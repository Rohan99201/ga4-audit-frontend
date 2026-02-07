import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  const checkExplanations = {
    "Display Name": "The user-friendly name of the GA4 property.",
    "Time Zone": "The time zone configured for the GA4 property, affecting report data.",
    "Currency": "The currency code set for the GA4 property, used for revenue metrics.",
    "User Data Collection Acknowledgment": "Indicates whether the required acknowledgment for user data collection terms has been successfully made for the property.",
    "Retention Period": "The duration for which user-level and event-level data is retained in GA4 before being automatically deleted.",
    "Custom Dimensions Used": "The number of custom dimensions currently configured out of the total allowed limit.",
    "Custom Metrics Used": "The number of custom metrics currently configured out of the total allowed limit.",
    "Key Events Used": "The number of key events (conversions) currently configured out of the total allowed limit.",
    "Audiences Used": "The number of audiences currently configured out of the total allowed limit.",
    "Event Inventory": "A list of events collected in the property and their respective counts.",
    "Potential PII in pagePath": "Indicates if potentially personally identifiable information (PII) like emails or phone numbers are found in page paths.",
    "Potential PII in pageLocation": "Indicates if potentially personally identifiable information (PII) like emails or phone numbers are found in page URLs.",
    "Scan Result": "Overall result of the PII scan.",
    "Total Unique transactionId": "The total count of distinct transaction IDs recorded.",
    "Duplicate Transaction Count": "The number of transaction IDs that appeared more than once.",
    "Duplicate Transaction IDs": "Lists specific transaction IDs that were recorded multiple times, indicating potential duplicate purchases.",
    "With Revenue but Missing Items": "Checks if there are transactions with recorded revenue but no associated item-level data.",
    "With Items but No Revenue": "Checks if there is item-level data recorded for transactions that have no overall revenue.",
    "Missing transactionId": "Indicates if purchase events are missing a transaction ID.",
    "Custom Dimension Display Name": "The user-friendly name of the custom dimension.",
    "Custom Dimension Parameter Name": "The technical parameter name used in event data.",
    "Custom Dimension Scope": "The scope of the custom dimension (e.g., Event, User).",
    "Key Event Name": "The name of the key event.",
    "Key Event Create Time": "The date when the key event was created.",
    "Key Event Counting Method": "The method used to count the key event.",
    "Check Column": "The specific audit check being performed in this category.",
    "Total Sessions": "Total number of sessions recorded in the selected period.",
    "Landing Page (not set) Sessions": "Number of sessions where the landing page was not captured.",
    "Landing Page (not set) %": "Percentage of sessions with an undefined landing page.",
    "Unassigned Sessions": "Sessions that GA4 could not attribute to a standard channel.",
    "Unassigned %": "Percentage of traffic classified as Unassigned.",
    "Source/Medium Count": "Number of unique source/medium combinations in unassigned traffic."
  };

  useEffect(() => {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
      if (window.bootstrap && window.bootstrap.Tooltip.getInstance(tooltip)) {
        window.bootstrap.Tooltip.getInstance(tooltip).dispose();
      }
    });

    const newTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    newTooltips.forEach(tooltip => {
      new window.bootstrap.Tooltip(tooltip);
    });

    return () => {
      newTooltips.forEach(tooltip => {
        if (window.bootstrap && window.bootstrap.Tooltip.getInstance(tooltip)) {
          window.bootstrap.Tooltip.getInstance(tooltip).dispose();
        }
      });
    };
  }, [data]);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setData(null);
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

  const generateAuditSummary = (auditData) => {
    const summaryMessages = [];
    if (!auditData) return ["No audit data available."];

    const duplicateTransactions = auditData["Duplicate Transactions"];
    if (Array.isArray(duplicateTransactions) && duplicateTransactions.length > 0) {
      summaryMessages.push("❌ Duplicate transactions found. Kindly check your e-commerce setup.");
    }

    const itemErrorTransactions = auditData["Transaction Where Item Data Missing"];
    if (Array.isArray(itemErrorTransactions) && itemErrorTransactions.length > 0) {
      summaryMessages.push("❌ Issues in e-commerce implementation: Purchase events with missing item names.");
    }

    const piiFound = auditData["PII Check"]?.some(e => e.Result && !e.Result.includes("✅"));
    if (piiFound) {
      summaryMessages.push("❌ Potential PII found in page paths. Review with dev team.");
    }

    const lpAnalysis = auditData["Landing Page Analysis"];
    const lpNotSetPercent = lpAnalysis?.find(e => e.Check === "Landing Page (not set) %")?.Result;
    if (lpNotSetPercent && parseFloat(lpNotSetPercent) > 10) {
      summaryMessages.push(`⚠️ High Landing Page (not set) rate (${lpNotSetPercent}). Check session_start event implementation.`);
    }

    const channelAnalysis = auditData["Channel Grouping Analysis"];
    const unassignedPercent = channelAnalysis?.find(e => e.Check === "Unassigned %")?.Result;
    if (unassignedPercent && parseFloat(unassignedPercent) > 10) {
      summaryMessages.push(`⚠️ High Unassigned traffic (${unassignedPercent}). Review your UTM parameters and Channel Grouping rules.`);
    }

    if (summaryMessages.length === 0) {
      summaryMessages.push("✅ GA4 property appears healthy based on current checks.");
    }
    return summaryMessages;
  };

  const handleDownloadPdf = async () => {
    const input = reportRef.current;
    if (!input) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('GA4_Audit_Report.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid p-5"
      style={{
        backgroundImage: 'radial-gradient( circle 232px at 10% 20%, rgba(251,238,115,0.74) 0%, rgba(241,195,87,0.74) 90% )',
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
          backgroundColor: "rgba(255, 255, 255, 0.9)",
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
            <p>Fetching data from GA4 API...</p>
          </div>
        )}

        {data && (
          <>
            <div ref={reportRef}>
              {Object.entries(data).map(([section, entries]) => {
                if (section === "Revenue Only Transactions" || section === "Items Only Transactions" || section === "Revenue Only Transactions" || section === "Items Only Transactions") {
                  return null;
                }
                
                const isArrayData = Array.isArray(entries);
                if (!isArrayData || entries.length === 0) return null;

                const displayEntries = entries.slice(0, 15);

                return (
                  <div key={section} className="mb-5">
                    <h3 className="text-secondary">{section}</h3>

                    {section === "Transaction Mapping" ? (
                      <div className="row">
                        <div className="col-md-6">
                          <h5>Transaction Revenue (Top 15)</h5>
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
                                  .slice(0, 15)
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
                          <h5>Items in Purchase Events (Top 15)</h5>
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
                                  .slice(0, 15)
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
                              {section === "Landing Page Data" && (
                                <>
                                  <th>Landing Page</th>
                                  <th>Sessions</th>
                                </>
                              )}
                              {section === "Channel Grouping Data" && (
                                <>
                                  <th>Channel Group</th>
                                  <th>Sessions</th>
                                </>
                              )}
                              {section === "Unassigned Source/Medium Data" && (
                                <>
                                  <th>Channel Group</th>
                                  <th>Source</th>
                                  <th>Medium</th>
                                  <th>Sessions</th>
                                </>
                              )}
                              {section === "Duplicate Transactions" && (
                                <>
                                  <th>Transaction ID</th>
                                  <th>Count</th>
                                </>
                              )}
                              {(section === "Property Details" || section === "Streams Configuration" || section === "GA4 Property Limits" || section === "GA4 Events" || section === "PII Check" || section === "Transactions" || section === "Landing Page Analysis" || section === "Channel Grouping Analysis" || section === "Unassigned Traffic Details") && (
                                <>
                                  <th>Check
                                    <i
                                      className="bi bi-info-circle-fill ms-2"
                                      data-bs-toggle="tooltip"
                                      data-bs-placement="top"
                                      title={checkExplanations["Check Column"]}
                                    ></i>
                                  </th>
                                  <th>Result</th>
                                </>
                              )}
                              {section === "Custom Dimension Details" && (
                                <>
                                  <th>Display Name</th>
                                  <th>Parameter Name</th>
                                  <th>Scope</th>
                                </>
                              )}
                              {section === "Key Event Details" && (
                                <>
                                  <th>Event Name</th>
                                  <th>Create Time</th>
                                  <th>Counting Method</th>
                                </>
                              )}
                              {section === "Transaction Where Item Data Missing" && (
                                <>
                                  <th>Transaction ID</th>
                                  <th>Item ID</th>
                                  <th>Item Name</th>
                                  <th>Revenue</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {displayEntries.map((entry, index) => {
                              let isWarning = false;
                              if (section === "PII Check" && entry.Result && !entry.Result.includes("✅")) isWarning = true;
                              if (section === "Transactions" && entry.Check === "With Revenue but Missing Items" && Array.isArray(entry.Result) && entry.Result.length > 0) isWarning = true;

                              return (
                                <tr key={index}>
                                  {section === "Landing Page Data" && (
                                    <>
                                      <td>{entry["Landing Page"]}</td>
                                      <td>{entry.Sessions}</td>
                                    </>
                                  )}
                                  {section === "Channel Grouping Data" && (
                                    <>
                                      <td>{entry["Channel Group"]}</td>
                                      <td>{entry.Sessions}</td>
                                    </>
                                  )}
                                  {section === "Unassigned Source/Medium Data" && (
                                    <>
                                      <td>{entry["Channel Group"]}</td>
                                      <td>{entry.Source}</td>
                                      <td>{entry.Medium}</td>
                                      <td>{entry.Sessions}</td>
                                    </>
                                  )}
                                  {section === "Duplicate Transactions" && (
                                    <>
                                      <td>{entry.transactionId}</td>
                                      <td>{entry.count}</td>
                                    </>
                                  )}
                                  {(section === "Property Details" || section === "Streams Configuration" || section === "GA4 Property Limits" || section === "GA4 Events" || section === "PII Check" || section === "Transactions" || section === "Landing Page Analysis" || section === "Channel Grouping Analysis" || section === "Unassigned Traffic Details") && (
                                    <>
                                      <td>
                                        {entry.Check}
                                        {checkExplanations[entry.Check] && (
                                          <i
                                            className="bi bi-info-circle-fill ms-2"
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="top"
                                            title={checkExplanations[entry.Check]}
                                          ></i>
                                        )}
                                      </td>
                                      <td className={isWarning ? 'bg-danger-subtle' : ''}>
                                        {typeof entry.Result === 'object' ? JSON.stringify(entry.Result) : entry.Result}
                                      </td>
                                    </>
                                  )}
                                  {section === "Custom Dimension Details" && (
                                    <>
                                      <td>{entry.Check}</td>
                                      <td>{entry.Result["Parameter Name"]}</td>
                                      <td>{entry.Result.Scope}</td>
                                    </>
                                  )}
                                  {section === "Key Event Details" && (
                                    <>
                                      <td>{entry.Check}</td>
                                      <td>{entry.Result["Create Time"]}</td>
                                      <td>{entry.Result["Counting Method"]}</td>
                                    </>
                                  )}
                                  {section === "Transaction Where Item Data Missing" && (
                                    <>
                                      <td>{entry.transactionId}</td>
                                      <td>{entry.itemId}</td>
                                      <td>{entry.itemName}</td>
                                      <td>{entry.revenue}</td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {entries.length > 15 && (
                          <div className="text-muted small">* Showing top 15 results</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {data["Revenue Only Transactions"] && data["Revenue Only Transactions"].length > 0 && (
                <div className="mb-5">
                  <h3 className="text-danger">Transactions with Revenue but Missing Item Data</h3>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm table-hover">
                      <thead className="table-light">
                        <tr><th>Transaction ID</th></tr>
                      </thead>
                      <tbody>
                        {data["Revenue Only Transactions"].slice(0, 15).map((tid, idx) => (
                          <tr key={idx}><td>{tid}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {data["Items Only Transactions"] && data["Items Only Transactions"].length > 0 && (
                <div className="mb-5">
                  <h3 className="text-danger">Transactions with Items but No Revenue Data</h3>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm table-hover">
                      <thead className="table-light">
                        <tr><th>Transaction ID</th></tr>
                      </thead>
                      <tbody>
                        {data["Items Only Transactions"].slice(0, 15).map((tid, idx) => (
                          <tr key={idx}><td>{tid}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-secondary">Audit Summary</h3>
                <ul className="list-group">
                  {generateAuditSummary(data).map((summary, index) => (
                    <li
                      key={index}
                      className={`list-group-item ${summary.startsWith('❌') ? 'list-group-item-danger' : summary.startsWith('⚠️') ? 'list-group-item-warning' : 'list-group-item-success'}`}
                    >
                      {summary}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-5">
              <button className="btn btn-success btn-lg" onClick={handleDownloadPdf} disabled={loading}>
                {loading ? "Generating PDF..." : "Download Audit Report (PDF)"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;