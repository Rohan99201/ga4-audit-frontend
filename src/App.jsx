import { useState, useRef, useEffect } from "react";
import axios from "axios";

// ─── Config ────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "https://ga4-audit-backend.onrender.com";

// ─── Brainlabs Design Tokens ───────────────────────────────────────────────
const BL = {
  yellow:    "#FFD426",
  black:     "#0A0A0A",
  white:     "#FFFFFF",
  darkGrey:  "#1A1A1A",
  midGrey:   "#3D3D3D",
  lightGrey: "#9A9A9A",
  border:    "#2A2A2A",
  danger:    "#FF4444",
  warning:   "#FF9800",
  success:   "#00C896",
  info:      "#4A9EFF",
};

const S = {
  root: { fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", background: BL.black, minHeight: "100vh", color: BL.white },
  topbar: { background: BL.darkGrey, borderBottom: `1px solid ${BL.border}`, padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: "10px", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px" },
  logoMark: { background: BL.yellow, color: BL.black, fontWeight: 900, fontSize: "13px", padding: "4px 8px", borderRadius: "4px", letterSpacing: "0.5px" },
  badge: { background: BL.midGrey, color: BL.lightGrey, fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 500 },
  main: { maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" },
  loginWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" },
  loginCard: { background: BL.darkGrey, border: `1px solid ${BL.border}`, borderRadius: "16px", padding: "48px 48px 40px", maxWidth: "440px", width: "100%", textAlign: "center" },
  loginTitle: { fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: "8px" },
  loginSub: { color: BL.lightGrey, fontSize: "14px", marginBottom: "36px", lineHeight: "1.6" },
  googleBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", background: BL.white, color: "#1A1A1A", border: "none", borderRadius: "10px", padding: "13px 24px", fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", width: "100%", letterSpacing: "-0.2px" },
  divider: { borderTop: `1px solid ${BL.border}`, margin: "28px 0" },
  loginFooter: { fontSize: "12px", color: BL.lightGrey, lineHeight: "1.6" },
  inputPanel: { background: BL.darkGrey, border: `1px solid ${BL.border}`, borderRadius: "12px", padding: "24px", marginBottom: "32px" },
  inputLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: BL.lightGrey, marginBottom: "8px", display: "block" },
  input: { background: BL.black, border: `1px solid ${BL.border}`, borderRadius: "8px", color: BL.white, padding: "10px 14px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" },
  select: { background: BL.black, border: `1px solid ${BL.border}`, borderRadius: "8px", color: BL.white, padding: "10px 36px 10px 14px", fontSize: "14px", width: "100%", outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239A9A9A' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" },
  btnPrimary: { background: BL.yellow, color: BL.black, border: "none", borderRadius: "8px", padding: "11px 24px", fontWeight: 800, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.2px", width: "100%" },
  btnGhost: { background: "transparent", color: BL.lightGrey, border: `1px solid ${BL.border}`, borderRadius: "8px", padding: "8px 16px", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "32px" },
  kpiCard: { background: BL.darkGrey, border: `1px solid ${BL.border}`, borderRadius: "12px", padding: "20px 20px 20px 24px", position: "relative", overflow: "hidden" },
  kpiAccent: { position: "absolute", top: 0, left: 0, width: "3px", height: "100%" },
  kpiLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: BL.lightGrey, marginBottom: "8px" },
  kpiValue: { fontSize: "26px", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1 },
  summaryCard: (t) => ({ background: t==="error"?"rgba(255,68,68,0.08)":t==="warning"?"rgba(255,152,0,0.08)":"rgba(0,200,150,0.08)", border:`1px solid ${t==="error"?"rgba(255,68,68,0.3)":t==="warning"?"rgba(255,152,0,0.3)":"rgba(0,200,150,0.3)"}`, borderRadius:"10px", padding:"14px 18px", display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"10px" }),
  summaryIcon: (t) => ({ width:"22px", height:"22px", borderRadius:"50%", background:t==="error"?BL.danger:t==="warning"?BL.warning:BL.success, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", flexShrink:0, marginTop:"1px", color:BL.white, fontWeight:700 }),
  section: { background: BL.darkGrey, border: `1px solid ${BL.border}`, borderRadius: "12px", marginBottom: "20px", overflow: "hidden" },
  sectionHeader: { padding: "16px 20px", borderBottom: `1px solid ${BL.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" },
  sectionCount: { background: BL.midGrey, color: BL.lightGrey, fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "20px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: BL.lightGrey, background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${BL.border}`, whiteSpace: "nowrap" },
  td: { padding: "11px 16px", borderBottom: `1px solid ${BL.border}`, color: BL.white, verticalAlign: "middle", lineHeight: "1.4" },
  pill: (ok) => ({ display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:600, background:ok?"rgba(0,200,150,0.12)":"rgba(255,68,68,0.12)", color:ok?BL.success:BL.danger }),
  errorBox: { background: "rgba(255,68,68,0.08)", border: `1px solid rgba(255,68,68,0.3)`, borderRadius: "10px", padding: "16px 20px", color: BL.danger, fontSize: "14px", marginBottom: "24px" },
  loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: "16px", color: BL.lightGrey, fontSize: "14px" },
  spinner: { width: "36px", height: "36px", border: `3px solid ${BL.border}`, borderTopColor: BL.yellow, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  userChip: { display: "flex", alignItems: "center", gap: "8px", background: BL.midGrey, borderRadius: "20px", padding: "4px 14px 4px 4px" },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" },
  avatarFallback: { width: "28px", height: "28px", borderRadius: "50%", background: BL.yellow, color: BL.black, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, flexShrink: 0 },
};

const CHECK_TIPS = {
  "Time Zone": "Time zone configured for the property.",
  "Currency": "Currency code for revenue metrics.",
  "User Data Collection Acknowledgment": "Whether user data collection terms have been acknowledged.",
  "Retention Period": "How long user/event data is kept before deletion.",
  "Custom Dimensions Used": "Custom dimensions configured vs allowed limit.",
  "Custom Metrics Used": "Custom metrics configured vs allowed limit.",
  "Key Events Used": "Key events configured vs allowed limit.",
  "Audiences Used": "Audiences configured vs allowed limit.",
  "Total Sessions": "Total sessions in the selected period.",
  "Landing Page (not set) %": "Percentage of sessions with undefined landing page.",
  "Unassigned %": "Percentage of traffic classified as Unassigned.",
  "Total Unique transactionId": "Distinct transaction IDs recorded.",
  "Duplicate Transaction Count": "Transaction IDs appearing more than once.",
};

const resultType = (val) => {
  if (typeof val !== "string") return "neutral";
  if (val.includes("✅")) return "ok";
  if (val.includes("❌") || val.toLowerCase().includes("found")) return "error";
  return "neutral";
};

function ResultCell({ value }) {
  const display = typeof value === "object" ? JSON.stringify(value) : String(value);
  const t = resultType(display);
  if (t === "ok")    return <span style={S.pill(true)}>✓ {display.replace("✅ ", "")}</span>;
  if (t === "error") return <span style={S.pill(false)}>✗ {display.replace("❌ ", "")}</span>;
  return <span style={{ color: BL.lightGrey }}>{display}</span>;
}

function extractKPIs(data) {
  const kpis = [];
  const get = (sec, chk) => data[sec]?.find(e => e.Check === chk)?.Result;
  const tz = get("Property Details","Time Zone"); if (tz) kpis.push({ label:"Time Zone", value:tz, color:BL.info });
  const cur = get("Property Details","Currency"); if (cur) kpis.push({ label:"Currency", value:cur, color:BL.yellow });
  const ret = get("Property Details","Retention Period"); if (ret) kpis.push({ label:"Data Retention", value:ret, color:BL.info });
  const dims = get("GA4 Property Limits","Custom Dimensions Used"); if (dims) kpis.push({ label:"Custom Dims", value:dims, color:BL.warning });
  const ke = get("GA4 Property Limits","Key Events Used"); if (ke) kpis.push({ label:"Key Events", value:ke, color:BL.success });
  const lp = get("Landing Page Analysis","Landing Page (not set) %"); if (lp) kpis.push({ label:"LP (not set) %", value:lp, color:parseFloat(lp)>10?BL.danger:BL.success });
  const ua = get("Channel Grouping Analysis","Unassigned %"); if (ua) kpis.push({ label:"Unassigned %", value:ua, color:parseFloat(ua)>10?BL.danger:BL.success });
  const dup = get("Transactions","Duplicate Transaction Count"); if (dup!==undefined) kpis.push({ label:"Duplicate Txns", value:dup, color:parseInt(dup)>0?BL.danger:BL.success });
  return kpis;
}

function generateSummary(data) {
  if (!data) return [];
  const msgs = [];
  if (data["Duplicate Transactions"]?.length > 0) msgs.push({ type:"error", text:"Duplicate transactions detected. Review your e-commerce tracking setup." });
  if (data["Transaction Where Item Data Missing"]?.length > 0) msgs.push({ type:"error", text:"Purchase events found with missing item names." });
  if (data["PII Check"]?.some(e => e.Result && !e.Result.includes("✅"))) msgs.push({ type:"error", text:"Potential PII detected in page paths. Coordinate with your dev team immediately." });
  const lp = data["Landing Page Analysis"]?.find(e => e.Check==="Landing Page (not set) %")?.Result;
  if (lp && parseFloat(lp) > 10) msgs.push({ type:"warning", text:`Landing Page (not set) rate is ${lp} — above the 10% threshold.` });
  const ua = data["Channel Grouping Analysis"]?.find(e => e.Check==="Unassigned %")?.Result;
  if (ua && parseFloat(ua) > 10) msgs.push({ type:"warning", text:`Unassigned traffic is ${ua} — review UTM parameters and Channel Grouping rules.` });
  if (msgs.length === 0) msgs.push({ type:"ok", text:"GA4 property looks healthy across all checks. No critical issues found." });
  return msgs;
}

function AuditTable({ columns, rows }) {
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead><tr>{columns.map((c,i) => <th key={i} style={S.th}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((row,ri) => (
            <tr key={ri}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              {row.map((cell,ci) => <td key={ci} style={S.td}>{cell?.node ?? cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CheckResultTable({ entries }) {
  return (
    <AuditTable
      columns={["Check","Result"]}
      rows={entries.map(e => [
        <span style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          {e.Check}
          {CHECK_TIPS[e.Check] && <span title={CHECK_TIPS[e.Check]} style={{ color:BL.lightGrey, fontSize:"12px", cursor:"help" }}>ⓘ</span>}
        </span>,
        { node: <ResultCell value={typeof e.Result==="object"?JSON.stringify(e.Result):e.Result} /> }
      ])}
    />
  );
}

function AuditSection({ title, count, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={S.section}>
      <div style={S.sectionHeader}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={S.sectionTitle}>{title}</span>
          {count !== undefined && <span style={S.sectionCount}>{count}</span>}
        </div>
        <button onClick={() => setOpen(o => !o)} style={S.btnGhost}>{open ? "Collapse" : "Expand"}</button>
      </div>
      {open && children}
    </div>
  );
}

function LoginScreen() {
  return (
    <div style={S.loginWrap}>
      <div style={S.loginCard}>
        <div style={{ marginBottom: "20px" }}>
          <span style={{ ...S.logoMark, fontSize:"16px", padding:"6px 12px" }}>BL</span>
        </div>
        <div style={S.loginTitle}>GA4 Audit Tool</div>
        <div style={S.loginSub}>
          Sign in with your Google account to audit any GA4 property you have access to.
        </div>
        <a href={`${API}/auth/google`} style={{ textDecoration:"none" }}>
          <button style={S.googleBtn}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>
        </a>
        <div style={S.divider} />
        <div style={S.loginFooter}>
          Your data is accessed securely via Google OAuth.<br />
          Only properties you own or manage will be shown.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser]                 = useState(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [properties, setProperties]     = useState([]);
  const [propLoading, setPropLoading]   = useState(false);
  const [selectedProp, setSelectedProp] = useState("");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/auth/me`, { withCredentials: true })
      .then(res => { if (res.data.authenticated) { setUser(res.data.user); loadProperties(); } })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const loadProperties = async () => {
    setPropLoading(true);
    try {
      const res = await axios.get(`${API}/list-properties`, { withCredentials: true });
      if (res.data.success) setProperties(res.data.properties);
    } catch(e) { console.error(e); }
    finally { setPropLoading(false); }
  };

  const handleLogout = async () => {
    await axios.get(`${API}/auth/logout`, { withCredentials: true });
    setUser(null); setProperties([]); setData(null); setSelectedProp("");
  };

  const runAudit = async () => {
    if (!selectedProp) return;
    setLoading(true); setError(null); setData(null);
    try {
      const res = await axios.get(`${API}/run-audit`, {
        params: { property_id: selectedProp, start_date: startDate||"30daysAgo", end_date: endDate||"today" },
        withCredentials: true,
      });
      if (res.data.success) setData(res.data.data);
      else setError(res.data.error || "Unknown error during audit.");
    } catch(err) {
      setError("Audit failed: " + (err.response?.data?.detail || err.message));
    } finally { setLoading(false); }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale:2, backgroundColor:"#0A0A0A" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new window.jspdf.jsPDF("p","mm","a4");
      const imgW=210, pageH=297, imgH=canvas.height*imgW/canvas.width;
      let left=imgH, pos=0;
      pdf.addImage(imgData,"PNG",0,pos,imgW,imgH); left-=pageH;
      while(left>=0){ pos=left-imgH; pdf.addPage(); pdf.addImage(imgData,"PNG",0,pos,imgW,imgH); left-=pageH; }
      pdf.save("GA4_Audit_Report.pdf");
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  const kpis = data ? extractKPIs(data) : [];
  const summaryItems = data ? generateSummary(data) : [];
  const health = summaryItems.length===1&&summaryItems[0].type==="ok" ? "healthy"
    : summaryItems.some(s=>s.type==="error") ? "critical" : "warning";
  const selectedPropName = properties.find(p=>p.property_id===selectedProp)?.display_name;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .fade-in{animation:fadeIn 0.35s ease forwards;}
        input:focus,select:focus{border-color:#FFD426!important;box-shadow:0 0 0 3px rgba(255,212,38,0.15);}
        tr:last-child td{border-bottom:none!important;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:#1A1A1A;}
        ::-webkit-scrollbar-thumb{background:#3D3D3D;border-radius:3px;}
        option{background:#1A1A1A;color:#fff;}
      `}</style>
      <div style={S.root}>

        {/* Topbar */}
        <div style={S.topbar}>
          <div style={S.logo}>
            <span style={S.logoMark}>BL</span>
            <span>GA4 Audit</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            {data && (
              <span style={{ ...S.badge, background:health==="healthy"?"rgba(0,200,150,0.15)":health==="critical"?"rgba(255,68,68,0.15)":"rgba(255,152,0,0.15)", color:health==="healthy"?BL.success:health==="critical"?BL.danger:BL.warning }}>
                ● {health==="healthy"?"Healthy":health==="critical"?"Issues Found":"Warnings"}
              </span>
            )}
            {user && (
              <div style={S.userChip}>
                {user.picture
                  ? <img src={user.picture} alt="" style={S.avatar} referrerPolicy="no-referrer" />
                  : <div style={S.avatarFallback}>{user.name?.[0]??"U"}</div>}
                <span style={{ fontSize:"13px", fontWeight:600, color:BL.white }}>{user.name?.split(" ")[0]}</span>
                <button onClick={handleLogout} style={{ ...S.btnGhost, padding:"4px 10px", fontSize:"12px", marginLeft:"4px" }}>Sign out</button>
              </div>
            )}
          </div>
        </div>

        <div style={S.main}>
          {authLoading && <div style={S.loadingBox}><div style={S.spinner}/><span>Checking session…</span></div>}
          {!authLoading && !user && <LoginScreen />}

          {!authLoading && user && (
            <>
              <div style={{ fontSize:"28px", fontWeight:800, letterSpacing:"-0.8px", marginBottom:"4px" }}>GA4 Property Audit</div>
              <div style={{ color:BL.lightGrey, fontSize:"14px", marginBottom:"32px" }}>Select a property and date range, then run a full diagnostic.</div>

              {/* Input Panel */}
              <div style={S.inputPanel}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto", gap:"16px", alignItems:"end" }}>
                  <div>
                    <label style={S.inputLabel}>
                      GA4 Property
                      {propLoading && <span style={{ color:BL.lightGrey, fontWeight:400, marginLeft:"8px", textTransform:"none", letterSpacing:0 }}>Loading…</span>}
                    </label>
                    <select style={S.select} value={selectedProp} onChange={e => { setSelectedProp(e.target.value); setData(null); }}>
                      <option value="">— Select a property —</option>
                      {properties.map(p => (
                        <option key={p.property_id} value={p.property_id}>
                          {p.display_name} · {p.account_name} · {p.property_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={S.inputLabel}>Start Date</label>
                    <input style={S.input} placeholder="YYYY-MM-DD" value={startDate} onChange={e=>setStartDate(e.target.value)}
                      onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border} />
                  </div>
                  <div>
                    <label style={S.inputLabel}>End Date</label>
                    <input style={S.input} placeholder="YYYY-MM-DD" value={endDate} onChange={e=>setEndDate(e.target.value)}
                      onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border} />
                  </div>
                  <div>
                    <button style={{ ...S.btnPrimary, opacity:loading||!selectedProp?0.5:1, cursor:!selectedProp?"not-allowed":"pointer" }}
                      onClick={runAudit} disabled={loading||!selectedProp}>
                      {loading ? "Running…" : "Run Audit →"}
                    </button>
                  </div>
                </div>
                {selectedProp && (
                  <div style={{ marginTop:"12px", fontSize:"12px", color:BL.lightGrey }}>
                    Auditing: <span style={{ color:BL.white, fontWeight:600 }}>{selectedPropName}</span>
                    {" · "}Range: <span style={{ color:BL.white }}>{startDate||"30daysAgo"} → {endDate||"today"}</span>
                  </div>
                )}
              </div>

              {error && <div style={S.errorBox}><strong>Error:</strong> {error}</div>}
              {loading && <div style={S.loadingBox}><div style={S.spinner}/><span>Fetching data from GA4 API…</span></div>}

              {data && (
                <div ref={reportRef} className="fade-in">
                  {/* KPI Cards */}
                  {kpis.length > 0 && (
                    <>
                      <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:BL.lightGrey, marginBottom:"12px" }}>Dashboard Overview</div>
                      <div style={S.kpiGrid}>
                        {kpis.map((k,i) => (
                          <div key={i} style={S.kpiCard}>
                            <div style={{ ...S.kpiAccent, background:k.color }} />
                            <div style={S.kpiLabel}>{k.label}</div>
                            <div style={{ ...S.kpiValue, color:k.color }}>{k.value}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Summary */}
                  <div style={{ ...S.section, marginBottom:"28px" }}>
                    <div style={S.sectionHeader}>
                      <span style={S.sectionTitle}>Audit Summary</span>
                      <span style={{ ...S.badge, background:health==="healthy"?"rgba(0,200,150,0.12)":health==="critical"?"rgba(255,68,68,0.12)":"rgba(255,152,0,0.12)", color:health==="healthy"?BL.success:health==="critical"?BL.danger:BL.warning }}>
                        {summaryItems.filter(s=>s.type==="error").length} errors · {summaryItems.filter(s=>s.type==="warning").length} warnings
                      </span>
                    </div>
                    <div style={{ padding:"16px 20px" }}>
                      {summaryItems.map((s,i) => (
                        <div key={i} style={S.summaryCard(s.type)}>
                          <div style={S.summaryIcon(s.type)}>{s.type==="error"?"✕":s.type==="warning"?"!":"✓"}</div>
                          <div style={{ fontSize:"14px", lineHeight:"1.5" }}>{s.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All sections */}
                  {data["Property Details"]?.length>0&&<AuditSection title="Property Details" count={data["Property Details"].length}><CheckResultTable entries={data["Property Details"]}/></AuditSection>}
                  {data["Streams Configuration"]?.length>0&&<AuditSection title="Streams Configuration" count={data["Streams Configuration"].length}><CheckResultTable entries={data["Streams Configuration"]}/></AuditSection>}
                  {data["GA4 Property Limits"]?.length>0&&<AuditSection title="GA4 Property Limits"><CheckResultTable entries={data["GA4 Property Limits"]}/></AuditSection>}
                  {data["GA4 Events"]?.length>0&&<AuditSection title="Event Inventory" count={data["GA4 Events"].length}><CheckResultTable entries={data["GA4 Events"]}/></AuditSection>}
                  {data["Custom Dimension Details"]?.length>0&&<AuditSection title="Custom Dimension Details" count={data["Custom Dimension Details"].length}><AuditTable columns={["Display Name","Parameter Name","Scope"]} rows={data["Custom Dimension Details"].slice(0,15).map(e=>[e.Check,e.Result?.["Parameter Name"]??"—",e.Result?.Scope??"—"])}/></AuditSection>}
                  {data["Key Event Details"]?.length>0&&<AuditSection title="Key Event Details" count={data["Key Event Details"].length}><AuditTable columns={["Event Name","Create Time","Counting Method"]} rows={data["Key Event Details"].slice(0,15).map(e=>[e.Check,e.Result?.["Create Time"]??"—",e.Result?.["Counting Method"]??"—"])}/></AuditSection>}
                  {data["PII Check"]?.length>0&&<AuditSection title="PII Check"><CheckResultTable entries={data["PII Check"]}/></AuditSection>}
                  {data["Transactions"]?.length>0&&<AuditSection title="Transaction Health"><CheckResultTable entries={data["Transactions"]}/></AuditSection>}
                  {data["Duplicate Transactions"]?.length>0&&<AuditSection title="Duplicate Transactions" count={data["Duplicate Transactions"].length}><AuditTable columns={["Transaction ID","Count"]} rows={data["Duplicate Transactions"].slice(0,15).map(e=>[e.transactionId,{node:<span style={{color:BL.danger,fontWeight:700}}>{e.count}</span>}])}/></AuditSection>}
                  {data["Revenue Only Transactions"]?.length>0&&<AuditSection title="Revenue with Missing Item Data" count={data["Revenue Only Transactions"].length}><AuditTable columns={["Transaction ID"]} rows={data["Revenue Only Transactions"].slice(0,15).map(t=>[t])}/></AuditSection>}
                  {data["Items Only Transactions"]?.length>0&&<AuditSection title="Items with No Revenue Data" count={data["Items Only Transactions"].length}><AuditTable columns={["Transaction ID"]} rows={data["Items Only Transactions"].slice(0,15).map(t=>[t])}/></AuditSection>}
                  {data["Transaction Mapping"]?.length>0&&(
                    <AuditSection title="Transaction Mapping">
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
                        <div style={{ borderRight:`1px solid ${BL.border}` }}>
                          <div style={{ padding:"10px 16px", fontSize:"11px", fontWeight:700, color:BL.lightGrey, textTransform:"uppercase", letterSpacing:"0.8px", borderBottom:`1px solid ${BL.border}` }}>Revenue (Top 15)</div>
                          <AuditTable columns={["Transaction ID","Revenue"]} rows={data["Transaction Mapping"].filter(e=>e.source==="Revenue Table").slice(0,15).map(e=>[e.transactionId,e.revenue])}/>
                        </div>
                        <div>
                          <div style={{ padding:"10px 16px", fontSize:"11px", fontWeight:700, color:BL.lightGrey, textTransform:"uppercase", letterSpacing:"0.8px", borderBottom:`1px solid ${BL.border}` }}>Items (Top 15)</div>
                          <AuditTable columns={["Transaction ID","Item ID","Item Name"]} rows={data["Transaction Mapping"].filter(e=>e.source==="Item Table").slice(0,15).map(e=>[e.transactionId,e.itemId,e.itemName])}/>
                        </div>
                      </div>
                    </AuditSection>
                  )}
                  {data["Transaction Where Item Data Missing"]?.length>0&&<AuditSection title="Transactions with Missing Item Data" count={data["Transaction Where Item Data Missing"].length}><AuditTable columns={["Transaction ID","Item ID","Item Name","Revenue"]} rows={data["Transaction Where Item Data Missing"].slice(0,15).map(e=>[e.transactionId,e.itemId,{node:<span style={{color:BL.danger}}>{e.itemName||"(missing)"}</span>},e.revenue])}/></AuditSection>}
                  {data["Landing Page Analysis"]?.length>0&&<AuditSection title="Landing Page Analysis"><CheckResultTable entries={data["Landing Page Analysis"]}/></AuditSection>}
                  {data["Landing Page Data"]?.length>0&&<AuditSection title="Landing Page Data" count={data["Landing Page Data"].length}><AuditTable columns={["Landing Page","Sessions"]} rows={data["Landing Page Data"].slice(0,15).map(e=>[e["Landing Page"],e.Sessions])}/></AuditSection>}
                  {data["Channel Grouping Analysis"]?.length>0&&<AuditSection title="Channel Grouping Analysis"><CheckResultTable entries={data["Channel Grouping Analysis"]}/></AuditSection>}
                  {data["Channel Grouping Data"]?.length>0&&<AuditSection title="Channel Grouping Data" count={data["Channel Grouping Data"].length}><AuditTable columns={["Channel Group","Sessions"]} rows={data["Channel Grouping Data"].slice(0,15).map(e=>[e["Channel Group"],e.Sessions])}/></AuditSection>}
                  {data["Unassigned Traffic Details"]?.length>0&&<AuditSection title="Unassigned Traffic Details"><CheckResultTable entries={data["Unassigned Traffic Details"]}/></AuditSection>}
                  {data["Unassigned Source/Medium Data"]?.length>0&&<AuditSection title="Unassigned Source/Medium Breakdown" count={data["Unassigned Source/Medium Data"].length}><AuditTable columns={["Channel Group","Source","Medium","Sessions"]} rows={data["Unassigned Source/Medium Data"].slice(0,15).map(e=>[e["Channel Group"],e.Source,e.Medium,e.Sessions])}/></AuditSection>}

                  {/* Download */}
                  <div style={{ display:"flex", justifyContent:"center", marginTop:"40px", paddingBottom:"48px" }}>
                    <button style={{ ...S.btnPrimary, width:"auto", padding:"14px 40px", fontSize:"15px", opacity:loading?0.5:1 }}
                      onClick={handleDownloadPdf} disabled={loading}>
                      {loading ? "Generating…" : "Download Report (PDF)"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}