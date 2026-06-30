import React, { useState } from "react";
import { ShieldAlert, BookOpen, AlertCircle, CheckCircle, Search, HelpCircle, Activity, Sparkles, Music, Headphones, Trophy, Mic, XCircle, CheckCircle2 } from "lucide-react";
import { HateSpeechResult, TruthVerifyResult, FactQuizItem, QuizAnswerResponse, AudioHateResult } from "../types";

const quizCandidates: FactQuizItem[] = [
  {
    id: "quiz-1",
    claim: "A recent report claims that the upstream canal closure was intentionally ordered by border forces to harm farmers downstream.",
    category: "Water Security",
    options: [
      "Fully Verified",
      "Mostly True",
      "Misleading / Out of Context",
      "False / Propaganda"
    ]
  },
  {
    id: "quiz-2",
    claim: "An audio forward claimed foreign nationals were intentionally spreading disease through local markets.",
    category: "Health Misinformation",
    options: [
      "Fully Verified",
      "Mostly True",
      "Misleading / Out of Context",
      "False / Propaganda"
    ]
  }
];

export default function ScannerPillar() {
  const [activeSubTab, setActiveSubTab] = useState<"hate" | "truth" | "quiz" | "audio">("hate");
  const [textInput, setTextInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hateResult, setHateResult] = useState<HateSpeechResult | null>(null);
  const [truthResult, setTruthResult] = useState<TruthVerifyResult | null>(null);
  const [quizItem, setQuizItem] = useState<FactQuizItem | null>(quizCandidates[0]);
  const [quizAnswer, setQuizAnswer] = useState<string>("");
  const [quizResult, setQuizResult] = useState<QuizAnswerResponse | null>(null);
  const [trustPoints, setTrustPoints] = useState<number>(1200);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [audioResult, setAudioResult] = useState<AudioHateResult | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

  const handleHateScan = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setQuizResult(null);
    try {
      const res = await fetch("/api/analyze-hate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput })
      });
      const data = await res.json();
      setHateResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTruthScan = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setQuizResult(null);
    try {
      const res = await fetch("/api/verify-truth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: textInput })
      });
      const data = await res.json();
      setTruthResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!quizItem || !quizAnswer) return;
    setLoading(true);
    try {
      const res = await fetch("/api/quiz-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quizItem.id, answer: quizAnswer })
      });
      const data = await res.json();
      setQuizResult(data);
      setTrustPoints((prev) => prev + data.pointsEarned);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioFileSelect = (file: File | null) => {
    setSelectedAudioFile(file);
    setAudioUrl(file ? URL.createObjectURL(file) : "");
    setAudioResult(null);
  };

  const handleAudioScan = async () => {
    if (!selectedAudioFile) return;
    setAudioLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/analyze-audio-hate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64: base64, mimeType: selectedAudioFile.type })
        });
        const data = await res.json();
        setAudioResult(data);
      };
      reader.readAsDataURL(selectedAudioFile);
    } catch (e) {
      console.error(e);
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveSubTab("hate");
            setTextInput("");
          }}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "hate"
              ? "border-emerald-700 text-emerald-950"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Hate Speech & Polarization Analyzer
        </button>
        <button
          onClick={() => {
            setActiveSubTab("truth");
            setTextInput("");
          }}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "truth"
              ? "border-emerald-700 text-emerald-950"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Factual Rumor Verifier
        </button>
        <button
          onClick={() => {
            setActiveSubTab("quiz");
            setTextInput("");
            setQuizResult(null);
          }}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "quiz"
              ? "border-emerald-700 text-emerald-950"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Fact-Checking Battle
        </button>
        <button
          onClick={() => {
            setActiveSubTab("audio");
            setTextInput("");
            setAudioResult(null);
          }}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "audio"
              ? "border-emerald-700 text-emerald-950"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Headphones className="w-4 h-4" />
          Audio Hate Speech Filter
        </button>
      </div>

      {/* Main input layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Input Box */}
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {activeSubTab === "hate"
                ? "Scan Social Media comments or speech"
                : activeSubTab === "truth"
                ? "Enter conflicting border-zone rumors"
                : activeSubTab === "quiz"
                ? "Crowdsourced Fact-Check Battle"
                : "Upload voice notes or dialect recordings"}
            </h2>
            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 uppercase">
              {activeSubTab === "quiz" ? "Community Trust" : "Gemini Analyzer"}
            </span>
          </div>

          {activeSubTab === "audio" ? (
            <div className="space-y-4">
              <label className="block text-[10px] text-slate-500 uppercase tracking-wide">Select Audio File</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleAudioFileSelect(e.target.files?.[0] ?? null)}
                className="w-full text-[10px]"
              />
              {audioUrl && (
                <audio controls src={audioUrl} className="w-full mt-2"></audio>
              )}
              <button
                onClick={handleAudioScan}
                disabled={audioLoading || !selectedAudioFile}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {audioLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Analyzing speech signal for hate and dialect content...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Scan Audio Speech for Hate Speech
                  </>
                )}
              </button>
            </div>
          ) : activeSubTab === "quiz" ? (
            <div className="space-y-4">
              <div className="text-[11px] font-bold text-slate-700">Review the flagged claim and select the correct classification.</div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
                <div className="font-semibold text-slate-900">Claim</div>
                <p className="text-slate-600 leading-relaxed">{quizItem?.claim}</p>
                <div className="grid grid-cols-1 gap-2 pt-3">
                  {quizItem?.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setQuizAnswer(option)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                        quizAnswer === option
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleQuizSubmit}
                disabled={loading || !quizAnswer}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Submitting verdict to the community scoreboard...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Submit verdict and earn trust points
                  </>
                )}
              </button>

              <div className="text-[10px] text-slate-500">Community Trust Points: <strong>{trustPoints}</strong></div>
            </div>
          ) : (
            <>
              <textarea
                rows={6}
                placeholder={
                  activeSubTab === "hate"
                    ? "Paste comment, WhatsApp forward, or text here (e.g., 'We must boycott those outsiders, they are taking our resources and water! They are bad people!')"
                    : "Enter circulating claim or rumor (e.g., 'Reports saying downstream neighbors intentionally shut the canals and contaminated our main supply!')"
                }
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <button
                onClick={activeSubTab === "hate" ? handleHateScan : handleTruthScan}
                disabled={loading || !textInput.trim()}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Parsing linguistics metrics, routing grounding models...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {activeSubTab === "hate" ? "Analyze polarization metrics" : "Verify facts & verify context"}
                  </>
                )}
              </button>
            </>
          )}

          {/* Quick templates to try */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Try Hackathon demo text templates:</div>
            <div className="space-y-1.5">
              {activeSubTab === "hate" ? (
                <>
                  <button
                    onClick={() => setTextInput("These illegal border-crossing people are bringing disease and crime. They do not share our values. Kick them out of our communities immediately!")}
                    className="block w-full text-left p-2 bg-slate-50 hover:bg-slate-100 rounded text-[10px] text-slate-600 truncate border border-slate-200"
                  >
                    Xenophobic forward
                  </button>
                  <button
                    onClick={() => setTextInput("Our local community has concerns regarding job allocation, but we must discuss it together peacefully with our regional representatives to find solutions.")}
                    className="block w-full text-left p-2 bg-slate-50 hover:bg-slate-100 rounded text-[10px] text-slate-600 truncate border border-slate-200"
                  >
                    Polite, constructive dialogue template
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setTextInput("Urgent: Border forces have shut down the main reservoir irrigation lock to cause agricultural famine downstream!")}
                    className="block w-full text-left p-2 bg-slate-50 hover:bg-slate-100 rounded text-[10px] text-slate-600 truncate border border-slate-200"
                  >
                    Rumor of intentional water block
                  </button>
                  <button
                    onClick={() => setTextInput("Social media claims a displacement caravan of 20,000 has breached border zone without checks.")}
                    className="block w-full text-left p-2 bg-slate-50 hover:bg-slate-100 rounded text-[10px] text-slate-600 truncate border border-slate-200"
                  >
                    Exaggerated refugee surge claim
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Results Display */}
        <div className="space-y-4">
          
          {/* Default view */}
          {!hateResult && !truthResult && !quizResult && !audioResult && !loading && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center space-y-3 min-h-[350px] flex flex-col justify-center items-center">
              <HelpCircle className="w-12 h-12 text-slate-400" />
              <div className="max-w-xs space-y-1">
                <h3 className="text-xs font-bold text-slate-700">Awaiting input scan</h3>
                <p className="text-[11px] text-slate-500">
                  HarmonyX is ready to protect local narratives. Paste a comment, upload an audio clip, or test your fact-check skills.
                </p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-white rounded-xl border border-emerald-100 p-8 text-center space-y-4 min-h-[350px] flex flex-col justify-center items-center shadow-xs">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-100 border-t-emerald-700 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                </div>
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-xs font-bold text-slate-800">Processing with Gemini AI</h3>
                <p className="text-[11px] text-slate-500">
                  Scanning for dehumanization triggers, sectarian keywords, factual verification indexes, and drafting constructive peace dialogues.
                </p>
              </div>
            </div>
          )}

          {/* Audio Result */}
          {activeSubTab === "audio" && audioResult && !audioLoading && (
            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Audio Hate Speech Review</span>
                  <p className="text-xs text-slate-600">Dialect-aware speech transcription and hate signal identification.</p>
                </div>
                <Music className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-semibold text-slate-900">Transcription</p>
                  <p className="text-slate-600 mt-2">{audioResult.transcription}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Dialect Detected</p>
                    <p className="text-slate-900 font-semibold">{audioResult.dialectDetected || "Unknown / Mixed"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Hate Score</p>
                    <p className="text-slate-900 font-semibold">{audioResult.score} / 100</p>
                  </div>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-xs text-rose-700">
                  <p className="font-semibold">Detected topic</p>
                  <p>{audioResult.analysis}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Result */}
          {activeSubTab === "quiz" && quizResult && !loading && (
            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Crowdsourced Fact-Check Battle</span>
                  <p className="text-xs text-slate-600">Earn points for accurate reporting and strengthen community trust.</p>
                </div>
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-3 text-xs">
                <p className="font-semibold text-slate-900">Your Answer: {quizResult.selectedOption}</p>
                <p className={`text-sm ${quizResult.correct ? "text-emerald-700" : "text-rose-700"}`}>
                  {quizResult.correct ? "Correct!" : "Incorrect."}
                </p>
                <p className="text-slate-700">{quizResult.explanation}</p>
                <div className="text-[10px] text-slate-500">Points earned: <strong>{quizResult.pointsEarned}</strong></div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
                  Correct answer: <strong>{quizResult.correctOption}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Hate speech result */}
          {activeSubTab === "hate" && hateResult && !loading && (
            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-4">
              
              {/* Score Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Polarization Index Score</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold font-display text-slate-950">{hateResult.score} / 100</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      hateResult.intensity === "Severe" || hateResult.intensity === "High"
                        ? "bg-rose-50 text-rose-700"
                        : hateResult.intensity === "Medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {hateResult.intensity} HATE
                    </span>
                  </div>
                </div>
                <ShieldAlert className={`w-8 h-8 ${
                  hateResult.score > 60 ? "text-rose-500 animate-bounce" : "text-emerald-500"
                }`} />
              </div>

              {/* Categorical Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Harm Dial Breakdown</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Xenophobia / Racism</span>
                      <span>{hateResult.categories.xenophobia}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${hateResult.categories.xenophobia}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Sectarianism</span>
                      <span>{hateResult.categories.sectarianism}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${hateResult.categories.sectarianism}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Dehumanizing Script</span>
                      <span>{hateResult.categories.dehumanizing}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${hateResult.categories.dehumanizing}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Incitement / Threat</span>
                      <span>{hateResult.categories.incitement}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-700 h-full rounded-full" style={{ width: `${hateResult.categories.incitement}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualitative Analysis */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs space-y-1">
                <h3 className="font-bold text-slate-800 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Linguistic Analysis
                </h3>
                <p className="text-slate-600 leading-relaxed italic">
                  "{hateResult.analysis}"
                </p>
              </div>

              {/* De-escalated, respectful replacement suggestion */}
              <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs space-y-1.5">
                <h3 className="font-bold text-emerald-950 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Human-Dignity Alternative Draft (Pluralism Friendly)
                </h3>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  "{hateResult.suggestedAlternative}"
                </p>
              </div>

              {/* Peace counter narrative recommendation */}
              <div className="p-3.5 rounded-lg bg-teal-50/50 border border-teal-100 text-xs space-y-1">
                <h3 className="font-bold text-teal-950">Active Counter-Narrative Recommendation</h3>
                <p className="text-teal-900 leading-relaxed">
                  {hateResult.counterNarrative}
                </p>
              </div>

            </div>
          )}

          {/* Truth Verification result */}
          {activeSubTab === "truth" && truthResult && !loading && (
            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-4">
              
              {/* Score Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Fact Verification Index</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold font-display text-slate-950">{truthResult.truthScore} / 100</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      truthResult.truthScore > 75
                        ? "bg-emerald-50 text-emerald-700"
                        : truthResult.truthScore > 40
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                    }`}>
                      {truthResult.verdict}
                    </span>
                  </div>
                </div>
                <BookOpen className="w-8 h-8 text-teal-600" />
              </div>

              {/* Explanation of context */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs space-y-1">
                <h3 className="font-bold text-slate-800">Critical Verification Analysis</h3>
                <p className="text-slate-600 leading-relaxed">
                  {truthResult.analysis}
                </p>
              </div>

              {/* Factual Proof / Evidence */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Factual Verification Proof Points</span>
                <div className="space-y-2">
                  {truthResult.evidence.map((point, index) => (
                    <div key={index} className="flex gap-2 text-xs bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Factual Context to prevent panic */}
              <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-100 text-xs space-y-1">
                <h3 className="font-bold text-teal-950 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  De-escalation Context
                </h3>
                <p className="text-teal-900 leading-relaxed">
                  {truthResult.context}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
