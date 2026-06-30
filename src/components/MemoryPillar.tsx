import React, { useState, useRef, useEffect } from "react";
import { Bookmark, Plus, Feather, Heart, Milestone, Globe, Award, Sparkles, Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { MemoryTestimony } from "../types";

interface Props {
  memories: MemoryTestimony[];
  onAddMemory: (memory: Omit<MemoryTestimony, "id" | "timestamp">) => void;
}

export default function MemoryPillar({ memories, onAddMemory }: Props) {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [tag, setTag] = useState<"Friendship" | "Reconciliation" | "Survival" | "Shared Heritage">("Friendship");

  // Audio Recording States & Refs
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    setTranscribeError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/aac")) {
        mimeType = "audio/aac";
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 100) {
          setTranscribeError("Recorded audio was too short or empty.");
          return;
        }

        await handleTranscribe(audioBlob, mimeType);
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) { // Max 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error("Failed to access microphone:", err);
      setTranscribeError(
        err.name === "NotAllowedError"
          ? "Microphone access denied. Please enable microphone permissions in your browser's settings."
          : "Could not access microphone. Please verify your recording device is active and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleTranscribe = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setTranscribeError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1];
          
          const response = await fetch("/api/transcribe-memory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: mimeType,
            }),
          });

          if (!response.ok) {
            throw new Error("The voice-to-text service encountered an error. Please try again.");
          }

          const data = await response.json();
          
          if (data.transcription) {
            setText(data.transcription);
            if (data.suggestedTitle) {
              setTitle(data.suggestedTitle);
            }
            if (data.suggestedTag) {
              const mappedTag = data.suggestedTag;
              if (mappedTag === "Friendship" || mappedTag === "Reconciliation" || mappedTag === "Survival" || mappedTag === "Shared Heritage") {
                setTag(mappedTag);
              } else {
                setTag("Reconciliation");
              }
            }
          } else {
            throw new Error("Speech model did not return any readable transcript. Try speaking louder or closer.");
          }
        } catch (e: any) {
          console.error("Fetch/Parse transcription error:", e);
          setTranscribeError(e.message || "An error occurred while generating speech transcription.");
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err: any) {
      console.error("Transcription reading error:", err);
      setTranscribeError("Failed to prepare your audio recording. Please try again.");
      setIsTranscribing(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Filter/tag state
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    onAddMemory({
      title,
      author: author.trim() || "Anonymized Elder",
      location: location.trim() || "Border Sector",
      text,
      tag
    });

    // Reset Form
    setTitle("");
    setAuthor("");
    setLocation("");
    setText("");
    setShowForm(false);
  };

  const filteredMemories = memories.filter((mem) => {
    if (selectedTag === "All") return true;
    return mem.tag === selectedTag;
  });

  // Curated Reconciliation Timeline Data
  const timelineEvents = [
    {
      year: "1998",
      title: "The Good Friday Agreement",
      location: "Northern Ireland",
      description: "Decades of deadly sectarian warfare ('The Troubles') were resolved through joint-governance and decommissioning of weapons, proving political pluralism and dialog can conquer inter-community bloodshed.",
      icon: <Globe className="w-4 h-4" />
    },
    {
      year: "1995",
      title: "Truth & Reconciliation Commission",
      location: "South Africa",
      description: "Post-apartheid transition led by Nelson Mandela and Desmond Tutu prioritized restorative justice, public confession, and truth-disclosure over vengeance, healing profound racial partition.",
      icon: <Feather className="w-4 h-4" />
    },
    {
      year: "1950",
      title: "Schuman Declaration",
      location: "Western Europe",
      description: "フランス and ドイツ (France and Germany), historic rivals that fought devastating world wars, pooled coal and steel production, making war 'not merely unthinkable, but materially impossible.' This founded European peace integration.",
      icon: <Award className="w-4 h-4" />
    },
    {
      year: "Ongoing",
      title: "Cross-Border Sacred Shrining",
      location: "Indo-Pak Zero Line",
      description: "For over 200 years, the Chamliyal shrine has brought together opposing border villages. Even during tense ceasefires, border rangers and citizens coordinate sacred mud sharing, keeping shared folklore alive.",
      icon: <Heart className="w-4 h-4" />
    }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      
      {/* Testimonies Archive (Left 3 Columns) */}
      <div className="xl:col-span-3 space-y-4">
        
        {/* Archive Header */}
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-emerald-700" />
              Solidarity & Friendship Archive
            </h2>
            <p className="text-[10px] text-slate-500">Preserving memories of shared humanity, historical cooperation, and cross-border compassion.</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <Feather className="w-3.5 h-3.5" /> Submit Testimony
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-emerald-300 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-950 uppercase">Anonymously Submit Oral History / Testimony</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Testimony Title:</label>
                <input
                  type="text"
                  placeholder="e.g. The Shared Well during the 1971 exodus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Author Name (or Pseudonym):</label>
                <input
                  type="text"
                  placeholder="e.g. Grandson of Farmer / Anonymous"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Location of memory:</label>
                <input
                  type="text"
                  placeholder="e.g. Poonch District"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Theme Category:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["Friendship", "Reconciliation", "Survival", "Shared Heritage"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`py-1 rounded text-[9px] font-bold border transition-colors ${
                        tag === t
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice-to-text integration card */}
              <div className="col-span-2 bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Mic className={`w-3.5 h-3.5 text-emerald-700 ${isRecording ? "animate-pulse text-rose-600" : ""}`} />
                    Record Voice Testimony
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI Speech-to-Text
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">
                  Speak in any community language (English, Urdu, Hindi, Punjabi, etc.). Our neural peace model will transcribe, translate, suggest a title, and auto-tag it for you.
                </p>

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isTranscribing}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Mic className="w-3.5 h-3.5" /> Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5" /> Stop Recording ({formatTime(recordingTime)})
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0s", animationDuration: "0.6s" }}></div>
                      <div className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s", animationDuration: "0.6s" }}></div>
                      <div className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s", animationDuration: "0.6s" }}></div>
                      <div className="w-1 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "0.6s" }}></div>
                      <div className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s", animationDuration: "0.6s" }}></div>
                    </div>
                  )}

                  {isTranscribing && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                      <span>Gemini transcribing & analyzing...</span>
                    </div>
                  )}
                </div>

                {transcribeError && (
                  <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-700 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{transcribeError}</span>
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Your memory (focus on peace, common heritage, and human dignity):</label>
                <textarea
                  rows={4}
                  placeholder="Write or voice-record the oral testimony here. Focus on the human element, shared resources, or unexpected acts of community protection across the divide."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
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
                Archive Testimony
              </button>
            </div>
          </form>
        )}

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold bg-white p-2 rounded-xl border border-emerald-50 shadow-2xs">
          {["All", "Friendship", "Reconciliation", "Survival", "Shared Heritage"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedTag === t
                  ? "bg-emerald-50 text-emerald-900 shadow-2xs border border-emerald-200"
                  : "text-slate-500 hover:bg-slate-100 border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Testimonies List */}
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredMemories.map((mem) => (
            <div key={mem.id} className="bg-white p-4 rounded-xl border border-emerald-50 shadow-3xs space-y-3 relative hover:border-emerald-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {mem.tag}
                </span>
                <span className="text-[10px] text-slate-400">
                  Logged {new Date(mem.timestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-950 font-display">"{mem.title}"</h4>
                <div className="text-[10px] text-slate-500">
                  Submitted by: <strong className="text-slate-700">{mem.author}</strong> • Region: <strong className="text-slate-700">{mem.location}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-emerald-500 pl-3.5 bg-slate-50/50 py-2 rounded-r-lg">
                "{mem.text}"
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Historical Reconciliation Timeline (Right 2 Columns) */}
      <div className="xl:col-span-2 space-y-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-emerald-700" />
              Moments of Reconciliation
            </h2>
            <p className="text-[10px] text-slate-500">
              Proven historical milestones demonstrating that even the most bitter geopolitical partitions can heal.
            </p>
          </div>

          {/* Timeline flow */}
          <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-5">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="relative space-y-1.5 text-xs">
                {/* Timeline Dot with Icon */}
                <span className="absolute -left-7 top-0.5 p-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs">
                  {event.icon}
                </span>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 font-display">{event.year}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{event.location}</span>
                </div>

                <div className="space-y-1 bg-slate-50/65 p-3 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-slate-900 leading-tight">{event.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{event.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/55 p-3.5 rounded-lg border border-amber-100 text-[11px] text-slate-600 flex gap-2 items-start">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Reconciliation is possible:</strong> History teaches us that deep borders, weapon build-ups, and generational hate can be reversed when communities commit to cooperative architecture.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}