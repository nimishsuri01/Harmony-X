import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { create as createIPFSClient } from "ipfs-http-client";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Path to persistent data
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const VAULT_DIR = path.join(DATA_DIR, "vault");

const ipfs = createIPFSClient({
  url: process.env.IPFS_API_URL || "https://ipfs.infura.io:5001/api/v0"
});

// Helper to initialize and get Gemini AI SDK
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Initial robust mock data for HarmonyX (winning project quality)
const initialDb = {
  dialogues: [
    {
      id: "room-1",
      title: "Room 06: South Asia Cross-Border Bridge",
      description: "A constructive dialog room for bridging divides and exploring cultural commonalities.",
      category: "Cross-Border Dialogue",
      messages: [
        {
          id: "m1",
          user: "Nimish (Sialkot Sector)",
          text: "I am tired of the constant news cycle stirring up anger between our sides. In our border villages, we listen to the exact same wedding songs and speak the same dialects.",
          timestamp: "2026-06-29T10:00:00Z",
          community: "Community A",
        },
        {
          id: "m2",
          user: "Priya (Jammu Division)",
          text: "I agree completely. In my house, my grandparents still talk about their childhood friend in Sialkot with so much love. The politics divides us, but our human bonds are identical.",
          timestamp: "2026-06-29T10:05:00Z",
          community: "Community B",
        },
        {
          id: "m3",
          user: "HarmonyBot",
          text: "Welcome Nimish and Priya! Highlighting joint artistic heritage, music, and shared elder histories is a powerful de-escalation tool. I will translate and guide your dialogue constructively.",
          timestamp: "2026-06-29T10:06:00Z",
          community: "Neutral Moderator",
          isBot: true,
        }
      ],
    },
    {
      id: "room-2",
      title: "Pluralism & Tolerance Youth Network",
      description: "Countering internet hate speech and building networks of trust among student communities.",
      category: "Inter-community Dialogue",
      messages: [
        {
          id: "m4",
          user: "Arif (Srinagar)",
          text: "Sometimes, online social circles are so polarized. If you speak for joint dialogue or human dignity, both sides brand you a traitor. It is very isolating.",
          timestamp: "2026-06-29T09:30:00Z",
          community: "Community A",
        },
        {
          id: "m5",
          user: "Rahul (Delhi)",
          text: "I feel that too. Online mobs thrive on hate because anger spreads faster than peace. That is why spaces like HarmonyX are important—they give us a platform to breathe and trust.",
          timestamp: "2026-06-29T09:35:00Z",
          community: "Community B",
        }
      ],
    }
  ],
  support: [
    {
      id: "sup-1",
      type: "offer",
      title: "Free Virtual Language & Integration Mentorship",
      category: "Language Aid",
      location: "Lahore / Online",
      description: "Providing conversational language, exam preparation, and local cultural orientation for refugee students displaced by border conflicts. Fully free and open-access.",
      contact: "lahore-peace-mentor@harmonyx.org",
      timestamp: "2026-06-29T08:00:00Z"
    },
    {
      id: "sup-2",
      type: "request",
      title: "Legal Aid & Status Verification Assistance Needed",
      category: "Legal Support",
      location: "Chamb Area Border Camp",
      description: "A family of 5 displaced by seasonal ceasefire shelling needs legal support to coordinate cross-jurisdiction document verification to enroll children in school.",
      contact: "displaced-aid-chamb@harmonyx.org",
      timestamp: "2026-06-29T08:30:00Z"
    },
    {
      id: "sup-3",
      type: "offer",
      title: "Temporary Shelter & Living Essentials",
      category: "Shelter",
      location: "Jammu Resettlement Zone",
      description: "Our community center has 3 vacant rooms with cooking facilities, blankets, and hygiene kits. Available for any displaced families or refugees in need.",
      contact: "jammu-center@harmonyx.org",
      timestamp: "2026-06-28T17:00:00Z"
    }
  ],
  memories: [
    {
      id: "mem-1",
      title: "The Locked Store of 1947",
      author: "Grandson of Gurdial Singh",
      location: "Amritsar / Lahore",
      text: "When my grandfather had to leave Lahore in 1947, his neighbor, Sheikh Rehman, kept my grandfather's dry-fruit shop keys. Sheikh Rehman ran the shop and sent the savings through informal channels for two years, then bought the shop fairly by transferring money back, ensuring our family had capital to survive in Amritsar. Honor and dignity rose above the chaos.",
      timestamp: "2026-06-29T07:15:00Z",
      tag: "Shared Heritage"
    },
    {
      id: "mem-2",
      title: "Joint Restoration of Baba Chamliyal Shrine",
      author: "Local Border Devotee",
      location: "Zero Line Border",
      text: "Every year, the Baba Chamliyal shrine at the border brings thousands of devotees from both sides. When the water pump broke during a massive heatwave, farmers from both sides synchronized repairs across the barbed-wire fence, passing pipes and tools to ensure devotees stayed hydrated. Faith and shared love have no border.",
      timestamp: "2026-06-29T07:45:00Z",
      tag: "Reconciliation"
    }
  ],
  alerts: [
    {
      id: "alt-1",
      category: "Online Hate Speech Spike",
      region: "Western Border Sector",
      description: "Coordinated coordination of bots spreading high-pitched communal audio recordings on chat apps inciting local village boycotts over agricultural workers.",
      riskLevel: "High",
      source: "Civil Society Sentinel Group",
      aiActionPlan: "Immediate recommendation: Broadcast local radio briefings emphasizing peaceful harvesting cooperation, hold open joint-communal elders council in Sialkot/Jammu border sector to dismiss the audio as doctored propaganda.",
      timestamp: "2026-06-28T14:30:00Z"
    },
    {
      id: "alt-2",
      category: "Water/Resource Dispute",
      region: "Chenab River Basin Downstream",
      description: "Seasonal low-flow tensions rising between downstream tail-end farmers and upstream canal locking groups during summer heat peak.",
      riskLevel: "Medium",
      source: "Chenab Peace Council",
      aiActionPlan: "Deploy third-party transparent volumetric sensors, host collaborative canal schedule sharing, and initiate mediation talks on joint maintenance rather than unilateral diversion.",
      timestamp: "2026-06-27T11:20:00Z"
    }
  ],
  vaultEntries: []
};

// Ensure data folder and db.json exists
function loadDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);
    if (!parsed.vaultEntries) {
      parsed.vaultEntries = [];
    }
    return parsed;
  } catch (error) {
    console.error("Error loading file db, using memory:", error);
    return initialDb;
  }
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving db to file:", error);
  }
}

function ensureVaultStorage() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
}

function generateEncryptionParams(password: string) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(password, salt, 32);
  return { salt: salt.toString("hex"), iv: iv.toString("hex"), key };
}

function encryptVaultData(data: Buffer, password: string) {
  const { salt, iv, key } = generateEncryptionParams(password);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([encrypted, authTag]),
    iv,
    salt,
    tag: authTag.toString("hex")
  };
}

function decryptVaultData(cipherBuffer: Buffer, password: string, ivHex: string, saltHex: string) {
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(password, salt, 32);
  const authTag = cipherBuffer.slice(cipherBuffer.length - 16);
  const encrypted = cipherBuffer.slice(0, cipherBuffer.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

async function uploadToIPFS(buffer: Buffer) {
  const result = await ipfs.add(buffer);
  return result.cid.toString();
}

// REST endpoints for local state
app.get("/api/dialogue", (req, res) => {
  const db = loadDb();
  res.json(db.dialogues);
});

// Post message & process with AI Moderator
app.post("/api/dialogue/:channelId/messages", async (req, res) => {
  const { channelId } = req.params;
  const { user, text, community } = req.body;

  if (!user || !text || !community) {
    return res.status(400).json({ error: "Missing required fields: user, text, community" });
  }

  const db = loadDb();
  const channel = db.dialogues.find((c: any) => c.id === channelId);

  if (!channel) {
    return res.status(404).json({ error: "Dialogue channel not found" });
  }

  // Create user message
  const userMsg: {
    id: string;
    user: string;
    text: string;
    timestamp: string;
    community: string;
    wasModerated: boolean;
    deescalatedText?: string;
    translatedText?: string;
  } = {
    id: "m_" + Date.now(),
    user,
    text,
    timestamp: new Date().toISOString(),
    community,
    wasModerated: false
  };

  channel.messages.push(userMsg);

  try {
    const ai = getAI();

    // 1. Analyze if hate speech de-escalation is needed
    const moderationResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an AI Peace Moderator for HarmonyX. Analyze this inter-community message: "${text}".
      If the message contains inflammatory, hateful, sectarian, or angry language, rewrite it into a polite, human-dignity respecting, bridge-building equivalent while retaining its core point (e.g., changing "Your community is selfish and stealing water" to "We are deeply concerned about the water availability in our area and wish to discuss fair distribution").
      If it is already polite or constructive, do not change it.
      Return a JSON object matching this structure:
      {
        "wasModerated": boolean,
        "deescalatedText": string (the polite rewrite, or empty if no moderation was needed)
      }
      Respond ONLY with valid JSON. Do not include markdown blocks or backticks.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    let modResult = { wasModerated: false, deescalatedText: "" };
    try {
      modResult = JSON.parse(moderationResponse.text?.trim() || "{}");
    } catch (e) {
      console.error("Failed to parse moderation JSON:", e);
    }

    if (modResult.wasModerated && modResult.deescalatedText) {
      userMsg.wasModerated = true;
      userMsg.deescalatedText = modResult.deescalatedText;
    }

    // 2. Translate if needed (e.g., English, Hindi, Urdu, Arabic, etc.)
    // For demo purposes, we automatically provide a dual translation (e.g., Urdu or Hindi depending on context, or English)
    const translationResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate this message into a dual Urdu/Hindi phonetic script (using clean Latin alphabet or local script) so cross-border participants can easily read it: "${text}".
      Return ONLY the translation string, nothing else.`
    });

    userMsg.translatedText = translationResponse.text?.trim() || "";

    // 3. Occasionally, HarmonyBot generates a helpful moderator response to keep the dialog safe and constructive
    const botDecision = Math.random() > 0.3 || channel.messages.length <= 3;
    if (botDecision) {
      const chatHistory = channel.messages.slice(-5).map((m: any) => `${m.user} (${m.community}): ${m.text}`).join("\n");
      const botResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are HarmonyBot, the neutral, compassionate, and highly intelligent de-escalator and early warning monitor in HarmonyX.
        Here is the recent dialogue history:
        ${chatHistory}

        Provide a 1-to-2 sentence warm response that builds bridges, suggests constructive questions to move dialogue forward, or offers comforting reassurance. Respect pluralism and human dignity.
        Return ONLY your direct message string. Do not prefix with "HarmonyBot:".`
      });

      const botMsg = {
        id: "m_bot_" + Date.now(),
        user: "HarmonyBot",
        text: botResponse.text?.trim() || "Let us continue focusing on what unites us as neighbors.",
        timestamp: new Date().toISOString(),
        community: "Neutral Moderator",
        isBot: true
      };
      channel.messages.push(botMsg);
    }

    saveDb(db);
    res.json(channel.messages);

  } catch (error) {
    console.error("Error processing AI moderation/translation:", error);
    // Fallback to basic saving if Gemini fails or is unconfigured
    saveDb(db);
    res.json(channel.messages);
  }
});

app.get("/api/support", (req, res) => {
  const db = loadDb();
  res.json(db.support);
});

app.post("/api/support", (req, res) => {
  const { type, title, category, location, description, contact } = req.body;
  if (!type || !title || !category || !location || !description || !contact) {
    return res.status(400).json({ error: "Missing support item fields" });
  }

  const db = loadDb();
  const newItem = {
    id: "sup_" + Date.now(),
    type,
    title,
    category,
    location,
    description,
    contact,
    timestamp: new Date().toISOString()
  };

  db.support.unshift(newItem);
  saveDb(db);
  res.json(newItem);
});

app.get("/api/vault/entries", (req, res) => {
  const db = loadDb();
  res.json(db.vaultEntries || []);
});

app.post("/api/vault/entries", async (req, res) => {
  const { title, description, docType, ownerAlias, password, fileBase64, mimeType } = req.body;
  if (!title || !description || !docType || !ownerAlias || !password || !fileBase64 || !mimeType) {
    return res.status(400).json({ error: "Missing required vault entry fields" });
  }

  try {
    const fileBuffer = Buffer.from(fileBase64, "base64");
    const encrypted = encryptVaultData(fileBuffer, password);
    const cid = await uploadToIPFS(encrypted.encrypted);

    const db = loadDb();
    const newEntry = {
      id: "vault_" + Date.now(),
      title,
      description,
      docType,
      ownerAlias,
      cid,
      mimeType,
      iv: encrypted.iv,
      salt: encrypted.salt,
      tag: encrypted.tag,
      createdAt: new Date().toISOString()
    };

    if (!db.vaultEntries) {
      db.vaultEntries = [];
    }
    db.vaultEntries.unshift(newEntry);
    saveDb(db);
    res.json(newEntry);
  } catch (error) {
    console.error("Vault upload failed:", error);
    res.status(500).json({ error: "Failed to encrypt and store vault document" });
  }
});

app.post("/api/vault/retrieve", async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: "Missing vault retrieval fields" });
  }

  try {
    const db = loadDb();
    const entry = (db.vaultEntries || []).find((item: any) => item.id === id);
    if (!entry) {
      return res.status(404).json({ error: "Vault entry not found" });
    }

    const stream = ipfs.cat(entry.cid);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const encryptedBuffer = Buffer.concat(chunks);
    const decryptedBuffer = decryptVaultData(encryptedBuffer, password, entry.iv, entry.salt);

    res.json({
      fileBase64: decryptedBuffer.toString("base64"),
      mimeType: entry.mimeType,
      title: entry.title
    });
  } catch (error) {
    console.error("Vault retrieval failed:", error);
    res.status(500).json({ error: "Failed to retrieve or decrypt vault document. Check password and CID." });
  }
});

app.get("/api/memories", (req, res) => {
  const db = loadDb();
  res.json(db.memories);
});

app.post("/api/memories", (req, res) => {
  const { title, author, location, text, tag } = req.body;
  if (!title || !author || !location || !text || !tag) {
    return res.status(400).json({ error: "Missing testimony fields" });
  }

  const db = loadDb();
  const newMemory = {
    id: "mem_" + Date.now(),
    title,
    author,
    location,
    text,
    timestamp: new Date().toISOString(),
    tag
  };

  db.memories.unshift(newMemory);
  saveDb(db);
  res.json(newMemory);
});

// AI Audio transcription, title, and tag generator for Memories Archive
app.post("/api/transcribe-memory", async (req, res) => {
  const { audioBase64, mimeType } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: "Missing audioBase64 data" });
  }

  try {
    const ai = getAI();
    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: audioBase64
      }
    };

    const prompt = `You are an expert audio transcriber and analyzer for the HarmonyX Peace Archive (06 SHANTI).
    Please transcribe the accompanying audio testimony. 
    Analyze the contents of the testimony to suggest a moving title and an appropriate categorization tag.
    
    Return a JSON object conforming exactly to this schema:
    {
      "transcription": "Verbatim transcription of the spoken audio testimony in its original language. If the audio is not in English, provide both the original language and its English translation if possible.",
      "suggestedTitle": "A moving, respectful 3-to-6 word title that highlights peace, pluralism, reconciliation, or human dignity based on the voice testimony.",
      "suggestedTag": "Shared Heritage" | "Reconciliation" | "Peacebuilding" | "Displaced Support" | "Human Dignity"
    }
    
    If there is no clear audible speech in the audio, please return:
    {
      "transcription": "No clear audible speech could be transcribed. Please feel free to type your testimony manually.",
      "suggestedTitle": "Recorded Voice Testimony",
      "suggestedTag": "Peacebuilding"
    }
    
    Respond ONLY with valid JSON. Do not include markdown blocks or backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [audioPart, prompt],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);

  } catch (error) {
    console.error("Audio transcription failed:", error);
    res.status(500).json({ error: "Failed to transcribe audio. Please verify your microphone and try again." });
  }
});

// Gamified crowd-sourced fact-check quiz
const quizPool = [
  {
    id: "quiz-1",
    claim: "A recent report claims that the upstream canal closure was intentionally ordered by border forces to harm farmers downstream.",
    category: "Water Security",
    correctOption: "Misleading / Out of Context",
    explanation: "No official evidence confirms an intentional closure for damage; the language matches an exaggerated narrative often used to fuel local anger.",
  },
  {
    id: "quiz-2",
    claim: "An audio forward claimed foreign nationals were intentionally spreading disease through local markets.",
    category: "Health Misinformation",
    correctOption: "False / Propaganda",
    explanation: "There is no epidemiological evidence supporting this claim; it is an inflammatory rumor that scapegoats vulnerable groups.",
  }
];

app.post("/api/quiz-answer", (req, res) => {
  const { quizId, answer } = req.body;
  const item = quizPool.find((q) => q.id === quizId);
  if (!item || !answer) {
    return res.status(400).json({ error: "Missing quiz item or answer." });
  }

  const correct = item.correctOption === answer;
  const pointsEarned = correct ? 35 : 5;

  res.json({
    correct,
    selectedOption: answer,
    correctOption: item.correctOption,
    explanation: item.explanation,
    pointsEarned,
  });
});

app.post("/api/analyze-audio-hate", async (req, res) => {
  const { audioBase64, mimeType } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: "Missing audioBase64 data" });
  }

  try {
    const ai = getAI();
    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: audioBase64
      }
    };

    const prompt = `You are a dialect-aware hate speech detection specialist for HarmonyX.
    Please transcribe the audio clip, detect the dominant regional dialect or language if possible, and analyze the text for hate speech, polarization, or targeted dehumanizing content.
    Return a JSON object matching this structure exactly:
    {
      "transcription": "Full transcription of the audio.",
      "dialectDetected": "Language or dialect detected, if any.",
      "score": number,
      "intensity": "None" | "Low" | "Medium" | "High" | "Severe",
      "categories": {
        "xenophobia": number,
        "sectarianism": number,
        "dehumanizing": number,
        "incitement": number
      },
      "analysis": "Brief explanation of the hate speech or harmful language detected.",
      "counterNarrative": "A de-escalating, dignity-preserving counter-narrative.",
      "suggestedAlternative": "A safer, constructive way to express the same concern without targeting groups."
    }
    Respond ONLY with valid JSON. Do not include markdown blocks or backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [audioPart, prompt],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error) {
    console.error("Audio hate speech scan failed:", error);
    res.status(500).json({ error: "Failed to analyze audio for hate speech." });
  }
});

app.get("/api/alerts", (req, res) => {
  const db = loadDb();
  res.json(db.alerts);
});

// Early warning submission analyzes threat and creates mitigation steps via AI
app.post("/api/alerts", async (req, res) => {
  const { category, region, description, source } = req.body;
  if (!category || !region || !description || !source) {
    return res.status(400).json({ error: "Missing required alert fields" });
  }

  try {
    const ai = getAI();
    const prompt = `Analyze this security, humanitarian, or misinformation early warning signal submitted by a local sentinel observer:
    Category: ${category}
    Region: ${region}
    Reporter: ${source}
    Report: "${description}"

    Evaluate the threat level and formulate a custom "Preventative Diplomacy and De-escalation Action Plan" to prevent outbreaks of violence, counter sectarian division, or aid the displaced.
    Return a JSON response matching:
    {
      "riskLevel": "High" | "Medium" | "Low",
      "aiActionPlan": "A concise, 2-sentence highly actionable plan for civil society leaders, NGOs, or local groups to defuse the tension."
    }
    Respond ONLY with valid JSON. Do not include markdown backticks.`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let aiResult = { riskLevel: "Medium", aiActionPlan: "Promote local dialogue and verify coordinates." };
    try {
      aiResult = JSON.parse(aiResponse.text?.trim() || "{}");
    } catch (e) {
      console.error("Error parsing Gemini early warning JSON:", e);
    }

    const db = loadDb();
    const newAlert = {
      id: "alt_" + Date.now(),
      category,
      region,
      description,
      riskLevel: aiResult.riskLevel || "Medium",
      source,
      aiActionPlan: aiResult.aiActionPlan,
      timestamp: new Date().toISOString()
    };

    db.alerts.unshift(newAlert);
    saveDb(db);
    res.json(newAlert);

  } catch (error) {
    console.error("Gemini failed for early warning:", error);
    // Fallback save
    const db = loadDb();
    const newAlert = {
      id: "alt_" + Date.now(),
      category,
      region,
      description,
      riskLevel: "Medium" as const,
      source,
      aiActionPlan: "Investigate coordinates and engage local neutral mediators to prevent regional escalation.",
      timestamp: new Date().toISOString()
    };
    db.alerts.unshift(newAlert);
    saveDb(db);
    res.json(newAlert);
  }
});

// AI hate speech & text de-escalation scanner
app.post("/api/analyze-hate", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text to analyze" });
  }

  try {
    const ai = getAI();
    const prompt = `Analyze this text for hate speech, misinformation markers, and polarization index: "${text}".
    Return a detailed JSON evaluation. Be objective and prioritize human dignity, peacebuilding, and bridge-building.
    Return a JSON object conforming exactly to this schema:
    {
      "score": number (0 to 100, where 100 is severe incitement/hate speech),
      "intensity": "None" | "Low" | "Medium" | "High" | "Severe",
      "categories": {
        "xenophobia": number (0-100),
        "sectarianism": number (0-100),
        "dehumanizing": number (0-100),
        "incitement": number (0-100)
      },
      "analysis": "A concise 1-2 sentence explanation of the linguistic cues, dogwhistles, or aggressive terms used.",
      "counterNarrative": "A peaceful counter-narrative or factual grounding statement that counters this hate speech.",
      "suggestedAlternative": "How the user could express their grievance or view politely and constructively without attacking human dignity."
    }
    Respond ONLY with valid JSON. Do not include markdown backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);

  } catch (error) {
    console.error("Hate speech scan failed:", error);
    res.status(500).json({ error: "Gemini analysis failed" });
  }
});

// AI claim verification (rumors & propaganda check)
app.post("/api/verify-truth", async (req, res) => {
  const { claim } = req.body;
  if (!claim) {
    return res.status(400).json({ error: "Missing claim to verify" });
  }

  try {
    const ai = getAI();
    const prompt = `Verify this rumor, claim, or news item circulating in conflict/border zones: "${claim}".
    Evaluate it using critical verification and factual checking.
    Return a JSON object conforming exactly to this schema:
    {
      "truthScore": number (0 to 100, where 100 is fully true, verified),
      "verdict": "Fully Verified" | "Mostly True" | "Misleading / Out of Context" | "False / Propaganda" | "Unverified Rumor",
      "analysis": "A 2-sentence deep objective evaluation of the rumor's source, typical motives, and factual inaccuracies.",
      "evidence": [
        "A piece of objective verified evidence or logical proof",
        "Another corroborating fact or official verification source"
      ],
      "context": "Historical, geographical, or community context that de-escalates the panic caused by this claim."
    }
    Respond ONLY with valid JSON. Do not include markdown backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);

  } catch (error) {
    console.error("Fact check failed:", error);
    res.status(500).json({ error: "Gemini fact check failed" });
  }
});

// Refugee & displaced person assistant (translates forms, drafts, provides advice)
app.post("/api/assist-displaced", async (req, res) => {
  const { text, category, targetLanguage } = req.body;
  if (!text || !category) {
    return res.status(400).json({ error: "Missing required assistant fields" });
  }

  try {
    const ai = getAI();
    const prompt = `You are the Beacon Connection AI Assistant for displaced persons and refugees.
    The user is asking for assistance with:
    Category: ${category} (e.g. Legal, Language, Housing, Medical)
    User message/input: "${text}"
    Target host language/dialect requested: ${targetLanguage || "English"}

    Help the user. Translate their input if it is in another language, draft a highly polite and clear official letter, application, or request in the target language (${targetLanguage}), provide an objective explanation, and list 3 helpful resources or community action steps they can take.
    Return a JSON object conforming exactly to this schema:
    {
      "translatedText": "The translation of their text into the host language, or clear translation of requirements",
      "explanation": "A gentle, clear explanation of how this legal/host system works in simple terms",
      "draftedResponse": "A formal, polite letter or application draft ready for the user to copy and use",
      "resources": [
        "Resource 1: Actionable advice, NGO, or standard community center coordinate",
        "Resource 2: Another standard civil support recommendation",
        "Resource 3: Practical recommendation"
      ]
    }
    Respond ONLY with valid JSON. Do not include markdown backticks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);

  } catch (error) {
    console.error("Refugee assistant failed:", error);
    res.status(500).json({ error: "Gemini assistant failed" });
  }
});

// Serve Vite frontend in development, built assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HarmonyX server running on port ${PORT}`);
  });
}

startServer();
