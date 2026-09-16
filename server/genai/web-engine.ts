import fs from "fs";
import path from "path";
import crypto from "crypto";

const DEFAULT_BL = "boq_assistant-bard-web-server_20260716.08_p0";
const REQUEST_TIMEOUT_MS = 25000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

interface WebEngineConfig {
  bl: string;
  authUser: string | null;
  xsrfToken: string | null;
  cookieFile: string | null;
  proxy: string | null;
  logRequests: boolean;
  temporaryChats: boolean;
}

let cachedConfig: WebEngineConfig | null = null;

function getConfig(): WebEngineConfig {
  if (cachedConfig) return cachedConfig;

  const config: WebEngineConfig = {
    bl: DEFAULT_BL,
    authUser: null,
    xsrfToken: null,
    cookieFile: null,
    proxy: null,
    logRequests: false,
    temporaryChats: false,
  };

  // Check config.json if present in cwd or parent
  const candidatePaths = [
    path.join(process.cwd(), "config.json"),
    path.join(process.cwd(), "..", "all-in-one-tool", "identity-creator", "config.json"),
    path.join(process.cwd(), "..", "Default Project", "gemini-free", "config.json"),
  ];

  for (const cp of candidatePaths) {
    if (fs.existsSync(cp)) {
      try {
        const raw = JSON.parse(fs.readFileSync(cp, "utf8"));
        if (raw.gemini_bl) config.bl = raw.gemini_bl;
        if (raw.auth_user !== undefined) config.authUser = raw.auth_user;
        if (raw.xsrf_token !== undefined) config.xsrfToken = raw.xsrf_token;
        if (raw.cookie_file) config.cookieFile = raw.cookie_file;
        if (raw.proxy) config.proxy = raw.proxy;
        if (raw.temporary_chats !== undefined) config.temporaryChats = Boolean(raw.temporary_chats);
        break;
      } catch {
        // Fall back to next or defaults
      }
    }
  }

  if (process.env.GEMINI_BL) config.bl = process.env.GEMINI_BL;
  if (process.env.GEMINI_AUTH_USER) config.authUser = process.env.GEMINI_AUTH_USER;
  if (process.env.GEMINI_COOKIE_FILE) config.cookieFile = process.env.GEMINI_COOKIE_FILE;
  if (process.env.GEMINI_PROXY) config.proxy = process.env.GEMINI_PROXY;

  cachedConfig = config;
  return config;
}

export function makeSapisidHash(sapisid: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash("sha1");
  hash.update(`${ts} ${sapisid} https://gemini.google.com`);
  return `SAPISIDHASH ${ts}_${hash.digest("hex")}`;
}

let cookieCache = { cookieStr: "", sapisid: null as string | null, mtime: 0 };

export function loadCookie(customPath?: string | null): { cookieStr: string; sapisid: string | null } {
  const cookieFile = customPath || getConfig().cookieFile;
  if (!cookieFile || !fs.existsSync(cookieFile)) {
    return { cookieStr: "", sapisid: null };
  }

  try {
    const mtime = fs.statSync(cookieFile).mtimeMs;
    if (mtime === cookieCache.mtime && cookieCache.cookieStr) {
      return { cookieStr: cookieCache.cookieStr, sapisid: cookieCache.sapisid };
    }

    const content = fs.readFileSync(cookieFile, "utf8").trim();
    let cookieStr = "";
    let sapisid: string | null = null;

    if (content.startsWith("{")) {
      const data = JSON.parse(content);
      cookieStr = data.cookie || "";
      sapisid = data.sapisid || "";
    } else {
      cookieStr = content;
      const pairs: Record<string, string> = {};
      cookieStr.split("; ").forEach((p) => {
        if (p.includes("=")) {
          const [key, ...val] = p.split("=");
          pairs[key.trim()] = val.join("=").trim();
        }
      });
      sapisid = pairs["SAPISID"] || "";
    }

    cookieCache = { cookieStr, sapisid: sapisid || null, mtime };
    return { cookieStr, sapisid: sapisid || null };
  } catch {
    return { cookieStr: cookieCache.cookieStr, sapisid: cookieCache.sapisid };
  }
}

export function buildHeaders(): Record<string, string> {
  const config = getConfig();
  const accountPrefix = config.authUser ? `/u/${config.authUser}` : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Origin: "https://gemini.google.com",
    Referer: `https://gemini.google.com${accountPrefix}/app`,
    "X-Same-Domain": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  };

  if (config.authUser) {
    headers["X-Goog-AuthUser"] = String(config.authUser);
  }

  const { cookieStr, sapisid } = loadCookie();
  if (cookieStr) headers["Cookie"] = cookieStr;
  if (sapisid) headers["Authorization"] = makeSapisidHash(sapisid);

  return headers;
}

export function buildPayload(
  prompt: string,
  modelId: number = 1,
  thinkMode: number = 4
): string {
  const config = getConfig();
  const inner = new Array(102).fill(null);
  inner[0] = [prompt, 0, null, null, null, null, 0];
  inner[1] = ["en"];
  inner[2] = ["", "", "", null, null, null, null, null, null, ""];
  inner[6] = [0];
  inner[7] = 1;
  inner[10] = 1;
  inner[11] = 0;
  inner[17] = [[thinkMode]];
  inner[18] = 0;
  inner[27] = 1;
  inner[30] = [4];

  if (config.temporaryChats) {
    inner[41] = [1];
    inner[45] = 1;
  } else {
    inner[41] = [2];
  }

  inner[53] = 0;
  inner[59] = crypto.randomUUID();
  inner[61] = [];
  inner[68] = 1;
  inner[79] = modelId;

  const outer = [null, JSON.stringify(inner)];
  const params = new URLSearchParams();
  params.append("f.req", JSON.stringify(outer));

  if (config.xsrfToken) {
    params.append("at", config.xsrfToken);
  }

  return params.toString();
}

export function cleanText(text: string): string {
  let cleaned = text;

  // Strip code execution metadata & card URLs
  cleaned = cleaned.replace(/```(?:python|javascript|text)\?code_(?:reference|stdout)&code_event_index=\d+\n[\s\S]*?```\n?/g, "");
  cleaned = cleaned.replace(/http:\/\/googleusercontent\.com\/card_content\/\d+\n?/g, "");

  // Transform <Step ...> into clean markdown headers
  cleaned = cleaned.replace(/<Step\b(?:\s+subtitle="([^"]*)")?\s+title="([^"]*)"[^>]*>/gi, (_m, sub, title) => {
    return sub ? `\n### ${sub}: ${title}\n` : `\n### ${title}\n`;
  });
  cleaned = cleaned.replace(/<Step\b\s+title="([^"]*)"(?:\s+subtitle="([^"]*)")?[^>]*>/gi, (_m, title, sub) => {
    return sub ? `\n### ${sub}: ${title}\n` : `\n### ${title}\n`;
  });

  // Strip Gemini container/wrapper tags
  cleaned = cleaned.replace(/<\/?(?:Sequence|Step|ElicitationsGroup|Elicitation|FollowUp|Image|ContextualQuery)[^>]*>/gi, "");

  // Strip trailing blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

export function extractResponseText(raw: string): string {
  const bardErrMatch = raw.match(/BardErrorInfo\s*\[(\d+)\]/);
  if (bardErrMatch) {
    throw new Error(`Gemini upstream rejected request: BardErrorInfo [${bardErrMatch[1]}]`);
  }

  let lastText = "";
  const lines = raw.split("\n");
  for (const line of lines) {
    if (!line.includes('"wrb.fr"')) continue;
    try {
      const jsonStart = line.indexOf("[[");
      if (jsonStart === -1) continue;
      const arr = JSON.parse(line.slice(jsonStart));
      const innerStr = arr[0]?.[2];
      if (!innerStr || innerStr.length < 50) continue;
      const inner = JSON.parse(innerStr);
      if (!Array.isArray(inner) || inner.length <= 4 || !inner[4]) continue;

      for (const part of inner[4]) {
        if (Array.isArray(part) && part.length > 1 && part[1] && Array.isArray(part[1])) {
          for (const t of part[1]) {
            if (typeof t === "string" && t.length > lastText.length) {
              lastText = t;
            }
          }
        }
      }
    } catch {
      // Continue to next line
    }
  }

  return cleanText(lastText);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const WEB_MODEL_CANDIDATES = [
  { name: "Flash", modelId: 1, thinkMode: 4 },
  { name: "Auto", modelId: 4, thinkMode: 4 },
  { name: "Lite", modelId: 6, thinkMode: 4 },
  { name: "Thinking", modelId: 2, thinkMode: 0 },
];

/**
 * Executes a text generation call through the free unlimited Gemini web service.
 */
export async function generateWeb(
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  const config = getConfig();
  const headers = buildHeaders();

  for (const candidate of WEB_MODEL_CANDIDATES) {
    if (signal?.aborted) throw new Error("Request aborted");

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      if (signal?.aborted) throw new Error("Request aborted");

      try {
        const reqid = Math.floor(Date.now() / 1000) % 1000000;
        const accountPrefix = config.authUser ? `/u/${config.authUser}` : "";
        const url = `https://gemini.google.com${accountPrefix}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=${config.bl}&hl=en&_reqid=${reqid}&rt=c`;

        const body = buildPayload(prompt, candidate.modelId, candidate.thinkMode);

        const response = await fetch(url, {
          method: "POST",
          headers,
          body,
          signal: signal || AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const raw = await response.text();
        const text = extractResponseText(raw);
        if (text && text.length > 0) {
          return text;
        }
      } catch (err: any) {
        if (signal?.aborted || err?.name === "AbortError") throw err;
        if (attempt < RETRY_ATTEMPTS - 1) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }
  }

  return "";
}

/**
 * Extracts memories using the free Gemini web service.
 */
export async function extractWebMemories(
  convoText: string,
  signal?: AbortSignal
): Promise<string[]> {
  const prompt = `You are a background memory extraction engine. Read the conversation below and extract concise facts, preferences, relationships, occupation, location, and details about the human user.
Output MUST be a JSON object with format: {"memories": ["fact 1", "fact 2"]}.
If no facts are found, output {"memories": []}. Output ONLY valid raw JSON without markdown formatting.

Conversation:
${convoText}

JSON:`;

  try {
    const raw = await generateWeb(prompt, signal);
    if (!raw) return [];
    let cleaned = raw;
    if (cleaned.includes("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/im, "").replace(/```\s*$/im, "");
      cleaned = cleaned.replace(/```[a-z]*/gi, "").replace(/```/g, "");
    }
    const parsed = JSON.parse(cleaned.trim());
    if (Array.isArray(parsed?.memories)) {
      return parsed.memories.filter((m: any) => typeof m === "string" && m.trim().length > 3);
    }
  } catch {
    // Fall back to empty array
  }
  return [];
}
