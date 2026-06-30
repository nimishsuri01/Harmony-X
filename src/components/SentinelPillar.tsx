import React, { useState } from "react";
import { AlertTriangle, Plus, MapPin, Eye, ShieldCheck, RefreshCw, Send, Sparkles, HelpCircle } from "lucide-react";
import { EarlyWarningReport } from "../types";

interface Props {
  alerts: EarlyWarningReport[];
  onAddAlert: (alert: Omit<EarlyWarningReport, "id" | "timestamp" | "riskLevel" | "aiActionPlan">) => Promise<void>;
  loading: boolean;
}

export default function SentinelPillar({ alerts, onAddAlert, loading }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  
  // Submit alert form states
  const [showForm, setShowForm] = useState<boolean>(false);
  const [category, setCategory] = useState<"Online Hate Speech Spike" | "Water/Resource Dispute" | "Displaced Influx" | "Cross-border Incident" | "Other Warning">("Online Hate Speech Spike");
  const [region, setRegion] = useState<string>("Western Border Sector");
  const [description, setDescription] = useState<string>("");
  const [source, setSource] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !source.trim()) return;

    await onAddAlert({
      category,
      region,
      description,
      source
    });

    // Reset Form
    setDescription("");
    setSource("");
    setShowForm(false);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedRegion === "All") return true;
    return alert.region === selectedRegion;
  });

  // Calculate sector risk helper
  const getSectorRisk = (regionName: string) => {
    const regionAlerts = alerts.filter((a) => a.region === regionName);
    if (regionAlerts.some((a) => a.riskLevel === "High")) return "High";
    if (regionAlerts.some((a) => a.riskLevel === "Medium")) return "Medium";
    if (regionAlerts.length > 0) return "Low";
    return "None";
  };

  const mapSectors = [
    { id: "s1", name: "Western Border Sector", x: 70, y: 80, r: 16 },
    { id: "s2", name: "Chenab Canal Sector", x: 180, y: 130, r: 20 },
    { id: "s3", name: "Jammu Highway Sector", x: 280, y: 70, r: 18 },
    { id: "s4", name: "Chenab River Basin Downstream", x: 150, y: 220, r: 15 },
    { id: "s5", name: "Southern Refugee Transit Sector", x: 320, y: 190, r: 16 }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      
      {/* Interactive Map (Left 2 Columns) */}
      <div className="xl:col-span-2 space-y-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-rose-600 animate-pulse" />
              Sentinel Alert Map
            </h2>
            <p className="text-[10px] text-slate-500">
              Interactive vector representation of conflict monitoring divisions. Select a coordinates node to filter sentinel logs.
            </p>
          </div>

          {/* SVG Vector Map */}
          <div className="relative border border-slate-100 rounded-lg bg-slate-50/50 p-2 overflow-hidden flex justify-center items-center">
            <svg viewBox="0 0 400 300" className="w-full max-w-[350px] aspect-[4/3] drop-shadow-xs">
              {/* Demarcation border lines */}
              <path
                d="M 120 0 C 140 80, 160 160, 220 220 C 250 250, 260 300, 260 300"
                fill="none"
                stroke="#fda4af"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
              <text x="145" y="25" fill="#f43f5e" className="text-[9px] font-bold tracking-wider opacity-60">BORDER DIVISION LINE</text>

              {/* Map background details */}
              <rect x="5" y="5" width="110" height="40" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
              <text x="12" y="20" fill="#475569" className="text-[8px] font-bold">WESTERN NATION</text>
              <text x="12" y="32" fill="#94a3b8" className="text-[7px]">Sialkot / Chenab Lower</text>

              <rect x="285" y="255" width="110" height="40" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
              <text x="292" y="270" fill="#475569" className="text-[8px] font-bold">EASTERN NATION</text>
              <text x="292" y="282" fill="#94a3b8" className="text-[7px]">Jammu / Chenab Upper</text>

              {/* Map Sectors Nodes */}
              {mapSectors.map((sector) => {
                const risk = getSectorRisk(sector.name);
                const color =
                  risk === "High"
                    ? "#ef4444"
                    : risk === "Medium"
                    ? "#f59e0b"
                    : risk === "Low"
                    ? "#3b82f6"
                    : "#10b981";

                const isSelected = selectedRegion === sector.name;

                return (
                  <g
                    key={sector.id}
                    onClick={() => setSelectedRegion(isSelected ? "All" : sector.name)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Ring highlight if selected */}
                    {isSelected && (
                      <circle
                        cx={sector.x}
                        cy={sector.y}
                        r={sector.r + 6}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}

                    {/* Sector circle */}
                    <circle
                      cx={sector.x}
                      cy={sector.y}
                      r={sector.r}
                      fill={color}
                      fillOpacity={isSelected ? "0.3" : "0.15"}
                      stroke={color}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all hover:fill-opacity-40"
                    />

                    {/* Sector Dot */}
                    <circle cx={sector.x} cy={sector.y} r="4" fill={color} />

                    {/* Short label */}
                    <text
                      x={sector.x}
                      y={sector.y - sector.r - 4}
                      textAnchor="middle"
                      fill="#1e293b"
                      className="text-[8px] font-bold select-none pointer-events-none bg-white px-1"
                    >
                      {sector.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Quick map helper overlay */}
            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs p-2 rounded border border-slate-200 text-[9px] space-y-1">
              <span className="font-bold block text-slate-800">Map Legend:</span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High Risk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Low Risk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Stable</span>
              </div>
            </div>
          </div>

          {/* Sector selection status panel */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            {selectedRegion === "All" ? (
              <p className="text-slate-500 text-center text-[11px]">Click any coordinate zone on map to load localized alerts</p>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{selectedRegion}</span>
                  <button
                    onClick={() => setSelectedRegion("All")}
                    className="text-[9px] font-bold text-rose-600 hover:underline"
                  >
                    Clear Filter
                  </button>
                </div>
                <div className="text-[11px] text-slate-600">
                  Current Threat Index: <strong className="text-slate-900">{getSectorRisk(selectedRegion)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sentinel Alert Log Feed (Right 3 Columns) */}
      <div className="xl:col-span-3 space-y-4">
        
        {/* Alerts Log Header */}
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              Sentinel Coordination Feed
            </h2>
            <p className="text-[10px] text-slate-500">Early-warning logs verified and contextualized by civil peace observers.</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Submit Warning
          </button>
        </div>

        {/* Form to post warning */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-emerald-300 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-950 uppercase">File Sentinel Warning Alert</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Warning Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Online Hate Speech Spike">Online Hate Speech Spike</option>
                  <option value="Water/Resource Dispute">Water/Resource Dispute</option>
                  <option value="Displaced Influx">Displaced Influx</option>
                  <option value="Cross-border Incident">Cross-border Incident</option>
                  <option value="Other Warning">Other Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Target Monitoring Division:</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {mapSectors.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Observer/Source Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Western Border Farmers Union, Local NGO Peace Sentinel"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Describe active signal or escalating tension:</label>
                <textarea
                  rows={3}
                  placeholder="Provide precise observations. E.g., sudden deployment of additional security checkpoints, hyper-partisan audio forwards, or canal allocation arguments."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
              >
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                Analyze threat with Gemini AI
              </button>
            </div>
          </form>
        )}

        {/* Warning Logs feed */}
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No warnings coordinates monitored for this division.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    alert.riskLevel === "High"
                      ? "bg-rose-50 text-rose-700 border border-rose-100"
                      : alert.riskLevel === "Medium"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {alert.riskLevel} Risk Alert
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-950 font-display flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {alert.category} — {alert.region}
                  </h4>
                  <p className="text-[10px] text-slate-500">Observer Source: <strong className="text-slate-700">{alert.source}</strong></p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg italic">
                  "{alert.description}"
                </p>

                {/* AI preventative action plan */}
                {alert.aiActionPlan && (
                  <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-100 text-xs space-y-1">
                    <h5 className="font-bold text-teal-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      Gemini Preventative Diplomacy Recommendation
                    </h5>
                    <p className="text-teal-900 leading-relaxed font-medium">
                      {alert.aiActionPlan}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}