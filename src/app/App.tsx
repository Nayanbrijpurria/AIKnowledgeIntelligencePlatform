import { useState, useRef, useEffect } from "react";
import {
  Brain,
  FileText,
  Search,
  Shield,
  Wrench,
  Activity,
  Upload,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Network,
  Zap,
  Send,
  RotateCcw,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileSearch,
  Layers,
  GitBranch,
  Eye,
  MoreHorizontal,
  Circle,
  ArrowUpRight,
  BookOpen,
  Settings,
  Bell,
  ChevronDown,
  X,
  Plus,
} from "lucide-react";

// --- DATA ---
const kpiData = [
  { label: "Documents Indexed", value: "1,24,847", delta: "+2,341", up: true, unit: "docs" },
  { label: "Knowledge Entities", value: "4,72,293", delta: "+8,920", up: true, unit: "entities" },
  { label: "Avg Query Latency", value: "1.4s", delta: "-0.3s", up: true, unit: "" },
  { label: "Compliance Score", value: "87.4%", delta: "+3.1%", up: true, unit: "" },
];

const ingestTrend = [
  { day: "Jun 16", docs: 1840 }, { day: "Jun 17", docs: 2210 }, { day: "Jun 18", docs: 1950 },
  { day: "Jun 19", docs: 3100 }, { day: "Jun 20", docs: 2780 }, { day: "Jun 21", docs: 3420 },
  { day: "Jun 22", docs: 2950 },
];

const docTypeData = [
  { name: "P&ID Drawings", count: 18420, color: "#f59e0b" },
  { name: "Maintenance WOs", count: 34210, color: "#3b82f6" },
  { name: "Inspection Reports", count: 22840 , color: "#10b981" },
  { name: "SOPs & Procedures", count: 15600, color: "#f97316" },
  { name: "Regulatory Filings", count: 8320, color: "#8b5cf6" },
  { name: "OEM Manuals", count: 11240, color: "#06b6d4" },
];

const complianceGaps = [
  { regulation: "OISD-117", area: "Fire & Explosion Protection", status: "GAP", severity: "HIGH", lastAudit: "2024-03-12" },
  { regulation: "PESO 2023", area: "Pressure Vessel Inspection", status: "PARTIAL", severity: "MEDIUM", lastAudit: "2024-05-01" },
  { regulation: "Factory Act §41", area: "Hazard Communication", status: "COMPLIANT", severity: "LOW", lastAudit: "2024-06-10" },
  { regulation: "ISO 45001", area: "OHS Management System", status: "GAP", severity: "HIGH", lastAudit: "2024-01-20" },
  { regulation: "BIS IS 2147", area: "Flameproof Equipment", status: "COMPLIANT", severity: "LOW", lastAudit: "2024-05-28" },
  { regulation: "MoEF EP Act", area: "Effluent Discharge Limits", status: "PARTIAL", severity: "MEDIUM", lastAudit: "2024-04-15" },
];

const equipmentHealth = [
  { tag: "P-101A", name: "Feed Pump A", health: 92, trend: "stable", location: "Unit 3 - Suction Header" },
  { tag: "HX-204", name: "Shell & Tube HX", health: 67, trend: "degrading", location: "Train 2 - Heat Recovery" },
  { tag: "K-301", name: "Gas Compressor", health: 41, trend: "critical", location: "Compression Bay" },
  { tag: "V-105", name: "Knockout Drum", health: 88, trend: "stable", location: "Separation Unit" },
  { tag: "E-406", name: "Cooling Tower Fan", health: 74, trend: "degrading", location: "Utility Area" },
  { tag: "FV-112", name: "Flow Control Valve", health: 55, trend: "degrading", location: "Unit 1 - Feed Line" },
];

const rcaAlerts = [
  { id: "RCA-2241", equipment: "K-301 Gas Compressor", pattern: "Bearing vibration signature matches 3 prior failures — L2/L3 bearing race wear", confidence: 94, priority: "CRITICAL" },
  { id: "RCA-2238", equipment: "HX-204 Shell & Tube", pattern: "Fouling rate consistent with cooling water quality deviation in April–May 2024", confidence: 81, priority: "HIGH" },
  { id: "RCA-2235", equipment: "FV-112 Flow Control Valve", pattern: "Stem packing wear detected — correlates with high-cycle operation in Jun 2023", confidence: 76, priority: "MEDIUM" },
];

const ingestionQueue = [
  { file: "Turnaround_2024_WO_Bundle_v3.pdf", type: "Work Orders", pages: 847, status: "processing", progress: 72 },
  { file: "K301_OEM_Manual_Rev5.pdf", type: "OEM Manual", pages: 312, status: "extracting", progress: 45 },
  { file: "OISD117_Gap_Audit_June2024.xlsx", type: "Audit Report", pages: 94, status: "queued", progress: 0 },
  { file: "Train2_PID_Rev14.dwg", type: "P&ID Drawing", pages: 1, status: "complete", progress: 100 },
  { file: "Incident_Report_INR-2024-0043.pdf", type: "Incident Report", pages: 28, status: "complete", progress: 100 },
];

type ChatMsg = { role: "user" | "assistant"; content: string; sources?: { doc: string; page: number; confidence: number }[] };

const seedMessages: ChatMsg[] = [
  {
    role: "user",
    content: "What is the maintenance history of K-301 gas compressor and are there any recurring failure patterns?"
  },
  {
    role: "assistant",
    content: "K-301 Gas Compressor has logged **23 corrective work orders** between 2019–2024, with a mean time between failures (MTBF) of **4.2 months**. Three distinct failure clusters are identified:\n\n**1. Bearing Failures (8 occurrences, 2020–2024)**\nAll eight bearing failures show L2/L3 race wear as the primary mode. Cross-referencing lube oil analysis records (WO-1847, WO-2109, WO-2241), particulate contamination from filter bypass events precedes each failure by 6–12 weeks. Root cause is filter bypass valve seal degradation — a known OEM service bulletin (SB-K301-2019-04) addresses this.\n\n**2. Seal Gas System Failures (9 occurrences)**\nSeal gas panel differential pressure deviations logged in SCADA historian correlate with all nine seal failures. Operating outside design envelope (ΔP > 0.4 bar) during high-throughput periods in Q3/Q4 is the systemic driver.\n\n**3. Vibration Exceedances (6 occurrences)**\nAll six events triggered by suction pressure transients during upstream slug flow. P&ID Rev 14 shows no pulsation damper on the suction header — recommend engineering review.\n\n**Current Status:** Vibration at bearing housing is 14.2 mm/s (alarm threshold: 11 mm/s). Immediate maintenance window recommended.",
    sources: [
      { doc: "K301_WO_History_2019-2024.xlsx", page: 1, confidence: 97 },
      { doc: "K301_OEM_Manual_Rev5.pdf", page: 88, confidence: 92 },
      { doc: "Train2_PID_Rev14.dwg", page: 1, confidence: 89 },
      { doc: "Lube_Oil_Analysis_Q1_2024.pdf", page: 14, confidence: 84 },
    ]
  }
];

// --- SUB-COMPONENTS ---

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    processing: "bg-amber-400 animate-pulse",
    extracting: "bg-blue-400 animate-pulse",
    queued: "bg-zinc-600",
    complete: "bg-emerald-500",
  };
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${map[status] || "bg-zinc-600"}`} />;
}

function HealthBar({ value, trend }: { value: number; trend: string }) {
  const color = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#dc2626";
  const TrendIcon = trend === "degrading" ? TrendingDown : trend === "critical" ? AlertCircle : TrendingUp;
  const trendColor = trend === "critical" ? "text-red-500" : trend === "degrading" ? "text-amber-400" : "text-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-xs w-8 text-right" style={{ color }}>{value}%</span>
      <TrendIcon size={12} className={trendColor} />
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    HIGH: "bg-red-950 text-red-400 border-red-900",
    MEDIUM: "bg-amber-950 text-amber-400 border-amber-900",
    LOW: "bg-emerald-950 text-emerald-500 border-emerald-900",
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium border rounded ${map[severity]}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    GAP: "bg-red-950 text-red-400 border-red-900",
    PARTIAL: "bg-amber-950 text-amber-400 border-amber-900",
    COMPLIANT: "bg-emerald-950 text-emerald-500 border-emerald-900",
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium border rounded ${map[status]}`}>
      {status}
    </span>
  );
}

function IngestSparkline({ data }: { data: { day: string; docs: number }[] }) {
  const W = 560, H = 140, PL = 36, PR = 8, PT = 8, PB = 24;
  const minV = Math.min(...data.map((d) => d.docs));
  const maxV = Math.max(...data.map((d) => d.docs));
  const range = maxV - minV || 1;
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const xs = data.map((_, i) => PL + (i / (data.length - 1)) * cw);
  const ys = data.map((d) => PT + ch - ((d.docs - minV) / range) * ch);
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const areaPath = `${linePath} L${xs[xs.length - 1]},${PT + ch} L${xs[0]},${PT + ch} Z`;
  const yTicks = [minV, Math.round((minV + maxV) / 2), maxV];

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 140 }}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Horizontal grid lines */}
      {yTicks.map((tick, i) => {
        const y = PT + ch - ((tick - minV) / range) * ch;
        return (
          <g key={`ytick-${i}`}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <text x={PL - 4} y={y + 4} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#5a6b7e">
              {(tick / 1000).toFixed(1)}k
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={areaPath} fill="#f59e0b" fillOpacity={0.07} />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" />
      {/* X-axis labels + hover zones */}
      {data.map((d, i) => (
        <g key={`pt-${i}`} onMouseEnter={() => setHovered(i)} style={{ cursor: "crosshair" }}>
          <rect x={xs[i] - 20} y={PT} width={40} height={ch + PB} fill="transparent" />
          <text x={xs[i]} y={H - 4} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono" fill="#5a6b7e">
            {d.day.slice(-3)}
          </text>
          {hovered === i && (
            <g>
              <line x1={xs[i]} x2={xs[i]} y1={PT} y2={PT + ch} stroke="rgba(245,158,11,0.3)" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={xs[i]} cy={ys[i]} r={3} fill="#f59e0b" />
              <rect x={xs[i] - 28} y={ys[i] - 22} width={56} height={16} rx={2} fill="#0f1318" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
              <text x={xs[i]} y={ys[i] - 11} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono" fill="#f59e0b">
                {d.docs.toLocaleString()} docs
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

const failureBars = [
  { name: "Pumps", failures: 12 },
  { name: "Compressors", failures: 8 },
  { name: "Heat Ex.", failures: 15 },
  { name: "Valves", failures: 22 },
  { name: "Vessels", failures: 4 },
  { name: "Fans", failures: 7 },
];

function FailureBarChart() {
  const W = 400, H = 160, PL = 28, PR = 8, PT = 8, PB = 22;
  const [hovered, setHovered] = useState<number | null>(null);
  const maxV = Math.max(...failureBars.map((d) => d.failures));
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const barW = cw / failureBars.length;
  const barPad = barW * 0.25;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }} onMouseLeave={() => setHovered(null)}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((t, i) => {
        const y = PT + ch - t * ch;
        return (
          <g key={`grid-${i}`}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <text x={PL - 4} y={y + 3} textAnchor="end" fontSize={8} fontFamily="JetBrains Mono" fill="#5a6b7e">
              {Math.round(t * maxV)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {failureBars.map((d, i) => {
        const bh = (d.failures / maxV) * ch;
        const x = PL + i * barW + barPad;
        const y = PT + ch - bh;
        const isHigh = i === 3;
        const fill = hovered === i ? "#f59e0b" : isHigh ? "#f59e0b" : "#1e3a5f";
        return (
          <g key={`bar-${i}`} onMouseEnter={() => setHovered(i)} style={{ cursor: "default" }}>
            <rect x={x} y={y} width={barW - barPad * 2} height={bh} fill={fill} rx={1} style={{ transition: "fill 0.15s" }} />
            {hovered === i && (
              <>
                <rect x={x - 4} y={y - 18} width={barW - barPad * 2 + 8} height={14} rx={2} fill="#0f1318" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                <text x={x + (barW - barPad * 2) / 2} y={y - 8} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono" fill="#f59e0b">
                  {d.failures}
                </text>
              </>
            )}
            <text x={x + (barW - barPad * 2) / 2} y={H - 6} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono" fill="#5a6b7e">
              {d.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// --- SECTION VIEWS ---

function OverviewSection() {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border p-4 relative overflow-hidden group hover:border-white/12 transition-colors">
            <div className="absolute top-0 left-0 w-0.5 h-full bg-primary" />
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">{kpi.label}</p>
            <p className="text-2xl font-['Barlow_Condensed'] font-bold text-foreground tracking-tight">{kpi.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-mono ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
              {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{kpi.delta} this week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Ingestion Trend */}
        <div className="col-span-2 bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground">Document Ingestion — 7D</h3>
            <span className="text-[10px] font-mono text-muted-foreground">LIVE PIPELINE</span>
          </div>
          <IngestSparkline data={ingestTrend} />
        </div>

        {/* Doc Types */}
        <div className="bg-card border border-border p-4">
          <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground mb-4">Corpus Breakdown</h3>
          <div className="space-y-2.5">
            {docTypeData.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-foreground/70">{d.name}</span>
                  <span className="text-[11px] font-mono" style={{ color: d.color }}>{d.count.toLocaleString()}</span>
                </div>
                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(d.count / 34210) * 100}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Health */}
      <div className="bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground">Equipment Health Monitor</h3>
          <button className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors">VIEW ALL ASSETS →</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {equipmentHealth.map((eq) => (
            <div key={eq.tag} className="bg-muted border border-border p-3 hover:border-white/12 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-mono text-primary">{eq.tag}</span>
                  <p className="text-sm font-medium text-foreground leading-tight">{eq.name}</p>
                </div>
                <span className={`text-[9px] font-mono px-1 py-0.5 border rounded ${
                  eq.trend === "critical" ? "border-red-900 text-red-400 bg-red-950" :
                  eq.trend === "degrading" ? "border-amber-900 text-amber-400 bg-amber-950" :
                  "border-emerald-900 text-emerald-500 bg-emerald-950"
                }`}>{eq.trend.toUpperCase()}</span>
              </div>
              <HealthBar value={eq.health} trend={eq.trend} />
              <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{eq.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopilotSection() {
  const [messages, setMessages] = useState<ChatMsg[]>(seedMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const suggestions = [
    "Show me all inspection findings for HX-204 in the last 12 months",
    "What OISD-117 requirements are not met by current procedures?",
    "Generate an RCA summary for incident INR-2024-0043",
    "List all pressure relief valve test overdue items",
  ];

  const handleSend = (text?: string) => {
    const q = text || input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "assistant",
        content: "Searching across **124,847 indexed documents** for relevant context...\n\nBased on the knowledge graph traversal, I found **34 relevant document nodes** spanning inspection records, maintenance work orders, and regulatory references. Let me synthesise the findings.\n\nFor this query, cross-referencing the inspection history with the current equipment state reveals three key data points that are likely to be actionable in your operational context. The confidence score for this response is **89%** based on source corroboration across multiple document types.",
        sources: [
          { doc: "Inspection_Register_2024_Q2.xlsx", page: 3, confidence: 91 },
          { doc: "OISD117_SOP_Rev8.pdf", page: 22, confidence: 88 },
        ]
      }]);
      setThinking(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="bg-card border border-border p-3 mb-3 flex items-center gap-3">
        <div className="w-7 h-7 bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Brain size={14} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-['Barlow_Condensed'] font-semibold uppercase tracking-wider text-foreground">Expert Knowledge Copilot</p>
          <p className="text-[10px] text-muted-foreground font-mono">RAG · Knowledge Graph · Source Citations · Confidence Scoring</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            LIVE — 124,847 docs indexed
          </span>
          <button onClick={() => setMessages(seedMessages)} className="p-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-white/15 transition-colors">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border text-[10px] font-mono font-bold ${
              msg.role === "user" ? "bg-primary/10 border-primary/30 text-primary" : "bg-accent border-accent-foreground/10 text-accent-foreground"
            }`}>
              {msg.role === "user" ? "YOU" : "AI"}
            </div>
            <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
              <div className={`p-3 border text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-card border-border text-foreground"
                  : "bg-muted border-border text-foreground"
              }`}>
                {msg.content.split("\n").map((line, j) => {
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={j} className={j > 0 ? "mt-2" : ""}>
                      {parts.map((part, k) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={k} className="text-primary font-semibold">{part.slice(2, -2)}</strong>
                          : part
                      )}
                    </p>
                  );
                })}
              </div>
              {msg.sources && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.sources.map((s, j) => (
                    <div key={j} className="flex items-center gap-1.5 bg-muted border border-border px-2 py-1 cursor-pointer hover:border-white/15 transition-colors">
                      <FileSearch size={10} className="text-primary flex-shrink-0" />
                      <span className="text-[10px] font-mono text-foreground/70 max-w-[180px] truncate">{s.doc}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">p.{s.page}</span>
                      <span className="text-[10px] font-mono text-emerald-500">{s.confidence}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex gap-3">
            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center border bg-accent border-accent-foreground/10 text-accent-foreground text-[10px] font-mono font-bold">AI</div>
            <div className="bg-muted border border-border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                Traversing knowledge graph...
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 my-3">
          {suggestions.map((s) => (
            <button key={s} onClick={() => handleSend(s)} className="text-[11px] font-mono text-muted-foreground border border-border px-2.5 py-1.5 hover:border-primary/50 hover:text-primary transition-colors text-left">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 bg-card border border-border flex items-center gap-2 px-3 focus-within:border-primary/50 transition-colors">
          <Search size={13} className="text-muted-foreground flex-shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about any equipment, procedure, regulation, or incident..."
            className="flex-1 bg-transparent text-sm text-foreground py-3 outline-none placeholder:text-muted-foreground font-['Inter']"
          />
        </div>
        <button
          onClick={() => handleSend()}
          className="px-4 bg-primary text-primary-foreground flex items-center gap-2 text-xs font-mono font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
          disabled={!input.trim() && !thinking}
        >
          <Send size={13} />
          QUERY
        </button>
      </div>
    </div>
  );
}

function DocumentVaultSection() {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        className={`border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-white/15"
        }`}
      >
        <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center">
          <Upload size={20} className={dragOver ? "text-primary" : "text-muted-foreground"} />
        </div>
        <div className="text-center">
          <p className="text-sm font-['Barlow_Condensed'] font-semibold uppercase tracking-widest text-foreground">Drop Documents to Ingest</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">PDF · DWG · XLS · CSV · Email Archives · Scanned Forms · P&IDs</p>
        </div>
        <button className="mt-1 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-mono font-semibold hover:bg-primary/90 transition-colors">
          BROWSE FILES
        </button>
      </div>

      {/* Pipeline Queue */}
      <div className="bg-card border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground">Ingestion Pipeline</h3>
          <span className="text-[10px] font-mono text-muted-foreground">2 PROCESSING · 1 QUEUED · 2 COMPLETE</span>
        </div>
        <div className="divide-y divide-border">
          {ingestionQueue.map((item) => (
            <div key={item.file} className="px-4 py-3 flex items-center gap-4">
              <StatusDot status={item.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-foreground font-medium truncate">{item.file}</span>
                  <span className="text-[9px] font-mono bg-muted border border-border px-1.5 py-0.5 text-muted-foreground flex-shrink-0">{item.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.status !== "queued" && (
                    <div className="w-32 h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        item.status === "complete" ? "bg-emerald-500" : "bg-primary"
                      }`} style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {item.status === "queued" ? "Awaiting pipeline slot" :
                     item.status === "complete" ? `${item.pages}p indexed` :
                     `${item.progress}% · ${item.pages}p`}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-mono ${
                item.status === "complete" ? "text-emerald-500" :
                item.status === "processing" ? "text-primary" :
                item.status === "extracting" ? "text-blue-400" :
                "text-muted-foreground"
              }`}>{item.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Corpus Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Entities Extracted", value: "4,72,293", icon: Network, color: "text-primary" },
          { label: "Relationships Mapped", value: "1,84,112", icon: GitBranch, color: "text-blue-400" },
          { label: "OCR Accuracy", value: "98.4%", icon: Eye, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-muted border border-border flex items-center justify-center flex-shrink-0">
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <p className="text-xl font-['Barlow_Condensed'] font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaintenanceSection() {
  return (
    <div className="space-y-4">
      {/* RCA Alerts */}
      <div className="bg-card border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground">AI-Detected Failure Patterns</h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">UPDATED 4 MINS AGO</span>
        </div>
        <div className="divide-y divide-border">
          {rcaAlerts.map((alert) => (
            <div key={alert.id} className="px-4 py-4 flex items-start gap-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className={`w-1 h-full flex-shrink-0 self-stretch rounded-full ${
                alert.priority === "CRITICAL" ? "bg-red-500" : alert.priority === "HIGH" ? "bg-amber-400" : "bg-yellow-600"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{alert.id}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 border rounded ${
                    alert.priority === "CRITICAL" ? "bg-red-950 text-red-400 border-red-900" :
                    alert.priority === "HIGH" ? "bg-amber-950 text-amber-400 border-amber-900" :
                    "bg-yellow-950 text-yellow-500 border-yellow-900"
                  }`}>{alert.priority}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{alert.equipment}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{alert.pattern}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-['Barlow_Condensed'] font-bold text-foreground">{alert.confidence}%</div>
                <div className="text-[9px] font-mono text-muted-foreground">CONFIDENCE</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Health + Bar Chart */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border p-4">
          <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground mb-4">Failure Frequency by Equipment Class</h3>
          <FailureBarChart />
        </div>
        <div className="bg-card border border-border p-4">
          <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground mb-3">Equipment Health — Current</h3>
          <div className="space-y-3">
            {equipmentHealth.map((eq) => (
              <div key={eq.tag} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-primary w-14 flex-shrink-0">{eq.tag}</span>
                <HealthBar value={eq.health} trend={eq.trend} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceSection() {
  return (
    <div className="space-y-4">
      {/* Score + Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Overall Score", value: "87.4%", color: "text-amber-400", bg: "bg-amber-950 border-amber-900" },
          { label: "Gaps Identified", value: "2", color: "text-red-400", bg: "bg-red-950 border-red-900" },
          { label: "Partial Compliance", value: "2", color: "text-amber-400", bg: "bg-amber-950 border-amber-900" },
          { label: "Fully Compliant", value: "2", color: "text-emerald-400", bg: "bg-emerald-950 border-emerald-900" },
        ].map((s) => (
          <div key={s.label} className={`border p-4 ${s.bg}`}>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-3xl font-['Barlow_Condensed'] font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Regulation Table */}
      <div className="bg-card border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground">Regulatory Compliance Matrix</h3>
          <button className="text-[10px] font-mono text-primary border border-primary/30 px-2.5 py-1 hover:bg-primary/10 transition-colors flex items-center gap-1">
            <ArrowUpRight size={10} />
            EXPORT EVIDENCE PACKAGE
          </button>
        </div>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-[100px_1fr_90px_80px_100px] gap-4 px-4 py-2 bg-muted">
            {["REGULATION", "COMPLIANCE AREA", "STATUS", "SEVERITY", "LAST AUDIT"].map((h) => (
              <span key={h} className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {complianceGaps.map((row) => (
            <div key={row.regulation} className="grid grid-cols-[100px_1fr_90px_80px_100px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer">
              <span className="text-xs font-mono text-primary">{row.regulation}</span>
              <span className="text-sm text-foreground">{row.area}</span>
              <StatusBadge status={row.status} />
              <SeverityBadge severity={row.severity} />
              <span className="text-[10px] font-mono text-muted-foreground">{row.lastAudit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-remediation suggestions */}
      <div className="bg-card border border-border p-4">
        <h3 className="font-['Barlow_Condensed'] font-semibold text-sm uppercase tracking-widest text-foreground mb-3">AI Remediation Recommendations</h3>
        <div className="space-y-2">
          {[
            { reg: "OISD-117", action: "Schedule fire suppression system inspection — 3 zones overdue per Section 8.4.2. Linked to: FP-Zone-3, FP-Zone-7, FP-Zone-11 records." },
            { reg: "ISO 45001", action: "Update Hazard Register with 14 new processes introduced post-2022 expansion. OHS Management System review required by Clause 6.1.2." },
          ].map((r) => (
            <div key={r.reg} className="flex gap-3 bg-muted border border-border p-3">
              <Zap size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono text-primary">{r.reg} — </span>
                <span className="text-xs text-foreground/80">{r.action}</span>
              </div>
              <button className="ml-auto flex-shrink-0 text-[10px] font-mono text-muted-foreground border border-border px-2 py-1 hover:border-primary/40 hover:text-primary transition-colors">
                ASSIGN
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP ---
type Section = "overview" | "copilot" | "vault" | "maintenance" | "compliance";

const navItems: { id: Section; label: string; icon: React.ElementType; alert?: number }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "copilot", label: "Expert Copilot", icon: Brain },
  { id: "vault", label: "Document Vault", icon: Database },
  { id: "maintenance", label: "Maintenance Intel", icon: Wrench, alert: 3 },
  { id: "compliance", label: "Compliance", icon: Shield, alert: 2 },
];

export default function App() {
  const [active, setActive] = useState<Section>("overview");
  const [notifOpen, setNotifOpen] = useState(false);

  const sectionTitles: Record<Section, string> = {
    overview: "Platform Overview",
    copilot: "Expert Knowledge Copilot",
    vault: "Document Vault & Ingestion",
    maintenance: "Maintenance Intelligence",
    compliance: "Quality & Compliance",
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary flex items-center justify-center flex-shrink-0">
              <Network size={14} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-foreground leading-tight">IndusKnow</p>
              <p className="text-[9px] font-mono text-muted-foreground tracking-widest">INTELLIGENCE PLATFORM</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest px-4 mb-2">Modules</p>
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors relative ${
                  isActive
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 w-0.5 h-full bg-primary" />}
                <item.icon size={14} className={isActive ? "text-primary" : ""} />
                <span className={`flex-1 text-left text-xs font-medium ${isActive ? "" : ""}`}>{item.label}</span>
                {item.alert && (
                  <span className="w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-mono flex items-center justify-center">
                    {item.alert}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">System</p>
          {[
            { label: "Pipeline", status: "LIVE" },
            { label: "KG Engine", status: "LIVE" },
            { label: "LLM Gateway", status: "LIVE" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-0.5">
              <span className="text-[10px] text-muted-foreground font-mono">{s.label}</span>
              <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                {s.status}
              </span>
            </div>
          ))}
        </div>

        {/* User */}
        <div className="px-4 py-3 border-t border-sidebar-border flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 border border-primary/30 flex items-center justify-center text-[9px] font-mono font-bold text-primary">RK</div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground truncate">R. Kumar</p>
            <p className="text-[9px] font-mono text-muted-foreground">Sr. Maintenance Engr.</p>
          </div>
          <Settings size={12} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 border-b border-border px-6 py-3 flex items-center gap-4 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
            <span>IndusKnow</span>
            <ChevronRight size={12} />
            <span className="text-foreground">{sectionTitles[active]}</span>
          </div>
          <div className="flex-1" />
          {/* Search */}
          <div className="flex items-center gap-2 bg-muted border border-border px-3 py-1.5 w-64 focus-within:border-primary/50 transition-colors">
            <Search size={12} className="text-muted-foreground flex-shrink-0" />
            <input
              placeholder="Search documents, tags, equipment..."
              className="bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground font-mono flex-1"
            />
          </div>
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/15 transition-colors relative"
            >
              <Bell size={14} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute top-10 right-0 w-72 bg-popover border border-border z-50 shadow-2xl">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-foreground">ALERTS</span>
                  <button onClick={() => setNotifOpen(false)}><X size={12} className="text-muted-foreground" /></button>
                </div>
                {[
                  { title: "K-301 vibration critical", time: "4m ago", severity: "bg-red-500" },
                  { title: "OISD-117 gap auto-detected", time: "1h ago", severity: "bg-amber-400" },
                  { title: "Ingestion pipeline: 2 queued", time: "3h ago", severity: "bg-blue-400" },
                ].map((n) => (
                  <div key={n.title} className="px-3 py-2.5 flex items-start gap-2.5 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.severity}`} />
                    <div>
                      <p className="text-xs text-foreground">{n.title}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5 scrollbar-hide">
          <div className="mb-4 flex items-baseline gap-3">
            <h1 className="font-['Barlow_Condensed'] font-bold text-2xl uppercase tracking-wide text-foreground">{sectionTitles[active]}</h1>
            <span className="text-xs font-mono text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          {active === "overview" && <OverviewSection />}
          {active === "copilot" && <CopilotSection />}
          {active === "vault" && <DocumentVaultSection />}
          {active === "maintenance" && <MaintenanceSection />}
          {active === "compliance" && <ComplianceSection />}
        </main>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
