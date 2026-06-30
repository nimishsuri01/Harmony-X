import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, ShieldAlert, Sparkles, Languages, RefreshCw, UserCheck } from "lucide-react";
import { DialogueChannel, Message } from "../types";

interface Props {
  channels: DialogueChannel[];
  onSendMessage: (channelId: string, user: string, text: string, community: string) => Promise<void>;
  loading: boolean;
}

export default function DialoguePillar({ channels, onSendMessage, loading }: Props) {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || "");
  const [userName, setUserName] = useState<string>("");
  const [community, setCommunity] = useState<string>("Community A");
  const [inputText, setInputText] = useState<string>("");
  const [showOriginals, setShowOriginals] = useState<{ [key: string]: boolean }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChannel?.messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !userName.trim()) return;

    const textToSend = inputText;
    setInputText("");
    await onSendMessage(selectedChannel.id, userName, textToSend, community);
  };

  const toggleShowOriginal = (msgId: string) => {
    setShowOriginals((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[580px]">
      {/* Channels Sidebar */}
      <div className="bg-white rounded-xl border border-emerald-100 p-4 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          Dialogue Bridge Rooms
        </h2>
        
        <div className="space-y-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannelId(channel.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all text-xs space-y-1 ${
                selectedChannel.id === channel.id
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium"
                  : "bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <div className="font-semibold line-clamp-1">{channel.title}</div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{channel.description}</p>
              <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-emerald-100/50 text-emerald-800 rounded font-bold uppercase">
                {channel.category}
              </span>
            </button>
          ))}
        </div>

        {/* User Identity Setup */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            Set Community Identity
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500">Observer/User Name:</label>
            <input
              type="text"
              placeholder="e.g. Nimish, Priya, Guest"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] text-slate-500">Your Affiliation:</label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setCommunity("Community A")}
                className={`py-1 rounded text-[9px] font-bold border transition-colors ${
                  community === "Community A"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                Green Sector
              </button>
              <button
                type="button"
                onClick={() => setCommunity("Community B")}
                className={`py-1 rounded text-[9px] font-bold border transition-colors ${
                  community === "Community B"
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                Amber Sector
              </button>
              <button
                type="button"
                onClick={() => setCommunity("Neutral")}
                className={`py-1 rounded text-[9px] font-bold border transition-colors ${
                  community === "Neutral"
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                Observer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="bg-white rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between lg:col-span-3 overflow-hidden">
        
        {/* Chat Room Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-emerald-50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">{selectedChannel.title}</h3>
            <p className="text-[10px] text-slate-500">{selectedChannel.description}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 font-bold px-2 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            AI Shield Active
          </div>
        </div>

        {/* Messages list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[420px] min-h-[350px]">
          {selectedChannel.messages.map((msg) => {
            const isSelf = msg.user === userName;
            const isBot = msg.isBot;
            
            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1 max-w-[85%] ${
                  isBot
                    ? "mx-auto bg-teal-50/60 border border-teal-100 rounded-xl p-3 text-slate-800"
                    : isSelf
                    ? "ml-auto items-end"
                    : "mr-auto"
                }`}
              >
                {!isBot && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-slate-800">{msg.user}</span>
                    <span className={`px-1 py-0.1 rounded text-[8px] font-bold ${
                      msg.community === "Community A" ? "bg-emerald-50 text-emerald-800" :
                      msg.community === "Community B" ? "bg-amber-50 text-amber-800" : "bg-teal-50 text-teal-800"
                    }`}>
                      {msg.community}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Message Body */}
                <div className={`p-3 rounded-xl text-xs space-y-1.5 shadow-2xs ${
                  isBot
                    ? ""
                    : isSelf
                    ? "bg-emerald-700 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-950 rounded-bl-none"
                }`}>
                  {/* Moderated Indicator */}
                  {msg.wasModerated ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-950/20 px-1.5 py-0.5 rounded w-fit">
                        <ShieldAlert className="w-3 h-3" /> De-escalated for Pluralism & Human Dignity
                      </div>
                      <p className="font-medium leading-relaxed">
                        {msg.deescalatedText}
                      </p>
                      
                      {/* Original trigger comparison (collapsible) */}
                      <div>
                        <button
                          onClick={() => toggleShowOriginal(msg.id)}
                          className="text-[9px] text-amber-200 hover:text-white underline font-semibold focus:outline-none"
                        >
                          {showOriginals[msg.id] ? "Hide Original Claim" : "Research original inflammatory claim"}
                        </button>
                        {showOriginals[msg.id] && (
                          <div className="mt-1 p-2 rounded bg-amber-950/30 text-[10px] text-amber-100 italic border-l-2 border-amber-500">
                            Original trigger word-choice: "{msg.text}"
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}

                  {/* Dual Urdu/Hindi script translation */}
                  {msg.translatedText && (
                    <div className={`mt-1 border-t border-dashed text-[10px] pt-1 flex items-center gap-1 ${
                      isSelf ? "border-emerald-500/30 text-emerald-200" : "border-slate-200 text-slate-500"
                    }`}>
                      <Languages className="w-3 h-3 shrink-0" />
                      <span className="italic">{msg.translatedText}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              Harmony AI evaluating, translation scripts routing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            disabled={!userName.trim()}
            placeholder={
              userName.trim()
                ? "Speak of peace, air grievance, or discuss solutions..."
                : "⚠️ Setup observer name and community on left sidebar first..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim() || !userName.trim()}
            className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}