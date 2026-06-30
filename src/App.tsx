import React, { useState, useEffect } from "react";
import { Compass, MessageSquare, ShieldAlert, Heart, Bookmark, AlertTriangle, Sparkles } from "lucide-react";
import OverviewDashboard from "./components/OverviewDashboard";
import DialoguePillar from "./components/DialoguePillar";
import ScannerPillar from "./components/ScannerPillar";
import RefugeePillar from "./components/RefugeePillar";
import MemoryPillar from "./components/MemoryPillar";
import SentinelPillar from "./components/SentinelPillar";
import { DialogueChannel, SupportItem, MemoryTestimony, EarlyWarningReport } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Synchronized States
  const [dialogues, setDialogues] = useState<DialogueChannel[]>([]);
  const [support, setSupport] = useState<SupportItem[]>([]);
  const [memories, setMemories] = useState<MemoryTestimony[]>([]);
  const [alerts, setAlerts] = useState<EarlyWarningReport[]>([]);

  // Loaders
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDialogMessage, setLoadingDialogMessage] = useState<boolean>(false);
  const [loadingAlert, setLoadingAlert] = useState<boolean>(false);

  // Fetch state on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [resDiag, resSup, resMem, resAlt] = await Promise.all([
          fetch("/api/dialogue"),
          fetch("/api/support"),
          fetch("/api/memories"),
          fetch("/api/alerts")
        ]);

        const [dataDiag, dataSup, dataMem, dataAlt] = await Promise.all([
          resDiag.json(),
          resSup.json(),
          resMem.json(),
          resAlt.json()
        ]);

        setDialogues(dataDiag);
        setSupport(dataSup);
        setMemories(dataMem);
        setAlerts(dataAlt);
      } catch (e) {
        console.error("Failed to load backend state:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Post message (Pillar 1)
  const handleSendMessage = async (channelId: string, user: string, text: string, community: string) => {
    setLoadingDialogMessage(true);
    try {
      const res = await fetch(`/api/dialogue/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, text, community })
      });
      const data = await res.json();
      
      // Update the channel with the new message list
      setDialogues((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, messages: data } : c))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDialogMessage(false);
    }
  };

  // Add support item (Pillar 3)
  const handleAddSupportItem = async (item: Omit<SupportItem, "id" | "timestamp">) => {
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      setSupport((prev) => [data, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  // Add Memory testimony (Pillar 4)
  const handleAddMemory = async (memory: Omit<MemoryTestimony, "id" | "timestamp">) => {
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memory)
      });
      const data = await res.json();
      setMemories((prev) => [data, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  // Add Sentinel Alert Warning (Pillar 5)
  const handleAddAlert = async (alert: Omit<EarlyWarningReport, "id" | "timestamp" | "riskLevel" | "aiActionPlan">) => {
    setLoadingAlert(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert)
      });
      const data = await res.json();
      setAlerts((prev) => [data, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAlert(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center space-y-4 p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-700 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-700 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1 max-w-sm">
          <h2 className="text-sm font-bold text-slate-800 font-display">Powering HarmonyX</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Loading cross-border coordinates, de-escalation indexes, oral history testimonies, and local resources board...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <Compass className="w-4 h-4" /> },
    { id: "dialogue", label: "01. Dialogue Bridge", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "scanner", label: "02. Shield Scanner", icon: <ShieldAlert className="w-4 h-4" /> },
    { id: "refugees", label: "03. Refugee Aid", icon: <Heart className="w-4 h-4" /> },
    { id: "memories", label: "04. Memory Archive", icon: <Bookmark className="w-4 h-4" /> },
    { id: "sentinel", label: "05. Sentinel Warning", icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Dynamic Peace Ticker */}
      <div className="bg-emerald-950 text-emerald-300 text-[10px] sm:text-xs py-1.5 px-4 font-semibold text-center border-b border-emerald-900 overflow-hidden whitespace-nowrap flex items-center justify-center gap-1.5 relative">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        <div className="animate-marquee inline-block">
          HARMONYX BULLETIN: Joint Youth water-conservation dialogue scheduled for Poonch district • Verified fact-checks released for recent Sialkot canal claims • Refugee legal support aid active in Jammu.
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Navigation / Header Shell */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-700 text-white p-2.5 rounded-xl shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight font-display text-slate-950">HarmonyX</span>
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/10">06 SHANTI</span>
              </div>
              <p className="text-xs text-slate-500">Peace, Pluralism, & Human Dignity Platform</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-emerald-100 shadow-2xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Content Area */}
        <main className="focus-outline">
          {activeTab === "overview" && (
            <OverviewDashboard
              dialogues={dialogues}
              support={support}
              memories={memories}
              alerts={alerts}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "dialogue" && (
            <DialoguePillar
              channels={dialogues}
              onSendMessage={handleSendMessage}
              loading={loadingDialogMessage}
            />
          )}

          {activeTab === "scanner" && (
            <ScannerPillar />
          )}

          {activeTab === "refugees" && (
            <RefugeePillar
              support={support}
              onAddSupportItem={handleAddSupportItem}
            />
          )}

          {activeTab === "memories" && (
            <MemoryPillar
              memories={memories}
              onAddMemory={handleAddMemory}
            />
          )}

          {activeTab === "sentinel" && (
            <SentinelPillar
              alerts={alerts}
              onAddAlert={handleAddAlert}
              loading={loadingAlert}
            />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-[11px] text-slate-500 space-y-1">
        <p>HarmonyX © 2026 • Dedicated to Building Bridges, Countering Hate, Preserving Memories, and Protecting the Displaced.</p>
        <p>Powered by server-side Gemini AI models for translation and de-escalation processing.</p>
      </footer>
    </div>
  );
}