import { useState, useRef, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API = import.meta.env.VITE_API_URL || "https://ga4-audit-backend.onrender.com";

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
  root: { fontFamily:"'DM Sans','Helvetica Neue',Arial,sans-serif", background:BL.black, minHeight:"100vh", color:BL.white },
  topbar: { background:BL.darkGrey, borderBottom:`1px solid ${BL.border}`, padding:"0 32px", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { display:"flex", alignItems:"center", gap:"10px", fontWeight:800, fontSize:"18px", letterSpacing:"-0.5px" },
  logoMark: { background:BL.yellow, color:BL.black, fontWeight:900, fontSize:"13px", padding:"4px 8px", borderRadius:"4px", letterSpacing:"0.5px" },
  badge: { background:BL.midGrey, color:BL.lightGrey, fontSize:"11px", padding:"3px 10px", borderRadius:"20px", fontWeight:500 },
  main: { maxWidth:"1280px", margin:"0 auto", padding:"40px 24px" },
  tabs: { display:"flex", gap:"4px", marginBottom:"32px", background:BL.darkGrey, padding:"4px", borderRadius:"10px", border:`1px solid ${BL.border}`, width:"fit-content" },
  tab: (active) => ({ padding:"8px 20px", borderRadius:"7px", fontSize:"13px", fontWeight:700, cursor:"pointer", border:"none", fontFamily:"inherit", background:active?BL.yellow:"transparent", color:active?BL.black:BL.lightGrey, transition:"all 0.15s" }),
  loginWrap: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh" },
  loginCard: { background:BL.darkGrey, border:`1px solid ${BL.border}`, borderRadius:"16px", padding:"48px 48px 40px", maxWidth:"440px", width:"100%", textAlign:"center" },
  loginTitle: { fontSize:"26px", fontWeight:800, letterSpacing:"-0.8px", marginBottom:"8px" },
  loginSub: { color:BL.lightGrey, fontSize:"14px", marginBottom:"36px", lineHeight:"1.6" },
  googleBtn: { display:"flex", alignItems:"center", justifyContent:"center", gap:"12px", background:BL.white, color:"#1A1A1A", border:"none", borderRadius:"10px", padding:"13px 24px", fontWeight:700, fontSize:"15px", cursor:"pointer", fontFamily:"inherit", width:"100%", letterSpacing:"-0.2px" },
  divider: { borderTop:`1px solid ${BL.border}`, margin:"28px 0" },
  loginFooter: { fontSize:"12px", color:BL.lightGrey, lineHeight:"1.6" },
  inputPanel: { background:BL.darkGrey, border:`1px solid ${BL.border}`, borderRadius:"12px", padding:"24px", marginBottom:"32px" },
  inputLabel: { fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:BL.lightGrey, marginBottom:"8px", display:"block" },
  input: { background:BL.black, border:`1px solid ${BL.border}`, borderRadius:"8px", color:BL.white, padding:"10px 14px", fontSize:"14px", width:"100%", outline:"none", fontFamily:"inherit" },
  select: { background:BL.black, border:`1px solid ${BL.border}`, borderRadius:"8px", color:BL.white, padding:"10px 36px 10px 14px", fontSize:"14px", width:"100%", outline:"none", cursor:"pointer", fontFamily:"inherit", appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239A9A9A' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center" },
  btnPrimary: { background:BL.yellow, color:BL.black, border:"none", borderRadius:"8px", padding:"11px 24px", fontWeight:800, fontSize:"14px", cursor:"pointer", fontFamily:"inherit", letterSpacing:"-0.2px", width:"100%" },
  btnGhost: { background:"transparent", color:BL.lightGrey, border:`1px solid ${BL.border}`, borderRadius:"8px", padding:"8px 16px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" },
  btnOutline: { background:"transparent", color:BL.yellow, border:`1px solid ${BL.yellow}`, borderRadius:"8px", padding:"9px 18px", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit", letterSpacing:"-0.2px" },
  kpiGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"16px", marginBottom:"32px" },
  kpiCard: { background:BL.darkGrey, border:`1px solid ${BL.border}`, borderRadius:"12px", padding:"20px 20px 20px 24px", position:"relative", overflow:"hidden" },
  kpiAccent: { position:"absolute", top:0, left:0, width:"3px", height:"100%" },
  kpiLabel: { fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:BL.lightGrey, marginBottom:"8px" },
  kpiValue: { fontSize:"26px", fontWeight:800, letterSpacing:"-1px", lineHeight:1 },
  summaryCard: (t) => ({ background:t==="error"?"rgba(255,68,68,0.08)":t==="warning"?"rgba(255,152,0,0.08)":"rgba(0,200,150,0.08)", border:`1px solid ${t==="error"?"rgba(255,68,68,0.3)":t==="warning"?"rgba(255,152,0,0.3)":"rgba(0,200,150,0.3)"}`, borderRadius:"10px", padding:"14px 18px", display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"10px" }),
  summaryIcon: (t) => ({ width:"22px", height:"22px", borderRadius:"50%", background:t==="error"?BL.danger:t==="warning"?BL.warning:BL.success, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", flexShrink:0, marginTop:"1px", color:BL.white, fontWeight:700 }),
  section: { background:BL.darkGrey, border:`1px solid ${BL.border}`, borderRadius:"12px", marginBottom:"20px", overflow:"hidden" },
  sectionHeader: { padding:"16px 20px", borderBottom:`1px solid ${BL.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" },
  sectionTitle: { fontWeight:700, fontSize:"15px", letterSpacing:"-0.3px" },
  sectionCount: { background:BL.midGrey, color:BL.lightGrey, fontSize:"11px", fontWeight:700, padding:"3px 9px", borderRadius:"20px" },
  tableWrap: { overflowX:"auto" },
  table: { width:"100%", borderCollapse:"collapse", fontSize:"13px" },
  th: { padding:"10px 16px", textAlign:"left", fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", color:BL.lightGrey, background:"rgba(255,255,255,0.03)", borderBottom:`1px solid ${BL.border}`, whiteSpace:"nowrap" },
  td: { padding:"11px 16px", borderBottom:`1px solid ${BL.border}`, color:BL.white, verticalAlign:"middle", lineHeight:"1.4" },
  pill: (ok) => ({ display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:600, background:ok?"rgba(0,200,150,0.12)":"rgba(255,68,68,0.12)", color:ok?BL.success:BL.danger }),
  pillWarning: { display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:600, background:"rgba(255,152,0,0.12)", color:BL.warning },
  pillNeutral: { display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:600, background:"rgba(255,255,255,0.06)", color:BL.lightGrey },
  errorBox: { background:"rgba(255,68,68,0.08)", border:`1px solid rgba(255,68,68,0.3)`, borderRadius:"10px", padding:"16px 20px", color:BL.danger, fontSize:"14px", marginBottom:"24px" },
  infoBox: { background:"rgba(74,158,255,0.08)", border:`1px solid rgba(74,158,255,0.3)`, borderRadius:"10px", padding:"14px 18px", color:BL.info, fontSize:"13px", marginBottom:"20px" },
  loadingBox: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 20px", gap:"16px", color:BL.lightGrey, fontSize:"14px" },
  spinner: { width:"36px", height:"36px", border:`3px solid ${BL.border}`, borderTopColor:BL.yellow, borderRadius:"50%", animation:"spin 0.8s linear infinite" },
  userChip: { display:"flex", alignItems:"center", gap:"8px", background:BL.midGrey, borderRadius:"20px", padding:"4px 14px 4px 4px" },
  avatar: { width:"28px", height:"28px", borderRadius:"50%", objectFit:"cover" },
  avatarFallback: { width:"28px", height:"28px", borderRadius:"50%", background:BL.yellow, color:BL.black, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:800, flexShrink:0 },
  dropzone: (hover) => ({ border:`2px dashed ${hover?BL.yellow:BL.border}`, borderRadius:"12px", padding:"40px 24px", textAlign:"center", cursor:"pointer", transition:"all 0.2s", background:hover?"rgba(255,212,38,0.04)":"transparent" }),
  sdrEventRow: (status) => ({ background: status==="found"?"rgba(0,200,150,0.05)":status==="missing"?"rgba(255,68,68,0.05)":"rgba(255,152,0,0.05)", borderBottom:`1px solid ${BL.border}` }),
};

const CHECK_TIPS = {
  "Time Zone":"Time zone configured for the property.",
  "Currency":"Currency code for revenue metrics.",
  "Retention Period":"How long user/event data is kept.",
  "Custom Dimensions Used":"Custom dimensions configured vs limit.",
  "Key Events Used":"Key events configured vs limit.",
  "Landing Page (not set) %":"Percentage of sessions with undefined landing page.",
  "Unassigned %":"Percentage of traffic classified as Unassigned.",
  "Total Unique transactionId":"Distinct transaction IDs recorded.",
  "Duplicate Transaction Count":"Transaction IDs appearing more than once.",
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
  if (t === "ok")    return <span style={S.pill(true)}>✓ {display.replace("✅ ","")}</span>;
  if (t === "error") return <span style={S.pill(false)}>✗ {display.replace("❌ ","")}</span>;
  return <span style={{ color:BL.lightGrey }}>{display}</span>;
}

function extractKPIs(data) {
  const kpis = [];
  const get = (s,c) => data[s]?.find(e=>e.Check===c)?.Result;
  const tz=get("Property Details","Time Zone"); if(tz) kpis.push({label:"Time Zone",value:tz,color:BL.info});
  const cur=get("Property Details","Currency"); if(cur) kpis.push({label:"Currency",value:cur,color:BL.yellow});
  const ret=get("Property Details","Retention Period"); if(ret) kpis.push({label:"Data Retention",value:ret,color:BL.info});
  const dims=get("GA4 Property Limits","Custom Dimensions Used"); if(dims) kpis.push({label:"Custom Dims",value:dims,color:BL.warning});
  const ke=get("GA4 Property Limits","Key Events Used"); if(ke) kpis.push({label:"Key Events",value:ke,color:BL.success});
  const lp=get("Landing Page Analysis","Landing Page (not set) %"); if(lp) kpis.push({label:"LP (not set) %",value:lp,color:parseFloat(lp)>10?BL.danger:BL.success});
  const ua=get("Channel Grouping Analysis","Unassigned %"); if(ua) kpis.push({label:"Unassigned %",value:ua,color:parseFloat(ua)>10?BL.danger:BL.success});
  const dup=get("Transactions","Duplicate Transaction Count"); if(dup!==undefined) kpis.push({label:"Duplicate Txns",value:dup,color:parseInt(dup)>0?BL.danger:BL.success});
  return kpis;
}

function generateSummary(data) {
  if (!data) return [];
  const msgs = [];
  if (data["Duplicate Transactions"]?.length>0) msgs.push({type:"error",text:"Duplicate transactions detected. Review your e-commerce tracking setup."});
  if (data["Transaction Where Item Data Missing"]?.length>0) msgs.push({type:"error",text:"Purchase events found with missing item names."});
  if (data["PII Check"]?.some(e=>e.Result&&!e.Result.includes("✅"))) msgs.push({type:"error",text:"Potential PII detected in page paths. Coordinate with your dev team immediately."});
  const lp=data["Landing Page Analysis"]?.find(e=>e.Check==="Landing Page (not set) %")?.Result;
  if(lp&&parseFloat(lp)>10) msgs.push({type:"warning",text:`Landing Page (not set) rate is ${lp} — above 10% threshold.`});
  const ua=data["Channel Grouping Analysis"]?.find(e=>e.Check==="Unassigned %")?.Result;
  if(ua&&parseFloat(ua)>10) msgs.push({type:"warning",text:`Unassigned traffic is ${ua} — review UTM parameters.`});
  if(msgs.length===0) msgs.push({type:"ok",text:"GA4 property looks healthy across all checks. No critical issues found."});
  return msgs;
}

function AuditTable({ columns, rows }) {
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead><tr>{columns.map((c,i)=><th key={i} style={S.th}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((row,ri)=>(
            <tr key={ri}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              {row.map((cell,ci)=><td key={ci} style={S.td}>{cell?.node??cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CheckResultTable({ entries }) {
  return (
    <AuditTable columns={["Check","Result"]} rows={entries.map(e=>[
      <span style={{display:"flex",alignItems:"center",gap:"6px"}}>
        {e.Check}
        {CHECK_TIPS[e.Check]&&<span title={CHECK_TIPS[e.Check]} style={{color:BL.lightGrey,fontSize:"12px",cursor:"help"}}>ⓘ</span>}
      </span>,
      {node:<ResultCell value={typeof e.Result==="object"?JSON.stringify(e.Result):e.Result}/>}
    ])}/>
  );
}

function AuditSection({ title, count, children }) {
  const [open,setOpen]=useState(true);
  return (
    <div style={S.section}>
      <div style={S.sectionHeader}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={S.sectionTitle}>{title}</span>
          {count!==undefined&&<span style={S.sectionCount}>{count}</span>}
        </div>
        <button onClick={()=>setOpen(o=>!o)} style={S.btnGhost}>{open?"Collapse":"Expand"}</button>
      </div>
      {open&&children}
    </div>
  );
}

// ── GA4 Data Explorer ──────────────────────────────────────────────────────
const GA4_DIMENSIONS = [
  // Events
  { id:"eventName",                        label:"Event Name",              group:"Events" },
  // Pages
  { id:"pagePath",                         label:"Page Path",               group:"Pages" },
  { id:"pageTitle",                        label:"Page Title",              group:"Pages" },
  { id:"pageLocation",                     label:"Page Location (URL)",     group:"Pages" },
  { id:"landingPage",                      label:"Landing Page",            group:"Pages" },
  { id:"landingPagePlusQueryString",       label:"Landing Page + Query",    group:"Pages" },
  { id:"contentGroup",                     label:"Content Group",           group:"Pages" },
  // Traffic
  { id:"sessionDefaultChannelGroup",       label:"Channel Group",           group:"Traffic" },
  { id:"sessionSource",                    label:"Source",                  group:"Traffic" },
  { id:"sessionMedium",                    label:"Medium",                  group:"Traffic" },
  { id:"sessionCampaignName",              label:"Campaign",                group:"Traffic" },
  { id:"sessionSourceMedium",             label:"Source / Medium",          group:"Traffic" },
  { id:"firstUserDefaultChannelGroup",    label:"First User Channel",       group:"Traffic" },
  { id:"firstUserSource",                 label:"First User Source",        group:"Traffic" },
  { id:"firstUserMedium",                 label:"First User Medium",        group:"Traffic" },
  { id:"firstUserCampaignName",           label:"First User Campaign",      group:"Traffic" },
  // Device
  { id:"deviceCategory",                  label:"Device Category",          group:"Device" },
  { id:"operatingSystem",                 label:"Operating System",         group:"Device" },
  { id:"operatingSystemVersion",          label:"OS Version",               group:"Device" },
  { id:"browser",                         label:"Browser",                  group:"Device" },
  { id:"browserVersion",                  label:"Browser Version",          group:"Device" },
  { id:"platform",                        label:"Platform",                 group:"Device" },
  { id:"mobileDeviceBranding",            label:"Device Brand",             group:"Device" },
  { id:"mobileDeviceModel",               label:"Device Model",             group:"Device" },
  // Geo
  { id:"country",                         label:"Country",                  group:"Geo" },
  { id:"countryId",                       label:"Country ID",               group:"Geo" },
  { id:"city",                            label:"City",                     group:"Geo" },
  { id:"region",                          label:"Region",                   group:"Geo" },
  { id:"continent",                       label:"Continent",                group:"Geo" },
  { id:"language",                        label:"Language",                 group:"Geo" },
  // Time
  { id:"date",                            label:"Date",                     group:"Time" },
  { id:"week",                            label:"Week",                     group:"Time" },
  { id:"month",                           label:"Month",                    group:"Time" },
  { id:"year",                            label:"Year",                     group:"Time" },
  { id:"dayOfWeek",                       label:"Day of Week",              group:"Time" },
  { id:"hour",                            label:"Hour",                     group:"Time" },
  { id:"nthDay",                          label:"Nth Day",                  group:"Time" },
  // Ecommerce
  { id:"itemName",                        label:"Item Name",                group:"Ecommerce" },
  { id:"itemId",                          label:"Item ID",                  group:"Ecommerce" },
  { id:"itemCategory",                    label:"Item Category",            group:"Ecommerce" },
  { id:"itemCategory2",                   label:"Item Category 2",          group:"Ecommerce" },
  { id:"itemBrand",                       label:"Item Brand",               group:"Ecommerce" },
  { id:"itemVariant",                     label:"Item Variant",             group:"Ecommerce" },
  { id:"itemListName",                    label:"Item List Name",           group:"Ecommerce" },
  { id:"transactionId",                   label:"Transaction ID",           group:"Ecommerce" },
  { id:"shippingTier",                    label:"Shipping Tier",            group:"Ecommerce" },
  { id:"paymentType",                     label:"Payment Type",             group:"Ecommerce" },
  // User
  { id:"newVsReturning",                  label:"New vs Returning",         group:"Users" },
  { id:"userAgeBracket",                  label:"Age Bracket",              group:"Users" },
  { id:"userGender",                      label:"Gender",                   group:"Users" },
  // Engagement
  { id:"customEvent:percent_scrolled",    label:"Percent Scrolled (custom)", group:"Custom" },
  // Audience
  { id:"audienceName",                    label:"Audience Name",            group:"Audience" },
];

// Custom dimension input — user can type their own customEvent: or customUser: dim
const CUSTOM_DIM_PREFIX = "customEvent:";

const GA4_METRICS = [
  { id:"eventCount",                label:"Event Count",           group:"Events" },
  { id:"eventCountPerUser",         label:"Events / User",         group:"Events" },
  { id:"eventsPerSession",          label:"Events / Session",      group:"Events" },
  { id:"totalUsers",                label:"Total Users",           group:"Users" },
  { id:"activeUsers",               label:"Active Users",          group:"Users" },
  { id:"newUsers",                  label:"New Users",             group:"Users" },
  { id:"returningUsers",            label:"Returning Users",       group:"Users" },
  { id:"sessions",                  label:"Sessions",              group:"Sessions" },
  { id:"sessionsPerUser",           label:"Sessions / User",       group:"Sessions" },
  { id:"averageSessionDuration",    label:"Avg Session Duration",  group:"Sessions" },
  { id:"bounceRate",                label:"Bounce Rate",           group:"Sessions" },
  { id:"engagementRate",            label:"Engagement Rate",       group:"Engagement" },
  { id:"engagedSessions",           label:"Engaged Sessions",      group:"Engagement" },
  { id:"userEngagementDuration",    label:"Engagement Duration",   group:"Engagement" },
  { id:"scrolledUsers",             label:"Scrolled Users",        group:"Engagement" },
  { id:"screenPageViews",           label:"Page Views",            group:"Pages" },
  { id:"screenPageViewsPerSession", label:"Pages / Session",       group:"Pages" },
  { id:"screenPageViewsPerUser",    label:"Pages / User",          group:"Pages" },
  { id:"purchaseRevenue",           label:"Revenue",               group:"Ecommerce" },
  { id:"purchaseRevenuePerUser",    label:"Revenue / User",        group:"Ecommerce" },
  { id:"transactions",              label:"Transactions",          group:"Ecommerce" },
  { id:"transactionsPerPurchaser",  label:"Txns / Purchaser",      group:"Ecommerce" },
  { id:"ecommercePurchases",        label:"Purchases",             group:"Ecommerce" },
  { id:"itemRevenue",               label:"Item Revenue",          group:"Ecommerce" },
  { id:"itemsPurchased",            label:"Items Purchased",       group:"Ecommerce" },
  { id:"addToCarts",                label:"Add to Carts",          group:"Ecommerce" },
  { id:"checkouts",                 label:"Checkouts",             group:"Ecommerce" },
  { id:"cartToViewRate",            label:"Cart-to-View Rate",     group:"Ecommerce" },
  { id:"purchaseToViewRate",        label:"Purchase-to-View Rate", group:"Ecommerce" },
  { id:"conversions",               label:"Conversions",           group:"Conversions" },
  { id:"totalRevenue",              label:"Total Revenue",         group:"Conversions" },
];

function DragChip({ item, onRemove, draggable, onDragStart }) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      style={{
        display:"inline-flex", alignItems:"center", gap:"6px",
        padding:"5px 10px 5px 12px", borderRadius:"6px",
        background:"rgba(255,212,38,0.1)", border:`1px solid rgba(255,212,38,0.3)`,
        color:BL.yellow, fontSize:"12px", fontWeight:600,
        cursor:draggable?"grab":"default", userSelect:"none",
        fontFamily:"'DM Sans',sans-serif",
      }}
    >
      <span>⠿</span>
      {item.label}
      {onRemove && (
        <span onClick={onRemove}
          style={{ cursor:"pointer", color:"rgba(255,212,38,0.6)", fontSize:"14px", lineHeight:1, marginLeft:"2px" }}>×</span>
      )}
    </div>
  );
}

function DropZone({ label, items, onDrop, onRemove, accepts }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={e=>{e.preventDefault();setOver(true);}}
      onDragLeave={()=>setOver(false)}
      onDrop={e=>{e.preventDefault();setOver(false);onDrop(e.dataTransfer.getData("text/plain"), e.dataTransfer.getData("text/group"));}}
      style={{
        border:`2px dashed ${over?BL.yellow:BL.border}`,
        borderRadius:"10px", padding:"14px 16px", minHeight:"80px",
        background:over?"rgba(255,212,38,0.04)":"transparent",
        transition:"all 0.15s",
      }}
    >
      <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px",
        color:over?BL.yellow:BL.lightGrey, marginBottom:"10px" }}>
        {label} {items.length > 0 && <span style={{ color:BL.midGrey }}>({items.length})</span>}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
        {items.length === 0 && (
          <span style={{ fontSize:"12px", color:BL.midGrey }}>Drag {accepts} here…</span>
        )}
        {items.map((item,i) => (
          <DragChip key={item.id} item={item} onRemove={()=>onRemove(item.id)} />
        ))}
      </div>
    </div>
  );
}

function DataExplorer({ selectedProp, tokenData, startDate, endDate }) {
  const [selectedDims,    setSelectedDims]    = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [dimSearch,       setDimSearch]       = useState("");
  const [metSearch,       setMetSearch]       = useState("");
  const [rowLimit,        setRowLimit]        = useState(100);
  const [orderBy,         setOrderBy]         = useState("");
  const [results,         setResults]         = useState(null);
  const [loadingExplore,  setLoadingExplore]  = useState(false);
  const [exploreError,    setExploreError]    = useState(null);
  // Custom dim input
  const [customDimInput,  setCustomDimInput]  = useState("");
  // Filters: [{dimension, matchType, value}]
  const [filters,         setFilters]         = useState([]);
  const [filterDim,       setFilterDim]       = useState("");
  const [filterType,      setFilterType]      = useState("EXACT");
  const [filterValue,     setFilterValue]     = useState("");

  const MATCH_TYPES = [
    { id:"EXACT",      label:"exactly equals" },
    { id:"BEGINS_WITH",label:"begins with" },
    { id:"ENDS_WITH",  label:"ends with" },
    { id:"CONTAINS",   label:"contains" },
    { id:"REGEXP",     label:"matches regex" },
  ];

  const addDim = (dim) => { if (!selectedDims.find(d=>d.id===dim.id)) setSelectedDims(p=>[...p,dim]); };
  const addMetric = (met) => { if (!selectedMetrics.find(m=>m.id===met.id)) setSelectedMetrics(p=>[...p,met]); };
  const removeDim    = (id) => setSelectedDims(p=>p.filter(d=>d.id!==id));
  const removeMetric = (id) => setSelectedMetrics(p=>p.filter(m=>m.id!==id));

  const addCustomDim = () => {
    const raw = customDimInput.trim(); if (!raw) return;
    const id = raw.startsWith("customEvent:")||raw.startsWith("customUser:")||raw.startsWith("customItem:") ? raw : `customEvent:${raw}`;
    const label = raw.includes(":") ? raw.split(":")[1] : raw;
    addDim({ id, label:`${label} (custom)`, group:"Custom" });
    setCustomDimInput("");
  };

  const handleDropDim = (id) => {
    const dim = GA4_DIMENSIONS.find(d=>d.id===id);
    const met = GA4_METRICS.find(m=>m.id===id);
    if (dim) addDim(dim); else if (met) addMetric(met);
  };
  const handleDropMetric = (id) => {
    const met = GA4_METRICS.find(m=>m.id===id);
    const dim = GA4_DIMENSIONS.find(d=>d.id===id);
    if (met) addMetric(met); else if (dim) addDim(dim);
  };

  const addFilter = () => {
    if (!filterDim||!filterValue.trim()) return;
    setFilters(f=>[...f,{dimension:filterDim,matchType:filterType,value:filterValue.trim()}]);
    setFilterDim(""); setFilterValue("");
  };
  const removeFilter = (idx) => setFilters(f=>f.filter((_,i)=>i!==idx));

  const runExplore = async () => {
    if (!selectedProp||!tokenData||(selectedDims.length===0&&selectedMetrics.length===0)) return;
    setLoadingExplore(true); setExploreError(null); setResults(null);
    try {
      const res = await axios.post(
        `${API}/explore?property_id=${selectedProp}&start_date=${startDate||"30daysAgo"}&end_date=${endDate||"today"}`,
        { dimensions:selectedDims.map(d=>d.id), metrics:selectedMetrics.map(m=>m.id),
          limit:rowLimit, order_by_metric:orderBy||(selectedMetrics[0]?.id??""), filters },
        { headers:{ Authorization:`Bearer ${btoa(JSON.stringify(tokenData))}` } }
      );
      if (res.data.success) setResults(res.data); else setExploreError(res.data.error||"Query failed.");
    } catch(e) { setExploreError("Request failed: "+(e.response?.data?.detail||e.message)); }
    finally { setLoadingExplore(false); }
  };

  const dimGroups    = [...new Set(GA4_DIMENSIONS.map(d=>d.group))];
  const metGroups    = [...new Set(GA4_METRICS.map(m=>m.group))];
  const filteredDims = GA4_DIMENSIONS.filter(d=>d.label.toLowerCase().includes(dimSearch.toLowerCase())||d.group.toLowerCase().includes(dimSearch.toLowerCase()));
  const filteredMets = GA4_METRICS.filter(m=>m.label.toLowerCase().includes(metSearch.toLowerCase())||m.group.toLowerCase().includes(metSearch.toLowerCase()));
  const allDimsForFilter = [...GA4_DIMENSIONS, ...selectedDims.filter(d=>!GA4_DIMENSIONS.find(x=>x.id===d.id))];

  if (!selectedProp) return (
    <div style={{padding:"60px 0",textAlign:"center",color:BL.lightGrey}}>
      <div style={{fontSize:"32px",marginBottom:"12px"}}>📊</div>
      <div style={{fontSize:"15px",fontWeight:600,marginBottom:"8px",color:BL.white}}>Select a property first</div>
      <div style={{fontSize:"13px"}}>Choose a GA4 property from the dropdown above to use the Data Explorer.</div>
    </div>
  );

  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <div style={{fontSize:"22px",fontWeight:800,letterSpacing:"-0.6px",marginBottom:"4px"}}>Data Explorer</div>
        <div style={{color:BL.lightGrey,fontSize:"13px"}}>Build a custom GA4 report — click or drag fields, add filters, run the query.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"20px",alignItems:"start"}}>

        {/* Left panel */}
        <div style={{display:"flex",flexDirection:"column",gap:"16px",position:"sticky",top:"80px"}}>
          {/* Custom dim */}
          <div style={S.section}>
            <div style={{...S.sectionHeader,padding:"12px 16px"}}><span style={{...S.sectionTitle,fontSize:"13px"}}>Add Custom Dimension</span></div>
            <div style={{padding:"12px"}}>
              <div style={{fontSize:"11px",color:BL.lightGrey,marginBottom:"8px",lineHeight:"1.5"}}>Enter a param name — auto-prefixed as <code>customEvent:</code> unless you specify <code>customUser:</code></div>
              <div style={{display:"flex",gap:"6px"}}>
                <input style={{...S.input,fontSize:"12px",padding:"7px 10px",flex:1}} placeholder="e.g. site_type"
                  value={customDimInput} onChange={e=>setCustomDimInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addCustomDim()}
                  onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border}/>
                <button onClick={addCustomDim} style={{...S.btnPrimary,width:"auto",padding:"7px 12px",fontSize:"12px"}}>Add</button>
              </div>
            </div>
          </div>

          {/* Dimensions list */}
          <div style={S.section}>
            <div style={{...S.sectionHeader,padding:"12px 16px"}}>
              <span style={{...S.sectionTitle,fontSize:"13px"}}>Dimensions</span>
              <span style={S.sectionCount}>{GA4_DIMENSIONS.length}</span>
            </div>
            <div style={{padding:"10px 12px 6px"}}>
              <input style={{...S.input,fontSize:"12px",padding:"7px 10px"}} placeholder="Search…" value={dimSearch}
                onChange={e=>setDimSearch(e.target.value)}
                onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border}/>
            </div>
            <div style={{maxHeight:"280px",overflowY:"auto",padding:"4px 12px 12px"}}>
              {dimGroups.map(grp=>{
                const items=filteredDims.filter(d=>d.group===grp); if(!items.length) return null;
                return (<div key={grp} style={{marginBottom:"10px"}}>
                  <div style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:BL.midGrey,marginBottom:"5px"}}>{grp}</div>
                  {items.map(dim=>{const sel=!!selectedDims.find(d=>d.id===dim.id);return(
                    <div key={dim.id} draggable onDragStart={e=>e.dataTransfer.setData("text/plain",dim.id)} onClick={()=>addDim(dim)}
                      style={{padding:"5px 8px",borderRadius:"5px",fontSize:"12px",cursor:"pointer",color:sel?BL.yellow:BL.lightGrey,background:sel?"rgba(255,212,38,0.08)":"transparent",marginBottom:"2px",display:"flex",justifyContent:"space-between",alignItems:"center",userSelect:"none"}}
                      onMouseEnter={e=>!sel&&(e.currentTarget.style.background="rgba(255,255,255,0.05)")}
                      onMouseLeave={e=>e.currentTarget.style.background=sel?"rgba(255,212,38,0.08)":"transparent"}>
                      <span>⠿ {dim.label}</span>{sel&&<span style={{color:BL.yellow,fontSize:"10px"}}>✓</span>}
                    </div>
                  );})}
                </div>);
              })}
            </div>
          </div>

          {/* Metrics list */}
          <div style={S.section}>
            <div style={{...S.sectionHeader,padding:"12px 16px"}}>
              <span style={{...S.sectionTitle,fontSize:"13px"}}>Metrics</span>
              <span style={S.sectionCount}>{GA4_METRICS.length}</span>
            </div>
            <div style={{padding:"10px 12px 6px"}}>
              <input style={{...S.input,fontSize:"12px",padding:"7px 10px"}} placeholder="Search…" value={metSearch}
                onChange={e=>setMetSearch(e.target.value)}
                onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border}/>
            </div>
            <div style={{maxHeight:"280px",overflowY:"auto",padding:"4px 12px 12px"}}>
              {metGroups.map(grp=>{
                const items=filteredMets.filter(m=>m.group===grp); if(!items.length) return null;
                return (<div key={grp} style={{marginBottom:"10px"}}>
                  <div style={{fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:BL.midGrey,marginBottom:"5px"}}>{grp}</div>
                  {items.map(met=>{const sel=!!selectedMetrics.find(m=>m.id===met.id);return(
                    <div key={met.id} draggable onDragStart={e=>e.dataTransfer.setData("text/plain",met.id)} onClick={()=>addMetric(met)}
                      style={{padding:"5px 8px",borderRadius:"5px",fontSize:"12px",cursor:"pointer",color:sel?BL.info:BL.lightGrey,background:sel?"rgba(74,158,255,0.08)":"transparent",marginBottom:"2px",display:"flex",justifyContent:"space-between",alignItems:"center",userSelect:"none"}}
                      onMouseEnter={e=>!sel&&(e.currentTarget.style.background="rgba(255,255,255,0.05)")}
                      onMouseLeave={e=>e.currentTarget.style.background=sel?"rgba(74,158,255,0.08)":"transparent"}>
                      <span>⠿ {met.label}</span>{sel&&<span style={{color:BL.info,fontSize:"10px"}}>✓</span>}
                    </div>
                  );})}
                </div>);
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div style={S.section}>
            <div style={{padding:"16px 20px 20px"}}>
              {/* Drop zones */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
                <DropZone label="Dimensions" items={selectedDims} onDrop={handleDropDim} onRemove={removeDim} accepts="dimensions"/>
                <DropZone label="Metrics" items={selectedMetrics} onDrop={handleDropMetric} onRemove={removeMetric} accepts="metrics"/>
              </div>

              {/* Filters */}
              <div style={{borderTop:`1px solid ${BL.border}`,paddingTop:"16px",marginBottom:"16px"}}>
                <div style={{fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:BL.lightGrey,marginBottom:"10px"}}>Dimension Filters</div>
                {filters.length>0&&(
                  <div style={{marginBottom:"10px",display:"flex",flexWrap:"wrap",gap:"6px"}}>
                    {filters.map((f,i)=>{
                      const dimMeta=allDimsForFilter.find(d=>d.id===f.dimension);
                      return(
                        <div key={i} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"6px",background:"rgba(74,158,255,0.1)",border:`1px solid rgba(74,158,255,0.3)`,fontSize:"12px",color:BL.info}}>
                          <span style={{fontWeight:700}}>{dimMeta?.label||f.dimension}</span>
                          <span style={{color:BL.lightGrey}}>{MATCH_TYPES.find(t=>t.id===f.matchType)?.label}</span>
                          <span style={{color:BL.white,fontFamily:"monospace"}}>"{f.value}"</span>
                          <span onClick={()=>removeFilter(i)} style={{cursor:"pointer",color:"rgba(74,158,255,0.6)",fontSize:"14px"}}>×</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:"8px",alignItems:"end"}}>
                  <div>
                    <label style={{...S.inputLabel,marginBottom:"5px"}}>Dimension</label>
                    <select style={{...S.select,fontSize:"12px",padding:"7px 30px 7px 10px"}} value={filterDim} onChange={e=>setFilterDim(e.target.value)}>
                      <option value="">Select…</option>
                      {allDimsForFilter.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{...S.inputLabel,marginBottom:"5px"}}>Match type</label>
                    <select style={{...S.select,fontSize:"12px",padding:"7px 30px 7px 10px"}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
                      {MATCH_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{...S.inputLabel,marginBottom:"5px"}}>Value</label>
                    <input style={{...S.input,fontSize:"12px",padding:"7px 10px"}} placeholder="e.g. scroll, Microsite"
                      value={filterValue} onChange={e=>setFilterValue(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addFilter()}
                      onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border}/>
                  </div>
                  <div style={{paddingTop:"16px"}}>
                    <button onClick={addFilter} style={{...S.btnOutline,padding:"8px 14px",fontSize:"12px",whiteSpace:"nowrap"}}>+ Add Filter</button>
                  </div>
                </div>
              </div>

              {/* Run controls */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"12px",alignItems:"end",borderTop:`1px solid ${BL.border}`,paddingTop:"16px"}}>
                <div>
                  <label style={S.inputLabel}>Sort by Metric</label>
                  <select style={S.select} value={orderBy} onChange={e=>setOrderBy(e.target.value)}>
                    <option value="">Default (first metric)</option>
                    {selectedMetrics.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.inputLabel}>Row Limit</label>
                  <select style={S.select} value={rowLimit} onChange={e=>setRowLimit(Number(e.target.value))}>
                    {[25,50,100,250,500,1000,5000].map(n=><option key={n} value={n}>{n} rows</option>)}
                  </select>
                </div>
                <div>
                  <button style={{...S.btnPrimary,width:"auto",padding:"11px 24px",opacity:loadingExplore||(selectedDims.length===0&&selectedMetrics.length===0)?0.5:1}}
                    onClick={runExplore} disabled={loadingExplore||(selectedDims.length===0&&selectedMetrics.length===0)}>
                    {loadingExplore?"Running…":"Run Report →"}
                  </button>
                </div>
              </div>
              {(selectedDims.length>0||selectedMetrics.length>0)&&(
                <div style={{marginTop:"10px",fontSize:"12px",color:BL.lightGrey}}>
                  {selectedDims.length} dim · {selectedMetrics.length} metric · {filters.length} filter{filters.length!==1?"s":""} · {startDate||"30daysAgo"} → {endDate||"today"}
                  <button onClick={()=>{setSelectedDims([]);setSelectedMetrics([]);setResults(null);setOrderBy("");setFilters([]);}}
                    style={{marginLeft:"12px",background:"none",border:"none",color:BL.danger,fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>
                </div>
              )}
            </div>
          </div>

          {exploreError&&<div style={S.errorBox}><strong>Error:</strong> {exploreError}</div>}
          {loadingExplore&&<div style={{...S.loadingBox,padding:"40px"}}><div style={S.spinner}/><span>Querying GA4…</span></div>}

          {results&&results.rows.length>0&&(
            <div style={S.section}>
              <div style={S.sectionHeader}>
                <span style={S.sectionTitle}>Results</span>
                <div style={{display:"flex",gap:"8px"}}>
                  <span style={S.sectionCount}>{results.row_count.toLocaleString()} rows</span>
                  <span style={{...S.badge,fontSize:"11px"}}>{results.dimensions.length} dim · {results.metrics.length} met · {filters.length} filter{filters.length!==1?"s":""}</span>
                </div>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{...S.th,width:"40px",textAlign:"center"}}>#</th>
                      {results.dimensions.map(d=>{const m=GA4_DIMENSIONS.find(x=>x.id===d)||selectedDims.find(x=>x.id===d);return<th key={d} style={{...S.th,color:BL.yellow}}>{m?.label||d}</th>;})}
                      {results.metrics.map(m=>{const mt=GA4_METRICS.find(x=>x.id===m);return<th key={m} style={{...S.th,color:BL.info}}>{mt?.label||m}</th>;})}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row,i)=>(
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{...S.td,color:BL.midGrey,textAlign:"center",fontSize:"11px"}}>{i+1}</td>
                        {results.dimensions.map(d=><td key={d} style={S.td}>{row[d]||<span style={{color:BL.midGrey}}>(not set)</span>}</td>)}
                        {results.metrics.map(m=><td key={m} style={S.td}><span style={{fontWeight:600,color:BL.white}}>{parseFloat(row[m])%1===0?parseInt(row[m]).toLocaleString():parseFloat(row[m]).toFixed(2)}</span></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {results&&results.rows.length===0&&<div style={{...S.infoBox,textAlign:"center"}}>No data for this combination. Try a different date range, dimensions, or filters.</div>}
          {!results&&!loadingExplore&&(selectedDims.length>0||selectedMetrics.length>0)&&(
            <div style={{padding:"32px",textAlign:"center",color:BL.lightGrey,fontSize:"13px",border:`1px dashed ${BL.border}`,borderRadius:"10px"}}>
              Hit <strong style={{color:BL.white}}>Run Report</strong> to query GA4 with your selected fields.
            </div>
          )}
          {selectedDims.length===0&&selectedMetrics.length===0&&!results&&(
            <div style={{padding:"40px",textAlign:"center",color:BL.lightGrey}}>
              <div style={{fontSize:"28px",marginBottom:"10px"}}>🧩</div>
              <div style={{fontSize:"14px",fontWeight:600,color:BL.white,marginBottom:"6px"}}>Build your report</div>
              <div style={{fontSize:"13px"}}>Click or drag dimensions and metrics from the left panel to get started.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginScreen() {
  return (
    <div style={S.loginWrap}>
      <div style={S.loginCard}>
        <div style={{marginBottom:"20px"}}>
          <span style={{...S.logoMark,fontSize:"16px",padding:"6px 12px"}}>BL</span>
        </div>
        <div style={S.loginTitle}>GA4 Audit Tool</div>
        <div style={S.loginSub}>Sign in with your Google account to audit any GA4 property you have access to.</div>
        <a href={`${API}/auth/google`} style={{textDecoration:"none"}}>
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
        <div style={S.divider}/>
        <div style={S.loginFooter}>Your data is accessed securely via Google OAuth.<br/>Only properties you own or manage will be shown.</div>
      </div>
    </div>
  );
}

// ── SDR Checker Tab ────────────────────────────────────────────────────────
function SDRChecker({ auditData, selectedProp, tokenData, startDate, endDate }) {
  const [sdrRows, setSdrRows]       = useState([]);
  const [results, setResults]       = useState([]);
  const [dragOver, setDragOver]     = useState(false);
  const [fileName, setFileName]     = useState("");
  const [manualEvent, setManualEvent]   = useState("");
  const [manualParams, setManualParams] = useState([""]);
  const [manualRows, setManualRows]     = useState([]);
  const [workbook, setWorkbook]         = useState(null);
  const [sheetNames, setSheetNames]     = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [liveReport, setLiveReport]     = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError]   = useState(null);
  const fileRef = useRef();

  // GA4 live event inventory from audit
  const liveEvents = new Set(
    (auditData?.["GA4 Events"] || []).map(e => e.Check?.trim().toLowerCase())
  );
  // Custom dimensions (parameters) from audit — all scopes combined
  const liveParams = new Set([
    ...(auditData?.["Custom Dimensions - Event Scoped"] || []),
    ...(auditData?.["Custom Dimensions - User Scoped"]  || []),
    ...(auditData?.["Custom Dimensions - Item Scoped"]  || []),
  ].map(e => e.Result?.["Parameter Name"]?.trim().toLowerCase()).filter(Boolean));

  const STANDARD_PARAMS = new Set([
    "page_title","page_location","page_path","page_referrer","session_id",
    "engagement_time_msec","percent_scrolled","form_name","form_id",
    "form_destination","form_length","form_submit_text","link_url","link_text",
    "link_domain","link_classes","link_id","outbound","file_name","file_extension",
    "video_title","video_url","video_provider","video_current_time","video_duration",
    "video_percent","visible","search_term","currency","value","transaction_id",
    "item_id","item_name","item_brand","item_category","item_category2",
    "item_category3","item_category4","item_category5","item_variant","item_list_name",
    "item_list_id","index","price","quantity","coupon","affiliation","shipping","tax",
    "payment_type","shipping_tier","promotion_id","promotion_name","creative_name",
    "creative_slot","location_id","method","content_type","content_id",
    "achievement_id","character","level","score","search_term","virtual_currency_name",
    "value","group_id","language","screen_resolution",
  ]);

  const parseExcel = (file) => {
    setFileName(file.name);
    setSdrRows([]); setResults([]); setSelectedSheet(""); setSheetNames([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      // Auto-select if only one sheet
      if (wb.SheetNames.length === 1) {
        parseSheet(wb, wb.SheetNames[0]);
        setSelectedSheet(wb.SheetNames[0]);
      }
      // Otherwise wait for user to pick — sheet picker UI appears
    };
    reader.readAsBinaryString(file);
  };

  const parseSheet = (wb, sheetName) => {
    const ws = wb.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    // Find header row — look for "Events" or "Event" column
    let headerIdx = -1;
    let eventsCol = -1, paramsCol = -1;
    for (let i = 0; i < Math.min(raw.length, 15); i++) {
      const row = raw[i].map(c => String(c).trim().toLowerCase());
      const eIdx = row.findIndex(c => c === "events" || c === "event name" || c === "event");
      const pIdx = row.findIndex(c => c.includes("param") || c.includes("parameter") || c === "desired parameter");
      if (eIdx >= 0) { headerIdx = i; eventsCol = eIdx; paramsCol = pIdx; break; }
    }
    if (headerIdx < 0) { headerIdx = 3; eventsCol = 0; paramsCol = 2; }

    // Group rows by event name — consecutive blank event cells belong to same event
    const parsed = [];
    let lastEvent = "";
    for (let i = headerIdx + 1; i < raw.length; i++) {
      const row = raw[i];
      const eventName = String(row[eventsCol] || "").trim();
      const paramName = paramsCol >= 0 ? String(row[paramsCol] || "").trim() : "";
      const resolvedEvent = eventName || lastEvent;
      if (!resolvedEvent) continue;
      lastEvent = resolvedEvent;

      // Find existing entry for this event or create one
      const existing = parsed.find(p => p.eventName === resolvedEvent);
      if (existing) {
        if (paramName && !existing.params.includes(paramName)) existing.params.push(paramName);
      } else {
        parsed.push({ eventName: resolvedEvent, params: paramName ? [paramName] : [] });
      }
    }
    setSdrRows(parsed);
    crossCheck(parsed);
  };

  const checkParam = (p) => !p || liveParams.has(p.toLowerCase()) || STANDARD_PARAMS.has(p.toLowerCase());

  const crossCheck = (rows) => {
    const checked = rows.map(r => {
      const eventFound = liveEvents.has(r.eventName.toLowerCase());
      const paramResults = r.params.map(p => ({
        name: p,
        found: checkParam(p),
        isStandard: STANDARD_PARAMS.has(p.toLowerCase()),
      }));
      const allParamsOk = paramResults.every(p => p.found);
      const status = eventFound && allParamsOk ? "found"
        : !eventFound ? "missing_event" : "missing_param";
      return { ...r, eventFound, paramResults, allParamsOk, status };
    });
    setResults(checked);
  };

  const addManual = () => {
    if (!manualEvent.trim()) return;
    const params = manualParams.map(p => p.trim()).filter(Boolean);
    const newRow = { eventName: manualEvent.trim(), params };
    const updated = [...manualRows, newRow];
    setManualRows(updated);
    setManualEvent(""); setManualParams([""]);
    crossCheck([...sdrRows, ...updated]);
  };

  const removeManual = (idx) => {
    const updated = manualRows.filter((_,i) => i !== idx);
    setManualRows(updated);
    crossCheck([...sdrRows, ...updated]);
  };

  const addParamField = () => setManualParams(p => [...p, ""]);
  const updateParamField = (idx, val) => setManualParams(p => p.map((v,i) => i===idx ? val : v));
  const removeParamField = (idx) => setManualParams(p => p.filter((_,i) => i !== idx));

  const fetchLiveReport = async () => {
    if (!selectedProp || !tokenData) return;
    const allEventRows = [...sdrRows, ...manualRows];
    if (allEventRows.length === 0) return;
    const eventNames = [...new Set(allEventRows.map(r => r.eventName))];
    const allParams  = [...new Set(allEventRows.flatMap(r => r.params).filter(Boolean))];
    setReportLoading(true); setReportError(null); setLiveReport(null);
    try {
      const res = await axios.post(
        `${API}/sdr-report?property_id=${selectedProp}&start_date=${startDate||"30daysAgo"}&end_date=${endDate||"today"}`,
        { events: eventNames, params: allParams },
        { headers: { Authorization: `Bearer ${btoa(JSON.stringify(tokenData))}` } }
      );
      if (res.data.success) setLiveReport(res.data.report);
      else setReportError(res.data.error || "Failed to fetch live report.");
    } catch(e) {
      setReportError("Request failed: " + (e.response?.data?.detail || e.message));
    } finally { setReportLoading(false); }
  };

  // ── Unique param stats ─────────────────────────────────────────────────
  const allRows = results.length > 0 ? results : [];
  const foundCount    = allRows.filter(r => r.status === "found").length;
  const missingEvent  = allRows.filter(r => r.status === "missing_event").length;
  const missingParam  = allRows.filter(r => r.status === "missing_param").length;

  // Count unique params across all events + how many times each appears
  const paramCountMap = {};
  allRows.forEach(r => {
    r.params?.forEach(p => {
      if (p) paramCountMap[p] = (paramCountMap[p] || 0) + 1;
    });
  });
  const uniqueParams = Object.entries(paramCountMap).sort((a,b) => b[1]-a[1]);
  const totalUniqueParams = uniqueParams.length;
  const missingUniqueParams = uniqueParams.filter(([p]) =>
    !checkParam(p)
  ).length;

  if (!auditData) {
    return (
      <div style={{ padding:"60px 0", textAlign:"center", color:BL.lightGrey }}>
        <div style={{ fontSize:"32px", marginBottom:"12px" }}>📋</div>
        <div style={{ fontSize:"15px", fontWeight:600, marginBottom:"8px", color:BL.white }}>Run an audit first</div>
        <div style={{ fontSize:"13px" }}>Select a GA4 property and run the audit to enable SDR cross-checking.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"24px" }}>
        <div style={{ fontSize:"22px", fontWeight:800, letterSpacing:"-0.6px", marginBottom:"4px" }}>SDR Event Checker</div>
        <div style={{ color:BL.lightGrey, fontSize:"13px" }}>
          Upload your Solution Design Reference (Excel) to cross-check expected events and parameters against live GA4 data.
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"24px" }}>
        {/* Excel Upload */}
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Import SDR (Excel)</span>
            {fileName && <span style={S.sectionCount}>{fileName}</span>}
          </div>
          <div style={{ padding:"20px" }}>
            <div
              style={S.dropzone(dragOver)}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)parseExcel(f);}}
              onClick={()=>fileRef.current.click()}
            >
              <div style={{ fontSize:"28px", marginBottom:"10px" }}>📂</div>
              <div style={{ fontWeight:700, fontSize:"14px", marginBottom:"4px" }}>
                {fileName ? `✓ ${fileName}` : "Drop your SDR Excel here"}
              </div>
              <div style={{ fontSize:"12px", color:BL.lightGrey }}>
                {fileName ? "Click to replace file" : "or click to browse · .xlsx, .xls supported"}
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}}
                onChange={e=>{if(e.target.files[0])parseExcel(e.target.files[0]);}}/>
            </div>

            {/* Sheet picker — shown when file has multiple tabs */}
            {sheetNames.length > 1 && (
              <div style={{ marginTop:"16px" }}>
                <label style={S.inputLabel}>
                  Select Sheet / Tab
                  <span style={{ color:BL.lightGrey, fontWeight:400, marginLeft:"8px", textTransform:"none", letterSpacing:0 }}>
                    {sheetNames.length} sheets found in this file
                  </span>
                </label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {sheetNames.map(name => (
                    <button
                      key={name}
                      onClick={() => { setSelectedSheet(name); parseSheet(workbook, name); }}
                      style={{
                        padding:"7px 14px",
                        borderRadius:"7px",
                        border:`1px solid ${selectedSheet===name ? BL.yellow : BL.border}`,
                        background: selectedSheet===name ? "rgba(255,212,38,0.12)" : "transparent",
                        color: selectedSheet===name ? BL.yellow : BL.lightGrey,
                        fontSize:"13px",
                        fontWeight: selectedSheet===name ? 700 : 500,
                        cursor:"pointer",
                        fontFamily:"inherit",
                        transition:"all 0.15s",
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                {!selectedSheet && (
                  <div style={{ marginTop:"10px", fontSize:"12px", color:BL.warning }}>
                    ⚠ Pick a sheet above to load its data
                  </div>
                )}
              </div>
            )}

            {/* Confirmation of what was parsed */}
            {sdrRows.length > 0 && (
              <div style={{ marginTop:"12px", fontSize:"12px", color:BL.success }}>
                ✓ Loaded <strong>{sdrRows.length}</strong> rows from
                {selectedSheet ? <strong> "{selectedSheet}"</strong> : " the sheet"}
              </div>
            )}

            <div style={{ marginTop:"14px", fontSize:"12px", color:BL.lightGrey, lineHeight:"1.6" }}>
              <strong style={{color:BL.white}}>Expected column names:</strong><br/>
              Column A → <code style={{color:BL.yellow}}>Events</code> &nbsp;|&nbsp;
              Column C → <code style={{color:BL.yellow}}>Event Parameters</code><br/>
              Matches your current SDR layout automatically.
            </div>
          </div>
        </div>

        {/* Manual Entry */}
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <span style={S.sectionTitle}>Manual Entry</span>
            <span style={S.sectionCount}>{manualRows.length} added</span>
          </div>
          <div style={{ padding:"20px" }}>
            <div style={{ marginBottom:"12px" }}>
              <label style={S.inputLabel}>Event Name</label>
              <input style={S.input} placeholder="e.g. form_submit" value={manualEvent}
                onChange={e=>setManualEvent(e.target.value)}
                onFocus={e=>e.target.style.borderColor=BL.yellow}
                onBlur={e=>e.target.style.borderColor=BL.border}/>
            </div>
            <div style={{ marginBottom:"12px" }}>
              <label style={S.inputLabel}>
                Parameters
                <span style={{ color:BL.lightGrey, fontWeight:400, marginLeft:"8px", textTransform:"none", letterSpacing:0 }}>
                  add as many as needed
                </span>
              </label>
              {manualParams.map((p, idx) => (
                <div key={idx} style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                  <input
                    style={{ ...S.input, flex:1 }}
                    placeholder={`Parameter ${idx+1} e.g. form_name`}
                    value={p}
                    onChange={e => updateParamField(idx, e.target.value)}
                    onKeyDown={e => { if(e.key==="Enter") addParamField(); }}
                    onFocus={e=>e.target.style.borderColor=BL.yellow}
                    onBlur={e=>e.target.style.borderColor=BL.border}
                  />
                  {manualParams.length > 1 && (
                    <button onClick={()=>removeParamField(idx)}
                      style={{ background:"none", border:`1px solid ${BL.border}`, color:BL.lightGrey, borderRadius:"8px", padding:"0 12px", cursor:"pointer", fontSize:"16px" }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addParamField} style={{ ...S.btnGhost, fontSize:"12px", padding:"6px 14px", marginTop:"4px" }}>
                + Add another parameter
              </button>
            </div>
            <div style={{ display:"flex", gap:"10px", marginTop:"4px" }}>
              <button style={{ ...S.btnPrimary, width:"auto", padding:"10px 20px" }} onClick={addManual}>
                Add Event
              </button>
            </div>

            {manualRows.length > 0 && (
              <div style={{ marginTop:"16px", maxHeight:"200px", overflowY:"auto" }}>
                {manualRows.map((r,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${BL.border}`, fontSize:"13px" }}>
                    <div>
                      <span style={{ color:BL.white, fontWeight:700 }}>{r.eventName}</span>
                      {r.params.length > 0 && (
                        <div style={{ marginTop:"4px", display:"flex", flexWrap:"wrap", gap:"4px" }}>
                          {r.params.map((p,pi) => (
                            <span key={pi} style={{ ...S.pillNeutral, fontSize:"11px" }}>{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={()=>removeManual(i)} style={{ background:"none", border:"none", color:BL.lightGrey, cursor:"pointer", fontSize:"16px", flexShrink:0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {allRows.length > 0 && (
        <>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" }}>
            {[
              { label:"Events Found in GA4",     value:foundCount,          color:BL.success },
              { label:"Events Not in GA4",        value:missingEvent,        color:BL.danger  },
              { label:"Params Not Registered",    value:missingParam,        color:BL.warning },
              { label:"Unique Parameters (SDR)",  value:totalUniqueParams,   color:BL.info    },
            ].map((k,i) => (
              <div key={i} style={S.kpiCard}>
                <div style={{...S.kpiAccent,background:k.color}}/>
                <div style={S.kpiLabel}>{k.label}</div>
                <div style={{...S.kpiValue,color:k.color}}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={S.infoBox}>
            ⓘ Events matched against live GA4 inventory. Parameters checked against registered Custom Dimensions and all standard GA4 parameters. Standard params (page_title, form_name, currency etc.) are always marked as registered.
          </div>

          {/* Results Table — one row per event with all params inline */}
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <span style={S.sectionTitle}>Cross-Check Results</span>
              <span style={S.sectionCount}>{allRows.length} events checked</span>
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Event Name</th>
                    <th style={S.th}>Parameters</th>
                    <th style={S.th}>Event in GA4</th>
                    <th style={S.th}>Params Status</th>
                    <th style={S.th}>Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((r,i) => (
                    <tr key={i}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    >
                      <td style={S.td}>
                        <span style={{ fontFamily:"monospace", fontSize:"12px", fontWeight:700, color:BL.white }}>{r.eventName}</span>
                      </td>
                      <td style={S.td}>
                        {r.params?.length > 0 ? (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                            {r.paramResults.map((p,pi) => (
                              <span key={pi} style={{
                                fontFamily:"monospace", fontSize:"11px", padding:"2px 8px", borderRadius:"4px",
                                background: p.found ? "rgba(0,200,150,0.1)" : "rgba(255,152,0,0.1)",
                                color: p.found ? BL.success : BL.warning,
                                border: `1px solid ${p.found ? "rgba(0,200,150,0.3)" : "rgba(255,152,0,0.3)"}`,
                              }}>
                                {p.name}{p.isStandard ? " ⓘ" : ""}
                              </span>
                            ))}
                          </div>
                        ) : <span style={{ color:BL.lightGrey, fontSize:"12px" }}>—</span>}
                      </td>
                      <td style={S.td}>
                        {r.eventFound
                          ? <span style={S.pill(true)}>✓ Found</span>
                          : <span style={S.pill(false)}>✗ Not found</span>}
                      </td>
                      <td style={S.td}>
                        {r.params?.length === 0
                          ? <span style={S.pillNeutral}>— N/A</span>
                          : r.allParamsOk
                          ? <span style={S.pill(true)}>✓ All registered</span>
                          : <span style={S.pillWarning}>⚠ {r.paramResults.filter(p=>!p.found).length} missing</span>}
                      </td>
                      <td style={S.td}>
                        {r.status==="found"
                          ? <span style={S.pill(true)}>✓ All good</span>
                          : r.status==="missing_event"
                          ? <span style={S.pill(false)}>✗ Event missing</span>
                          : <span style={S.pillWarning}>⚠ Param issue</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unique Parameters Summary */}
          {uniqueParams.length > 0 && (
            <div style={S.section}>
              <div style={S.sectionHeader}>
                <span style={S.sectionTitle}>Unique Parameters in SDR</span>
                <div style={{ display:"flex", gap:"8px" }}>
                  <span style={{ ...S.sectionCount, background:"rgba(0,200,150,0.12)", color:BL.success }}>
                    {uniqueParams.length - missingUniqueParams} registered
                  </span>
                  {missingUniqueParams > 0 && (
                    <span style={{ ...S.sectionCount, background:"rgba(255,152,0,0.12)", color:BL.warning }}>
                      {missingUniqueParams} not registered
                    </span>
                  )}
                </div>
              </div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Parameter Name</th>
                      <th style={S.th}>Used in # Events</th>
                      <th style={S.th}>Type</th>
                      <th style={S.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueParams.map(([param, count], i) => {
                      const found = checkParam(param);
                      const isStd = STANDARD_PARAMS.has(param.toLowerCase());
                      const isCustom = liveParams.has(param.toLowerCase());
                      return (
                        <tr key={i}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        >
                          <td style={S.td}>
                            <span style={{ fontFamily:"monospace", fontSize:"12px", color:BL.white, fontWeight:600 }}>{param}</span>
                          </td>
                          <td style={S.td}>
                            <span style={{ ...S.sectionCount, fontSize:"12px" }}>{count} event{count>1?"s":""}</span>
                          </td>
                          <td style={S.td}>
                            {isStd
                              ? <span style={S.pillNeutral}>Standard GA4</span>
                              : isCustom
                              ? <span style={{ ...S.pillNeutral, color:BL.info, background:"rgba(74,158,255,0.1)" }}>Custom Dim</span>
                              : <span style={{ ...S.pillNeutral, color:BL.warning, background:"rgba(255,152,0,0.1)" }}>Unknown</span>}
                          </td>
                          <td style={S.td}>
                            {found
                              ? <span style={S.pill(true)}>✓ Registered</span>
                              : <span style={S.pillWarning}>⚠ Not registered</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {allRows.length === 0 && (
        <div style={{ padding:"40px", textAlign:"center", color:BL.lightGrey, fontSize:"13px" }}>
          Upload an SDR Excel file or add events manually above to start checking.
        </div>
      )}

      {/* Live Data Report */}
      {allRows.length > 0 && (
        <div style={{ marginTop:"28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
            <div>
              <div style={{ fontSize:"18px", fontWeight:800, letterSpacing:"-0.5px", marginBottom:"4px" }}>Live GA4 Data Report</div>
              <div style={{ fontSize:"13px", color:BL.lightGrey }}>
                Fetch actual event counts and parameter values from GA4 for your SDR events.
              </div>
            </div>
            <button
              style={{ ...S.btnPrimary, width:"auto", padding:"11px 24px", opacity:reportLoading||!selectedProp?0.5:1, cursor:!selectedProp?"not-allowed":"pointer" }}
              onClick={fetchLiveReport}
              disabled={reportLoading || !selectedProp}
            >
              {reportLoading ? "Fetching…" : "Fetch Live Data →"}
            </button>
          </div>

          {!selectedProp && (
            <div style={S.infoBox}>ⓘ Select a GA4 property and run an audit first to enable live data fetching.</div>
          )}
          {reportError && <div style={S.errorBox}><strong>Error:</strong> {reportError}</div>}
          {reportLoading && <div style={S.loadingBox}><div style={S.spinner}/><span>Querying GA4 Data API…</span></div>}

          {liveReport && (
            <div style={S.section}>
              <div style={S.sectionHeader}>
                <span style={S.sectionTitle}>Event Performance Report</span>
                <span style={S.sectionCount}>{liveReport.length} events</span>
              </div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Event Name</th>
                      <th style={S.th}>In GA4</th>
                      <th style={S.th}>Event Count</th>
                      <th style={S.th}>Total Users</th>
                      <th style={S.th}>Parameter Values (Top 5)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveReport.map((row, i) => (
                      <tr key={i}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <td style={S.td}>
                          <span style={{ fontFamily:"monospace", fontSize:"12px", fontWeight:700, color:BL.white }}>{row.eventName}</span>
                        </td>
                        <td style={S.td}>
                          {row.inGA4 ? <span style={S.pill(true)}>✓ Found</span> : <span style={S.pill(false)}>✗ Not found</span>}
                        </td>
                        <td style={S.td}>
                          <span style={{ fontWeight:700, color:row.eventCount>0?BL.white:BL.lightGrey }}>
                            {row.eventCount > 0 ? row.eventCount.toLocaleString() : "0"}
                          </span>
                        </td>
                        <td style={S.td}>
                          <span style={{ color:BL.lightGrey }}>{row.totalUsers > 0 ? row.totalUsers.toLocaleString() : "—"}</span>
                        </td>
                        <td style={S.td}>
                          {Object.entries(row.paramData || {}).length > 0 ? (
                            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                              {Object.entries(row.paramData).map(([param, values]) => (
                                <div key={param}>
                                  <span style={{ fontFamily:"monospace", fontSize:"11px", color:BL.info, marginRight:"6px" }}>{param}:</span>
                                  {values.length > 0 ? (
                                    <span style={{ fontSize:"11px", color:BL.lightGrey }}>
                                      {values.slice(0,5).map(v => `${v.value} (${v.count.toLocaleString()})`).join(" · ")}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize:"11px", color:BL.lightGrey }}>no data</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : <span style={{ color:BL.lightGrey, fontSize:"12px" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Auth helpers ────────────────────────────────────────────────────────────
function makeAuthHeader(td) { return { Authorization: `Bearer ${btoa(JSON.stringify(td))}` }; }
function saveAuth(p) { localStorage.setItem("ga4_auth", JSON.stringify(p)); }
function loadAuth() { try { const r=localStorage.getItem("ga4_auth"); return r?JSON.parse(r):null; } catch{return null;} }
function clearAuth() { localStorage.removeItem("ga4_auth"); }

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]       = useState("audit");
  const [user, setUser]                 = useState(null);
  const [tokenData, setTokenData]       = useState(null);
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
    const hash = window.location.hash;
    if (hash.startsWith("#auth=")) {
      try {
        const payload = JSON.parse(atob(hash.slice(6)));
        saveAuth(payload);
        setUser(payload.user_info); setTokenData(payload.token_data);
        window.history.replaceState(null, "", window.location.pathname);
        setAuthLoading(false); loadProperties(payload.token_data); return;
      } catch(e) { console.error(e); }
    }
    const saved = loadAuth();
    if (saved?.token_data && saved?.user_info) {
      setUser(saved.user_info); setTokenData(saved.token_data);
      setAuthLoading(false); loadProperties(saved.token_data); return;
    }
    setAuthLoading(false);
  }, []);

  const loadProperties = async (td) => {
    setPropLoading(true);
    try {
      const res = await axios.get(`${API}/list-properties`, { headers: makeAuthHeader(td) });
      if (res.data.success) setProperties(res.data.properties);
    } catch(e) { console.error(e); }
    finally { setPropLoading(false); }
  };

  const handleLogout = () => {
    clearAuth(); setUser(null); setTokenData(null);
    setProperties([]); setData(null); setSelectedProp("");
  };

  const runAudit = async () => {
    if (!selectedProp||!tokenData) return;
    setLoading(true); setError(null); setData(null);
    try {
      const res = await axios.get(`${API}/run-audit`, {
        params:{property_id:selectedProp,start_date:startDate||"30daysAgo",end_date:endDate||"today"},
        headers: makeAuthHeader(tokenData),
      });
      if (res.data.success) { setData(res.data.data); setActiveTab("audit"); }
      else setError(res.data.error||"Unknown error.");
    } catch(err) { setError("Audit failed: "+(err.response?.data?.detail||err.message)); }
    finally { setLoading(false); }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current,{scale:2,backgroundColor:"#0A0A0A"});
      const imgData = canvas.toDataURL("image/png");
      const pdf = new window.jspdf.jsPDF("p","mm","a4");
      const imgW=210,pageH=297,imgH=canvas.height*imgW/canvas.width;
      let left=imgH,pos=0;
      pdf.addImage(imgData,"PNG",0,pos,imgW,imgH); left-=pageH;
      while(left>=0){pos=left-imgH;pdf.addPage();pdf.addImage(imgData,"PNG",0,pos,imgW,imgH);left-=pageH;}
      pdf.save("GA4_Audit_Report.pdf");
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  const kpis = data?extractKPIs(data):[];
  const summaryItems = data?generateSummary(data):[];
  const health = summaryItems.length===1&&summaryItems[0].type==="ok"?"healthy"
    :summaryItems.some(s=>s.type==="error")?"critical":"warning";
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
        code{background:rgba(255,212,38,0.1);padding:1px 5px;border-radius:3px;font-size:11px;}
      `}</style>
      <div style={S.root}>

        {/* Topbar */}
        <div style={S.topbar}>
          <div style={S.logo}>
            <span style={S.logoMark}>BL</span>
            <span>GA4 Audit</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            {data&&(
              <span style={{...S.badge,background:health==="healthy"?"rgba(0,200,150,0.15)":health==="critical"?"rgba(255,68,68,0.15)":"rgba(255,152,0,0.15)",color:health==="healthy"?BL.success:health==="critical"?BL.danger:BL.warning}}>
                ● {health==="healthy"?"Healthy":health==="critical"?"Issues Found":"Warnings"}
              </span>
            )}
            {user&&(
              <div style={S.userChip}>
                {user.picture?<img src={user.picture} alt="" style={S.avatar} referrerPolicy="no-referrer"/>
                  :<div style={S.avatarFallback}>{user.name?.[0]??"U"}</div>}
                <span style={{fontSize:"13px",fontWeight:600,color:BL.white}}>{user.name?.split(" ")[0]}</span>
                <button onClick={handleLogout} style={{...S.btnGhost,padding:"4px 10px",fontSize:"12px",marginLeft:"4px"}}>Sign out</button>
              </div>
            )}
          </div>
        </div>

        <div style={S.main}>
          {authLoading&&<div style={S.loadingBox}><div style={S.spinner}/><span>Loading…</span></div>}
          {!authLoading&&!user&&<LoginScreen/>}

          {!authLoading&&user&&(
            <>
              {/* Input Panel — always visible */}
              <div style={S.inputPanel}>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:"16px",alignItems:"end"}}>
                  <div>
                    <label style={S.inputLabel}>
                      GA4 Property
                      {propLoading&&<span style={{color:BL.lightGrey,fontWeight:400,marginLeft:"8px",textTransform:"none",letterSpacing:0}}>Loading…</span>}
                    </label>
                    <select style={S.select} value={selectedProp} onChange={e=>{setSelectedProp(e.target.value);setData(null);}}>
                      <option value="">— Select a property —</option>
                      {properties.map(p=>(
                        <option key={p.property_id} value={p.property_id}>
                          {p.display_name} · {p.account_name} · {p.property_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={S.inputLabel}>Start Date</label>
                    <input style={S.input} placeholder="YYYY-MM-DD" value={startDate} onChange={e=>setStartDate(e.target.value)}
                      onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border}/>
                  </div>
                  <div>
                    <label style={S.inputLabel}>End Date</label>
                    <input style={S.input} placeholder="YYYY-MM-DD" value={endDate} onChange={e=>setEndDate(e.target.value)}
                      onFocus={e=>e.target.style.borderColor=BL.yellow} onBlur={e=>e.target.style.borderColor=BL.border}/>
                  </div>
                  <div>
                    <button style={{...S.btnPrimary,opacity:loading||!selectedProp?0.5:1,cursor:!selectedProp?"not-allowed":"pointer"}}
                      onClick={runAudit} disabled={loading||!selectedProp}>
                      {loading?"Running…":"Run Audit →"}
                    </button>
                  </div>
                </div>
                {selectedProp&&(
                  <div style={{marginTop:"12px",fontSize:"12px",color:BL.lightGrey}}>
                    Auditing: <span style={{color:BL.white,fontWeight:600}}>{selectedPropName}</span>
                    {" · "}Range: <span style={{color:BL.white}}>{startDate||"30daysAgo"} → {endDate||"today"}</span>
                  </div>
                )}
              </div>

              {error&&<div style={S.errorBox}><strong>Error:</strong> {error}</div>}
              {loading&&<div style={S.loadingBox}><div style={S.spinner}/><span>Fetching data from GA4 API…</span></div>}

              {/* Tabs */}
              <div style={S.tabs}>
                <button style={S.tab(activeTab==="audit")} onClick={()=>setActiveTab("audit")}>Audit Report</button>
                <button style={S.tab(activeTab==="sdr")} onClick={()=>setActiveTab("sdr")}>
                  SDR Checker {data&&<span style={{marginLeft:"6px",background:activeTab==="sdr"?"rgba(0,0,0,0.15)":"rgba(255,212,38,0.2)",color:activeTab==="sdr"?BL.black:BL.yellow,fontSize:"10px",padding:"1px 6px",borderRadius:"10px",fontWeight:800}}>NEW</span>}
                </button>
                <button style={S.tab(activeTab==="explorer")} onClick={()=>setActiveTab("explorer")}>
                  Data Explorer {<span style={{marginLeft:"6px",background:activeTab==="explorer"?"rgba(0,0,0,0.15)":"rgba(255,212,38,0.2)",color:activeTab==="explorer"?BL.black:BL.yellow,fontSize:"10px",padding:"1px 6px",borderRadius:"10px",fontWeight:800}}>NEW</span>}
                </button>
              </div>

              {/* Audit Tab */}
              {activeTab==="audit"&&data&&(
                <div ref={reportRef} className="fade-in">
                  {kpis.length>0&&(
                    <>
                      <div style={{fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:BL.lightGrey,marginBottom:"12px"}}>Dashboard Overview</div>
                      <div style={S.kpiGrid}>
                        {kpis.map((k,i)=>(
                          <div key={i} style={S.kpiCard}>
                            <div style={{...S.kpiAccent,background:k.color}}/>
                            <div style={S.kpiLabel}>{k.label}</div>
                            <div style={{...S.kpiValue,color:k.color}}>{k.value}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div style={{...S.section,marginBottom:"28px"}}>
                    <div style={S.sectionHeader}>
                      <span style={S.sectionTitle}>Audit Summary</span>
                      <span style={{...S.badge,background:health==="healthy"?"rgba(0,200,150,0.12)":health==="critical"?"rgba(255,68,68,0.12)":"rgba(255,152,0,0.12)",color:health==="healthy"?BL.success:health==="critical"?BL.danger:BL.warning}}>
                        {summaryItems.filter(s=>s.type==="error").length} errors · {summaryItems.filter(s=>s.type==="warning").length} warnings
                      </span>
                    </div>
                    <div style={{padding:"16px 20px"}}>
                      {summaryItems.map((s,i)=>(
                        <div key={i} style={S.summaryCard(s.type)}>
                          <div style={S.summaryIcon(s.type)}>{s.type==="error"?"✕":s.type==="warning"?"!":"✓"}</div>
                          <div style={{fontSize:"14px",lineHeight:"1.5"}}>{s.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {data["Property Details"]?.length>0&&<AuditSection title="Property Details" count={data["Property Details"].length}><CheckResultTable entries={data["Property Details"]}/></AuditSection>}
                  {data["Streams Configuration"]?.length>0&&<AuditSection title="Streams Configuration" count={data["Streams Configuration"].length}><CheckResultTable entries={data["Streams Configuration"]}/></AuditSection>}
                  {data["GA4 Property Limits"]?.length>0&&<AuditSection title="GA4 Property Limits"><CheckResultTable entries={data["GA4 Property Limits"]}/></AuditSection>}
                  {data["GA4 Events"]?.length>0&&<AuditSection title="Event Inventory" count={data["GA4 Events"].length}><CheckResultTable entries={data["GA4 Events"]}/></AuditSection>}

                  {/* Custom Dimensions — split by scope */}
                  {["Event Scoped","User Scoped","Item Scoped"].map(scope => {
                    const key = `Custom Dimensions - ${scope}`;
                    const entries = data[key];
                    if (!entries?.length) return null;
                    const scopeColor = scope==="Event Scoped"?BL.info:scope==="User Scoped"?BL.success:BL.warning;
                    return (
                      <AuditSection key={key} title={`Custom Dimensions — ${scope}`} count={entries.length}>
                        <div style={S.tableWrap}>
                          <table style={S.table}>
                            <thead>
                              <tr>
                                <th style={S.th}>Display Name</th>
                                <th style={S.th}>Parameter Name</th>
                                <th style={S.th}>Scope</th>
                                <th style={S.th}>Ads Personalization</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entries.map((e,i) => (
                                <tr key={i}
                                  onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,0.03)"}
                                  onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}
                                >
                                  <td style={S.td}>{e.Check}</td>
                                  <td style={S.td}><span style={{fontFamily:"monospace",fontSize:"12px",color:scopeColor}}>{e.Result?.["Parameter Name"]??"—"}</span></td>
                                  <td style={S.td}><span style={{...S.pillNeutral,color:scopeColor,background:`${scopeColor}18`}}>{e.Result?.Scope??"—"}</span></td>
                                  <td style={S.td}>{e.Result?.["Ads Personalization Excluded"]==="True"?<span style={S.pill(false)}>Excluded</span>:<span style={S.pill(true)}>Included</span>}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AuditSection>
                    );
                  })}

                  {data["Key Event Details"]?.length>0&&<AuditSection title="Key Event Details" count={data["Key Event Details"].length}><AuditTable columns={["Event Name","Create Time","Counting Method"]} rows={data["Key Event Details"].slice(0,15).map(e=>[e.Check,e.Result?.["Create Time"]??"—",e.Result?.["Counting Method"]??"—"])}/></AuditSection>}
                  {data["PII Check"]?.length>0&&<AuditSection title="PII Check"><CheckResultTable entries={data["PII Check"]}/></AuditSection>}
                  {data["Transactions"]?.length>0&&<AuditSection title="Transaction Health"><CheckResultTable entries={data["Transactions"]}/></AuditSection>}
                  {data["Duplicate Transactions"]?.length>0&&<AuditSection title="Duplicate Transactions" count={data["Duplicate Transactions"].length}><AuditTable columns={["Transaction ID","Count"]} rows={data["Duplicate Transactions"].slice(0,15).map(e=>[e.transactionId,{node:<span style={{color:BL.danger,fontWeight:700}}>{e.count}</span>}])}/></AuditSection>}
                  {data["Revenue Only Transactions"]?.length>0&&<AuditSection title="Revenue with Missing Item Data" count={data["Revenue Only Transactions"].length}><AuditTable columns={["Transaction ID"]} rows={data["Revenue Only Transactions"].slice(0,15).map(t=>[t])}/></AuditSection>}
                  {data["Items Only Transactions"]?.length>0&&<AuditSection title="Items with No Revenue Data" count={data["Items Only Transactions"].length}><AuditTable columns={["Transaction ID"]} rows={data["Items Only Transactions"].slice(0,15).map(t=>[t])}/></AuditSection>}
                  {data["Transaction Mapping"]?.length>0&&(
                    <AuditSection title="Transaction Mapping">
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                        <div style={{borderRight:`1px solid ${BL.border}`}}>
                          <div style={{padding:"10px 16px",fontSize:"11px",fontWeight:700,color:BL.lightGrey,textTransform:"uppercase",letterSpacing:"0.8px",borderBottom:`1px solid ${BL.border}`}}>Revenue (Top 15)</div>
                          <AuditTable columns={["Transaction ID","Revenue"]} rows={data["Transaction Mapping"].filter(e=>e.source==="Revenue Table").slice(0,15).map(e=>[e.transactionId,e.revenue])}/>
                        </div>
                        <div>
                          <div style={{padding:"10px 16px",fontSize:"11px",fontWeight:700,color:BL.lightGrey,textTransform:"uppercase",letterSpacing:"0.8px",borderBottom:`1px solid ${BL.border}`}}>Items (Top 15)</div>
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
                  <div style={{display:"flex",justifyContent:"center",marginTop:"40px",paddingBottom:"48px"}}>
                    <button style={{...S.btnPrimary,width:"auto",padding:"14px 40px",fontSize:"15px",opacity:loading?0.5:1}}
                      onClick={handleDownloadPdf} disabled={loading}>
                      {loading?"Generating…":"Download Report (PDF)"}
                    </button>
                  </div>
                </div>
              )}

              {/* SDR Tab */}
              {activeTab==="sdr"&&<SDRChecker auditData={data} selectedProp={selectedProp} tokenData={tokenData} startDate={startDate} endDate={endDate}/>}

              {activeTab==="explorer"&&<DataExplorer selectedProp={selectedProp} tokenData={tokenData} startDate={startDate} endDate={endDate}/>}

              {/* Empty state when no audit yet */}
              {activeTab==="audit"&&!data&&!loading&&(
                <div style={{padding:"60px 0",textAlign:"center",color:BL.lightGrey}}>
                  <div style={{fontSize:"32px",marginBottom:"12px"}}>🔍</div>
                  <div style={{fontSize:"15px",fontWeight:600,marginBottom:"8px",color:BL.white}}>Ready to audit</div>
                  <div style={{fontSize:"13px"}}>Select a property above and hit Run Audit to get started.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}