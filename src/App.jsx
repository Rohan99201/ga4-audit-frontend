import { useState, useRef } from "react";
import axios from "axios";
// No import needed for images in the public folder
// html2canvas and jspdf are loaded via CDN in index.html

function App() {
  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null); // Ref for the report content to download

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

  const generateAuditSummary = (auditData) => {
    const summaryMessages = [];

    if (!auditData) {
      return ["No audit data available to generate a summary."];
    }

    // Check for Duplicate Transactions
    const duplicateTransactions = auditData["Duplicate Transactions"];
    if (Array.isArray(duplicateTransactions) && duplicateTransactions.length > 0) {
      summaryMessages.push("❌ Duplicate transactions found. Kindly check your e-commerce setup to prevent data discrepancies.");
    }

    // Check for Purchase with no item name
    const itemErrorTransactions = auditData["Transaction Where Item Data Missing"];
    if (Array.isArray(itemErrorTransactions) && itemErrorTransactions.length > 0) {
      summaryMessages.push("❌ Issues in e-commerce implementation: Purchase events detected with missing item names. Review your item tracking.");
    }

    // Check for PII
    const piiCheckResults = auditData["PII Check"];
    if (Array.isArray(piiCheckResults)) {
      const piiFound = piiCheckResults.some(
        (entry) => entry.Result && !entry.Result.includes("✅ No potential PII found")
      );
      if (piiFound) {
        summaryMessages.push("❌ Potential PII found in page paths or URLs. Kindly review this internally with your dev team to remove sensitive data.");
      }
    }

    // General health checks
    const settings = auditData["Property Details"];
    if (settings) {
        const currencyCheck = settings.find(s => s.Check === "Currency");
        if (currencyCheck && currencyCheck.Result === "(not set)") {
            summaryMessages.push("⚠️ Currency code is not set. Ensure your GA4 property currency is configured correctly.");
        }
    }

    const limits = auditData["GA4 Property Limits"];
    if (limits) {
        const customDimsUsed = limits.find(l => l.Check === "Custom Dimensions Used");
        if (customDimsUsed && parseInt(customDimsUsed.Result.split('/')[0]) >= 40) { // Warn if close to limit
            summaryMessages.push("⚠️ High number of Custom Dimensions used. Consider reviewing for optimization if approaching limits.");
        }
    }


    if (summaryMessages.length === 0) {
      summaryMessages.push("✅ Your GA4 property appears to be in good health based on the audit criteria. Keep up the good work!");
    }

    return summaryMessages;
  };

  const handleDownloadPdf = async () => {
    const input = reportRef.current;
    if (!input) {
      alert("Report content not found for PDF generation.");
      return;
    }

    setLoading(true); // Indicate loading for PDF generation
    try {
      const canvas = await html2canvas(input, { scale: 2 }); // Scale for better quality
      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' size
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
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
      alert("Failed to generate PDF: " + err.message);
    } finally {
      setLoading(false); // End loading
    }
  };


  return (
    <div
      className="container-fluid p-5"
      style={{
        // backgroundImage: `url('/ga4.jpg')`, // Directly reference the image from the public folder
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

        {data && (
          <>
            <div ref={reportRef}> {/* This div will be captured for PDF */}
              {Object.entries(data).map(([section, entries]) => (
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
                            entries.map((entry, index) => {
                              let resultCellContent = typeof entry.Result === 'object' ? JSON.stringify(entry.Result) : entry.Result;
                              let isWarning = false;

                              // Conditional styling for PII and Duplicate Transactions
                              if (section === "PII Check" && entry.Result && !entry.Result.includes("✅ No potential PII found")) {
                                isWarning = true;
                                resultCellContent = <span className="text-danger fw-bold">PII Found: {entry.Result}</span>;
                              } else if (section === "Transactions" && entry.Check === "Duplicate Transaction IDs" && Array.isArray(entry.Result) && entry.Result.length > 0) {
                                isWarning = true;
                                resultCellContent = <span className="text-danger fw-bold">Duplicate Transactions Found: {JSON.stringify(entry.Result)}</span>;
                              }


                              return (
                                <tr key={index}>
                                  {(section === "Property Details" ||
                                    section === "Streams Configuration" ||
                                    section === "GA4 Property Limits" ||
                                    section === "GA4 Events" ||
                                    section === "PII Check" ||
                                    section === "Transactions") && (
                                    <>
                                      <td>{entry.Check}</td>
                                      <td className={isWarning ? 'bg-danger-subtle' : ''}>{resultCellContent}</td>
                                    </>
                                  )}
                                  {(section === "Custom Dimension Details") && (
                                    <>
                                      <td>{entry.Check}</td>
                                      <td>{entry.Result['Parameter Name']}</td>
                                      <td>{entry.Result['Scope']}</td>
                                    </>
                                  )}
                                  {(section === "Key Event Details") && (
                                    <>
                                      <td>{entry.Check}</td>
                                      <td>{entry.Result['Create Time']}</td>
                                      <td>{entry.Result['Counting Method']}</td>
                                    </>
                                  )}
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
                              );
                            })
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

              {/* Audit Summary Section */}
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
            </div> {/* End of reportRef div */}

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
