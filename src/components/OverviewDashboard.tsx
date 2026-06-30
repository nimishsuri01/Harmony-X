import React, { useState } from "react";
import { ShieldCheck, MessageSquare, Heart, Bookmark, AlertTriangle, Lightbulb, ArrowRight, HelpCircle, Search, Sparkles } from "lucide-react";
import { DialogueChannel, SupportItem, MemoryTestimony, EarlyWarningReport } from "../types";

interface Props {
  dialogues: DialogueChannel[];
  support: SupportItem[];
  memories: MemoryTestimony[];
  alerts: EarlyWarningReport[];
  setActiveTab: (tab: string) => void;
}

export default function OverviewDashboard({ dialogues, support, memories, alerts, setActiveTab }: Props) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Statistics
  const activeConversations = dialogues.length;
  const totalMessages = dialogues.reduce((acc, curr) => acc + curr.messages.length, 0);
  const totalResourceBoard = support.length;
  const testimoniesArchived = memories.length;
  const warningTriggers = alerts.length;

  // Search logic
  const query = searchQuery.trim().toLowerCase();
  const matchingDialogues = dialogues.filter(
    (d) =>
      d.title.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query) ||
      d.messages.some(
        (m) =>
          m.text.toLowerCase().includes(query) ||
          m.user.toLowerCase().includes(query) ||
          (m.translatedText && m.translatedText.toLowerCase().includes(query)) ||
          (m.deescalatedText && m.deescalatedText.toLowerCase().includes(query))
      )
  );

  const matchingSupport = support.filter(
    (s) =>
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.location.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.contact.toLowerCase().includes(query)
  );

  const matchingMemories = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(query) ||
      m.text.toLowerCase().includes(query) ||
      m.author.toLowerCase().includes(query) ||
      m.location.toLowerCase().includes(query) ||
      m.tag.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-amber-500 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
            06 SHANTI (शांति) Category Entry
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
            HarmonyX: Bridges Above Borders
          </h1>
          <p className="text-emerald-50/95 text-sm md:text-base leading-relaxed mb-4">
            A full-stack preventative diplomacy platform dedicated to <strong>Peace, Pluralism & Human Dignity</strong>. Built to defuse hate speech, check viral rumors, secure refugee support networks, catalog shared historical memories, and prevent escalation through early-warning networks.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("dialogue")}
              className="px-4 py-2 bg-white text-emerald-900 font-medium text-xs rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              Enter Dialog Rooms <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveTab("scanner")}
              className="px-4 py-2 bg-white/15 text-white font-medium text-xs rounded-lg hover:bg-white/25 transition-colors inline-flex items-center gap-2 border border-white/20"
            >
              Scan Hate & Rumors
            </button>
          </div>
        </div>
      </div>

      {/* Universal Search Console */}
      <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-700" />
              Universal Archive Search
            </h2>
            <p className="text-[10px] text-slate-500">
              Query cross-border dialogue channels, refugee support listings, and shared oral history memory cards.
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-rose-600 hover:underline font-bold self-start sm:self-auto"
            >
              Clear Search
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type keywords (e.g., 'water', 'shelter', 'Poonch', 'exodus', 'dialogue')..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors shadow-2xs"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Search Results Display */}
      {searchQuery.trim() !== "" && (
        <div className="bg-white p-5 rounded-xl border-2 border-emerald-500/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
              Search Results for "{searchQuery}"
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
              {matchingDialogues.length + matchingSupport.length + matchingMemories.length} matches found
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matching Dialogues */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Dialogue Bridge Rooms ({matchingDialogues.length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {matchingDialogues.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No matching dialog rooms.</p>
                ) : (
                  matchingDialogues.map((room) => (
                    <div key={room.id} className="p-3 bg-slate-50 hover:bg-emerald-50/20 border border-slate-100 rounded-lg space-y-1 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] line-clamp-1">{room.title}</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase shrink-0">{room.category}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{room.description}</p>
                      <button
                        onClick={() => setActiveTab("dialogue")}
                        className="text-[9px] text-emerald-700 hover:text-emerald-950 font-bold flex items-center gap-0.5 mt-1"
                      >
                        Go to Room <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Matching Support */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-teal-600" />
                Refugee Support Board ({matchingSupport.length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {matchingSupport.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No matching support items.</p>
                ) : (
                  matchingSupport.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 hover:bg-teal-50/20 border border-slate-100 rounded-lg space-y-1 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] line-clamp-1">{item.title}</span>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                          item.type === "offer" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                        }`}>
                          {item.type === "offer" ? "Offer" : "Need"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1">
                        <span>📍 {item.location}</span>
                        <button
                          onClick={() => setActiveTab("refugees")}
                          className="text-[9px] text-teal-700 hover:text-teal-950 font-bold flex items-center gap-0.5"
                        >
                          View Board <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Matching Memories */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                Memory Testimonies ({matchingMemories.length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {matchingMemories.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No matching testimonies.</p>
                ) : (
                  matchingMemories.map((mem) => (
                    <div key={mem.id} className="p-3 bg-slate-50 hover:bg-amber-50/20 border border-slate-100 rounded-lg space-y-1 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] line-clamp-1">"{mem.title}"</span>
                        <span className="text-[8px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-bold uppercase shrink-0">{mem.tag}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 italic line-clamp-2">"{mem.text}"</p>
                      <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1">
                        <span>✍️ {mem.author} ({mem.location})</span>
                        <button
                          onClick={() => setActiveTab("memories")}
                          className="text-[9px] text-amber-700 hover:text-amber-950 font-bold flex items-center gap-0.5"
                        >
                          Read More <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Active Dialogues</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-950">{activeConversations}</span>
            <p className="text-[10px] text-emerald-600 mt-1">● {totalMessages} monitored logs</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Resource Board</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-950">{totalResourceBoard}</span>
            <p className="text-[10px] text-teal-600 mt-1">Offers & support needs</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Memory Archives</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-950">{testimoniesArchived}</span>
            <p className="text-[10px] text-amber-600 mt-1">Oral history solidarity files</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Early Warnings</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-950">{warningTriggers}</span>
            <p className="text-[10px] text-rose-600 mt-1">Sentinel locations logged</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Scanner Shield</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-950">Active</span>
            <p className="text-[10px] text-blue-600 mt-1">Gemini AI verification engine</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Peacebuilding Approach */}
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs lg:col-span-2 space-y-4">
          <h2 className="text-lg font-display font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            The HarmonyX Peace Model
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-emerald-50/50 rounded-lg space-y-1">
              <h3 className="font-semibold text-emerald-900">1. Facilitated AI Dialogue</h3>
              <p className="text-slate-600 leading-relaxed">
                Dual-language automatic translation and AI-backed de-escalation filters re-frame hostile commentary into polite dialogue, preventing immediate digital escalation.
              </p>
            </div>
            
            <div className="p-3 bg-teal-50/50 rounded-lg space-y-1">
              <h3 className="font-semibold text-teal-900">2. Real-Time Misinformation Shield</h3>
              <p className="text-slate-600 leading-relaxed">
                Mitigates hate waves by scoring and fact-checking circulating social media claims, offering objective context and counter-narratives.
              </p>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-lg space-y-1">
              <h3 className="font-semibold text-amber-900">3. Beacon Connection for Displaced</h3>
              <p className="text-slate-600 leading-relaxed">
                Coordinates local shelter, language aid, and medical support while using our AI refugee companion to generate administrative letters and local advice.
              </p>
            </div>

            <div className="p-3 bg-rose-50/50 rounded-lg space-y-1">
              <h3 className="font-semibold text-rose-900">4. Early Sentinel Warnings</h3>
              <p className="text-slate-600 leading-relaxed">
                Empowers field observers to file warning signals. Gemini automatically grades threats and advises civil peace councils on preventative diplomacy.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              How does AI support reconciliation?
            </div>
            <button 
              onClick={() => setActiveTab("scanner")}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 transition-colors"
            >
              Try Scanners <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Sentinel Ticker */}
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-display font-semibold text-slate-950 uppercase tracking-wider flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              Live Early Warnings
            </h2>
            
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="text-xs border-l-2 border-rose-300 pl-3 py-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{alert.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      alert.riskLevel === "High" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {alert.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">{alert.description}</p>
                  <p className="text-[10px] text-slate-400">{alert.region}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("sentinel")}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
          >
            Open Sentinel Network
          </button>
        </div>

      </div>

      {/* Human Dignity Spotlight Section */}
      <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2 space-y-2">
          <div className="text-xs font-bold text-amber-800 tracking-wide uppercase flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-amber-700" /> Spotlight Testimony: Historical Memory
          </div>
          {memories.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-950">"{memories[0].title}" — {memories[0].location}</h3>
              <p className="text-xs text-slate-600 italic line-clamp-2">
                "{memories[0].text}"
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setActiveTab("memories")}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Read Memory Archives
          </button>
        </div>
      </div>
    </div>
  );
}