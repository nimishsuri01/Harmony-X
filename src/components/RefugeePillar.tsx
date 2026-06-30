import React, { useState, useEffect } from "react";
import { Heart, Plus, Users, Landmark, Languages, Shield, Send, Copy, Sparkles, Clipboard, Check, DownloadCloud } from "lucide-react";
import { SupportItem, RefugeeAssistantResult, SmartIDVaultEntry } from "../types";

interface Props {
  support: SupportItem[];
  onAddSupportItem: (item: Omit<SupportItem, "id" | "timestamp">) => void;
}

export default function RefugeePillar({ support, onAddSupportItem }: Props) {
  const [activeBoard, setActiveBoard] = useState<"all" | "requests" | "offers">("all");
  
  // Post support item form states
  const [showForm, setShowForm] = useState<boolean>(false);
  const [type, setType] = useState<"request" | "offer">("request");
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<"Shelter" | "Legal Support" | "Language Aid" | "Medical / Food" | "Other">("Shelter");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [contact, setContact] = useState<string>("");

  // AI assistant states
  const [assistantText, setAssistantText] = useState<string>("");
  const [assistantCategory, setAssistantCategory] = useState<string>("Draft Registration Form");
  const [targetLang, setTargetLang] = useState<string>("English");
  const [assistantLoading, setAssistantLoading] = useState<boolean>(false);
  const [assistantResult, setAssistantResult] = useState<RefugeeAssistantResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [vaultTitle, setVaultTitle] = useState<string>("");
  const [vaultDescription, setVaultDescription] = useState<string>("");
  const [vaultDocType, setVaultDocType] = useState<string>("Passport");
  const [vaultAlias, setVaultAlias] = useState<string>("");
  const [vaultPassword, setVaultPassword] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [vaultEntries, setVaultEntries] = useState<SmartIDVaultEntry[]>([]);
  const [vaultLoading, setVaultLoading] = useState<boolean>(false);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [vaultSuccess, setVaultSuccess] = useState<string | null>(null);
  const [retrievePasswords, setRetrievePasswords] = useState<Record<string, string>>({});
  const [retrievedUrls, setRetrievedUrls] = useState<Record<string, string>>({});
  const [retrievingId, setRetrievingId] = useState<string | null>(null);

  const filteredSupport = support.filter((item) => {
    if (activeBoard === "all") return true;
    return item.type === activeBoard;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim() || !contact.trim()) return;
    
    onAddSupportItem({
      type,
      title,
      category,
      location,
      description,
      contact
    });

    // Reset Form
    setTitle("");
    setLocation("");
    setDescription("");
    setContact("");
    setShowForm(false);
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantText.trim()) return;
    setAssistantLoading(true);
    setAssistantResult(null);

    try {
      const res = await fetch("/api/assist-displaced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: assistantText,
          category: assistantCategory,
          targetLanguage: targetLang
        })
      });
      const data = await res.json();
      setAssistantResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAssistantLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchVaultEntries();
  }, []);

  const fetchVaultEntries = async () => {
    try {
      const res = await fetch("/api/vault/entries");
      const data = await res.json();
      setVaultEntries(data);
    } catch (e) {
      console.error("Failed to load vault entries", e);
    }
  };

  const handleVaultFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setVaultError(null);
    setVaultSuccess(null);
  };

  const handleVaultUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !vaultPassword.trim() || !vaultTitle.trim() || !vaultAlias.trim()) {
      setVaultError("Please complete the vault form and select a document.");
      return;
    }
    setVaultLoading(true);
    setVaultError(null);
    setVaultSuccess(null);

    try {
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch("/api/vault/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vaultTitle,
          description: vaultDescription,
          docType: vaultDocType,
          ownerAlias: vaultAlias,
          password: vaultPassword,
          fileBase64,
          mimeType: selectedFile.type
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Upload failed");
      }

      const entry = await res.json();
      setVaultEntries((prev) => [entry, ...prev]);
      setVaultSuccess("Document securely stored to IPFS with encrypted access.");
      setVaultTitle("");
      setVaultDescription("");
      setVaultAlias("");
      setVaultPassword("");
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setVaultError((error as Error).message || "Vault upload failed");
    } finally {
      setVaultLoading(false);
    }
  };

  const handleRetrieveDocument = async (entry: SmartIDVaultEntry) => {
    const password = retrievePasswords[entry.id] || "";
    if (!password.trim()) {
      setVaultError("Enter the encryption password for the selected document.");
      return;
    }
    setRetrievingId(entry.id);
    setVaultError(null);

    try {
      const res = await fetch("/api/vault/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, password })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Failed to retrieve document");
      }
      const data = await res.json();
      const binary = atob(data.fileBase64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      setRetrievedUrls((prev) => ({ ...prev, [entry.id]: url }));
      setVaultSuccess("Secure document decrypted. Use the download button below.");
    } catch (error) {
      console.error(error);
      setVaultError((error as Error).message || "Failed to retrieve document");
    } finally {
      setRetrievingId(null);
    }
  };

  const handleRetrievePasswordChange = (entryId: string, value: string) => {
    setRetrievePasswords((prev) => ({ ...prev, [entryId]: value }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      {/* Support Board (Left Column) */}
      <div className="space-y-4">
        
        {/* Board Header controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              Beacon Community Board
            </h2>
            <p className="text-[10px] text-slate-500">Coordinate shelter, legal protection, food, and language aid.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-0.5 rounded-lg flex text-[10px] font-bold">
              <button
                onClick={() => setActiveBoard("all")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeBoard === "all" ? "bg-white shadow-2xs text-slate-900" : "text-slate-500"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveBoard("requests")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeBoard === "requests" ? "bg-white shadow-2xs text-slate-900" : "text-slate-500"
                }`}
              >
                Needs Aid
              </button>
              <button
                onClick={() => setActiveBoard("offers")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeBoard === "offers" ? "bg-white shadow-2xs text-slate-900" : "text-slate-500"
                }`}
              >
                Offers Help
              </button>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Post Item
            </button>
          </div>
        </div>

        {/* Post Form (Collapsible) */}
        {showForm && (
          <form onSubmit={handleFormSubmit} className="bg-white p-5 rounded-xl border border-emerald-300 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-950 uppercase">Post Support Offer or Need</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Board Placement:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "request" | "offer")}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="request">Requesting Help (Needs Aid)</option>
                  <option value="offer">Offering Help (Offers Help)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Shelter">Shelter</option>
                  <option value="Legal Support">Legal Support</option>
                  <option value="Language Aid">Language Aid</option>
                  <option value="Medical / Food">Medical / Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Item Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Host family offering legal status mentorship"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Local Coordinate / Location:</label>
                <input
                  type="text"
                  placeholder="e.g. Jammu Resettlement"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Contact Email / Phone:</label>
                <input
                  type="text"
                  placeholder="e.g. helper@harmony.org"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Description / Coordinates:</label>
                <textarea
                  rows={3}
                  placeholder="Specify details, requirements, safety credentials, or urgency."
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
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors"
              >
                Publish Board Item
              </button>
            </div>
          </form>
        )}

        {/* Board List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredSupport.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No matching board coordination items published.
            </div>
          ) : (
            filteredSupport.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-xl border shadow-2xs space-y-3 hover:shadow-xs transition-shadow ${
                  item.type === "offer" ? "border-emerald-100" : "border-amber-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    item.type === "offer" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                  }`}>
                    {item.type === "offer" ? "Offering Help" : "Needs Aid"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-950 leading-tight">{item.title}</h4>
                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 uppercase">
                      {item.category}
                    </span>
                    <span>📍 {item.location}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Contact: <strong className="text-slate-800">{item.contact}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Beacon AI Refugee Support Assistant (Right Column) */}
      <div className="space-y-4">
        
        {/* Assistant Panel */}
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
              Beacon Refugee AI Assistant
            </h2>
            <p className="text-[10px] text-slate-500">
              Assisting displaced persons with translation, regulatory guidance, and formal drafts for official support.
            </p>
          </div>

          <form onSubmit={handleAISubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Support Focus:</label>
                <select
                  value={assistantCategory}
                  onChange={(e) => setAssistantCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Draft Registration Letter">Draft Registration Letter</option>
                  <option value="Translate Legal Form Requirements">Translate Legal Form Requirements</option>
                  <option value="Draft Temporary Housing Request">Draft Temporary Housing Request</option>
                  <option value="Language Aid & Local Terminology Guidance">Language Aid & Terms Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Target Host Language:</label>
                <input
                  type="text"
                  placeholder="e.g. English, Hindi, German, Urdu"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500">Describe what you need, paste form fields, or detail your family's displacement coordinates:</label>
              <textarea
                rows={4}
                placeholder="e.g. 'I arrived from Jammu border shelling zone. Need to request family enrollment for 2 kids in school but do not speak English well. Please write an application to the district officer.'"
                value={assistantText}
                onChange={(e) => setAssistantText(e.target.value)}
                className="w-full p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={assistantLoading || !assistantText.trim()}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {assistantLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating legal drafts and translating requirements...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Generate AI Support Pack
                </>
              )}
            </button>
          </form>

          {/* Assistant Output Result */}
          {assistantResult && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              
              {/* Draft Output Block */}
              {assistantResult.draftedResponse && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <Clipboard className="w-3.5 h-3.5" /> Drafted Application / Letter
                    </span>
                    <button
                      onClick={() => copyToClipboard(assistantResult.draftedResponse)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy Draft"}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[220px]">
                    {assistantResult.draftedResponse}
                  </pre>
                </div>
              )}

              {/* Translation Explanation */}
              {assistantResult.translatedText && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1">
                    <Languages className="w-4 h-4 text-teal-600" />
                    Translation & Language Notes
                  </h4>
                  <p className="text-slate-600 leading-relaxed italic">
                    {assistantResult.translatedText}
                  </p>
                </div>
              )}

              {/* Gentle Explanation */}
              {assistantResult.explanation && (
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs space-y-1">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    Guidance for the Host System
                  </h4>
                  <p className="text-emerald-900 leading-relaxed">
                    {assistantResult.explanation}
                  </p>
                </div>
              )}

              {/* NGO Resources & Steps */}
              {assistantResult.resources && assistantResult.resources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Helpful Action Steps & Local Coordinates</span>
                  <div className="space-y-1.5 text-xs">
                    {assistantResult.resources.map((res, i) => (
                      <div key={i} className="flex gap-2 items-start bg-slate-50/50 p-2 rounded-lg">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i+1}</span>
                        <p className="text-slate-600">{res}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Quick instructions when blank */}
          {!assistantResult && !assistantLoading && (
            <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/50 text-[11px] text-slate-600 flex gap-2 items-start">
              <Landmark className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">Assisting the Displaced Globally:</span>
                <p>The Beacon Assistant parses administrative systems to translate guidelines, explain steps compassionately, and craft formal responses in host languages.</p>
              </div>
            </div>
          )}

        </div>

        {/* Decentralized Smart ID Vault */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" />
              Smart ID Vault
            </h2>
            <p className="text-[10px] text-slate-500">
              Encrypt identity documents and store them on IPFS for secure refugee access using a private passphrase.
            </p>
          </div>

          <form onSubmit={handleVaultUpload} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Document Title</label>
                <input
                  value={vaultTitle}
                  onChange={(e) => setVaultTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="e.g. Refugee ID, Birth Certificate"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Owner Alias</label>
                <input
                  value={vaultAlias}
                  onChange={(e) => setVaultAlias(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="e.g. Amina / Ashok"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Document Type</label>
                <input
                  value={vaultDocType}
                  onChange={(e) => setVaultDocType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="e.g. Passport, Visa Letter"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Passphrase</label>
                <input
                  type="password"
                  value={vaultPassword}
                  onChange={(e) => setVaultPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Encryption passphrase"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-[10px] text-slate-500">Select Document File</label>
              <input
                type="file"
                accept=".pdf,image/*,application/pdf"
                className="w-full text-[11px] text-slate-700"
                onChange={(e) => handleVaultFileSelect(e.target.files?.[0] ?? null)}
              />
              {selectedFile && <p className="text-[11px] text-slate-500">Selected: {selectedFile.name}</p>}
            </div>

            <div className="text-xs text-slate-500">
              <span className="font-semibold">Note:</span> The file is encrypted in the browser and stored on IPFS as a decentralized content address. Only someone with the passphrase can decrypt and download it.
            </div>

            {vaultError && <div className="text-xs text-red-600">{vaultError}</div>}
            {vaultSuccess && <div className="text-xs text-emerald-700">{vaultSuccess}</div>}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={vaultLoading}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {vaultLoading ? "Encrypting & Storing..." : "Encrypt and Store Document"}
              </button>
              <span className="text-[10px] text-slate-400">Stored vault files can be retrieved with the passphrase and CID.</span>
            </div>
          </form>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">Vault Entries</h3>
              <span className="text-[10px] text-slate-500">{vaultEntries.length} documents</span>
            </div>

            {vaultEntries.length === 0 ? (
              <div className="text-[11px] text-slate-500">No secure documents have been stored yet.</div>
            ) : (
              <div className="space-y-3">
                {vaultEntries.map((entry) => (
                  <div key={entry.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900">{entry.title}</div>
                        <div className="text-[10px] text-slate-500">{entry.docType} • {entry.ownerAlias}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">Stored {new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400">CID</label>
                        <div className="text-[11px] break-all text-slate-700">{entry.cid}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400">Description</label>
                        <div className="text-[11px] text-slate-600">{entry.description}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        type="password"
                        placeholder="Enter passphrase to decrypt"
                        value={retrievePasswords[entry.id] || ""}
                        onChange={(e) => handleRetrievePasswordChange(entry.id, e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRetrieveDocument(entry)}
                        disabled={retrievingId === entry.id}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        {retrievingId === entry.id ? "Decrypting..." : "Retrieve"}
                      </button>
                    </div>

                    {retrievedUrls[entry.id] && (
                      <a
                        href={retrievedUrls[entry.id]}
                        download={`${entry.title}.${entry.mimeType.split("/")[1] || "bin"}`}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold"
                      >
                        Download decrypted file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple rotate helper for spin animation
function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
