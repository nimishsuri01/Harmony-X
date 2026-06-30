export interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  translatedText?: string;
  deescalatedText?: string;
  wasModerated?: boolean;
  community: string; // e.g. "Community A", "Community B", "Neutral Moderator"
  isBot?: boolean;
}

export interface DialogueChannel {
  id: string;
  title: string;
  description: string;
  category: string;
  messages: Message[];
}

export interface SupportItem {
  id: string;
  type: "request" | "offer";
  title: string;
  category: "Shelter" | "Legal Support" | "Language Aid" | "Medical / Food" | "Other";
  location: string;
  description: string;
  contact: string;
  timestamp: string;
}

export interface MemoryTestimony {
  id: string;
  title: string;
  author: string;
  location: string;
  text: string;
  timestamp: string;
  tag: "Friendship" | "Reconciliation" | "Survival" | "Shared Heritage";
}

export interface EarlyWarningReport {
  id: string;
  category: "Online Hate Speech Spike" | "Water/Resource Dispute" | "Displaced Influx" | "Cross-border Incident" | "Other Warning";
  region: string;
  description: string;
  riskLevel: "High" | "Medium" | "Low";
  source: string;
  aiActionPlan: string;
  timestamp: string;
}

export interface HateSpeechResult {
  score: number; // 0-100
  intensity: "None" | "Low" | "Medium" | "High" | "Severe";
  categories: {
    xenophobia: number;
    sectarianism: number;
    dehumanizing: number;
    incitement: number;
  };
  analysis: string;
  counterNarrative: string;
  suggestedAlternative: string;
}

export interface TruthVerifyResult {
  truthScore: number; // 0-100
  verdict: "Fully Verified" | "Mostly True" | "Misleading / Out of Context" | "False / Propaganda" | "Unverified Rumor";
  analysis: string;
  evidence: string[];
  context: string;
}

export interface FactQuizItem {
  id: string;
  claim: string;
  category: string;
  options: string[];
}

export interface QuizAnswerResponse {
  correct: boolean;
  selectedOption: string;
  correctOption: string;
  explanation: string;
  pointsEarned: number;
}

export interface AudioHateResult extends HateSpeechResult {
  transcription: string;
  dialectDetected?: string;
}

export interface SmartIDVaultEntry {
  id: string;
  title: string;
  description: string;
  docType: string;
  ownerAlias: string;
  cid: string;
  mimeType: string;
  iv: string;
  salt: string;
  tag: string;
  createdAt: string;
}

export interface RefugeeAssistantResult {
  translatedText: string;
  explanation: string;
  draftedResponse: string;
  resources: string[];
}