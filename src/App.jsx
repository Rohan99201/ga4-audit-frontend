import { useState, useRef, useEffect } from "react";
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

  // Define explanations for each check
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
    "With Revenue but Missing Items": "Checks if there are transactions with recorded revenue but no associated item-level data. This means the transaction ID appeared in revenue reports but not at all in item reports.",
    "With Items but No Revenue": "Checks if there is item-level data recorded for transactions that have no overall revenue, or where item revenue doesn't match total transaction revenue.",
    "Missing transactionId": "Indicates if purchase events are missing a transaction ID.",
    // Custom Dimension Details Specific Headers
    "Custom Dimension Display Name": "The user-friendly name of the custom dimension.",
    "Custom Dimension Parameter Name": "The technical parameter name used in event data for the custom dimension.",
    "Custom Dimension Scope": "The scope of the custom dimension (e.g., Event, User).",
    // Key Event Details Specific Headers
    "Key Event Name": "The name of the key event.",
    "Key Event Create Time": "The date and time when the key event was created.",
    "Key Event Counting Method": "The method used to count the key event (e.g., Once Per Event, Once Per Session).",
    // General 'Check' column explanation for sections where it's the primary column
    // "Check Column": "The specific audit check being performed in this category."
  };

  // Initialize tooltips after component mounts or data changes
  useEffect(() => {
    // Destroy existing tooltips to prevent duplicates
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
      if (window.bootstrap && window.bootstrap.Tooltip.getInstance(tooltip)) {
        window.bootstrap.Tooltip.getInstance(tooltip).dispose();
      }
    });

    // Initialize new tooltips
    const newTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    newTooltips.forEach(tooltip => {
      new window.bootstrap.Tooltip(tooltip);
    });

    // Clean up tooltips on unmount
    return () => {
      newTooltips.forEach(tooltip => {
        if (window.bootstrap && window.bootstrap.Tooltip.getInstance(tooltip)) {
          window.bootstrap.Tooltip.getInstance(tooltip).dispose();
        }
      });
    };
  }, [data]); // Re-initialize when data changes

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

    // Check for Purchase with no item name or ID
    const itemErrorTransactions = auditData["Transaction Where Item Data Missing"];
    if (Array.isArray(itemErrorTransactions) && itemErrorTransactions.length > 0) {
      summaryMessages.push("❌ Issues in e-commerce implementation: Purchase events detected with missing item names or IDs. Review your item tracking.");
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

    // Check for transactions with revenue but no items (completely missing from item report)
    const transactionsSection = auditData["Transactions"];
    if (Array.isArray(transactionsSection)) {
        const missingInItemsEntry = transactionsSection.find(e => e.Check === "With Revenue but Missing Items");
        if (missingInItemsEntry && missingInItemsEntry.Result && !missingInItemsEntry.Result.includes("✅ All revenue transactions are linked to items.")) {
            summaryMessages.push("❌ Transactions with revenue but no associated item data found. This indicates a potential gap in your e-commerce item tracking.");
        }
    }

    // Check for items with no revenue
    if (Array.isArray(transactionsSection)) {
        const missingInTxnsEntry = transactionsSection.find(e => e.Check === "With Items but No Revenue");
        if (missingInTxnsEntry && missingInTxnsEntry.Result && !missingInTxnsEntry.Result.includes("✅ All item transactions have matching revenue data.")) {
            summaryMessages.push("❌ Item data found without matching transaction revenue. Ensure all purchase events are correctly sending total revenue.");
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
        backgroundImage: 'radial-gradient( circle 232px at 10% 20%,  rgba(251,238,115,0.74) 0%, rgba(241,195,87,0.74) 90% )',
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
              placeholder="GA4 Property ID (e.g., 343819188)"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Start Date (e.g., 30daysAgo orYYYY-MM-DD)"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="End Date (e.g., today orYYYY-MM-DD)"
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
                                <th>Check
                                  <i
                                    className="bi bi-info-circle-fill ms-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={checkExplanations["Check Column"]} /* General explanation for 'Check' column */
                                  ></i>
                                </th>
                                <th>Result</th>
                              </>
                            )}
                            {/* Headers for new Custom Dimension Details */}
                            {section === "Custom Dimension Details" && (
                              <>
                                <th>Display Name
                                  <i
                                    className="bi bi-info-circle-fill ms-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={checkExplanations["Custom Dimension Display Name"]}
                                  ></i>
                                </th>
                                <th>Parameter Name
                                  <i
                                    className="bi bi-info-circle-fill ms-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={checkExplanations["Custom Dimension Parameter Name"]}
                                  ></i>
                                </th>
                                <th>Scope
                                  <i
                                    className="bi bi-info-circle-fill ms-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={checkExplanations["Custom Dimension Scope"]}
                                  ></i>
                                </th>
                              </>
                            )}
                            {/* Headers for new Key Event Details */}
                            {section === "Key Event Details" && (
                              <>
                                <th>Event Name
                                  <i
                                    className="bi bi-info-circle-fill ms-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={checkExplanations["Key Event Name"]}
                                  ></i>
                                </th>
                                <th>Create Time
                                  <i
                                    className="bi bi-info-circle-fill ms-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={checkExplanations["Key Event Create Time"]}
                                  ></i>
                                </th>
                                <th>Counting Method
                                  <i
                                    className="bi bi-info-circle-fill ms-2"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={checkExplanations["Key Event Counting Method"]}
                                  ></i>
                                </th>
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
                                  {/* Only apply tooltips to headers, not content cells */}
                                  {(section === "Property Details" ||
                                    section === "Streams Configuration" ||
                                    section === "GA4 Property Limits" ||
                                    section === "GA4 Events" ||
                                    section === "PII Check" ||
                                    section === "Transactions") && (
                                    <>
                                      <td>
                                        {entry.Check}
                                        {/* Tooltip for specific checks like 'Currency' or 'Retention Period' */}
                                        {checkExplanations[entry.Check] && (
                                          <i
                                            className="bi bi-info-circle-fill ms-2"
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="top"
                                            title={checkExplanations[entry.Check]}
                                          ></i>
                                        )}
                                      </td>
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
