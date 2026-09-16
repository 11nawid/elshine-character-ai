import type { Attachment, Memory } from "../../types";

/** Compresses an image file into a JPEG data URL, preserving aspect ratio. */
export function compressImageFile(file: File, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Resolves an attachment URL (local:// keys read from localStorage). */
export function getAttachmentDataUrl(attachment?: Attachment): string | null {
  if (!attachment || !attachment.url) return null;
  if (attachment.url.startsWith("local://")) {
    const key = attachment.url.replace("local://", "");
    return localStorage.getItem(key);
  }
  if (attachment.url.startsWith("data:") || attachment.url.startsWith("http")) {
    return attachment.url;
  }
  return null;
}

/** Converts an app message into the payload shape consumed by the AI endpoint. */
export function formatMessageForAI(m: { role: string; text: string; attachment?: Attachment }) {
  if (m.attachment && m.attachment.type === "image") {
    const dataUrl = getAttachmentDataUrl(m.attachment);
    if (dataUrl) {
      return {
        role: m.role,
        content: [
          { type: "text", text: m.text || "Here is an image:" },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      };
    }
  }

  return {
    role: m.role,
    content: m.attachment && m.attachment.type !== "image"
      ? `${m.text} [Attachment: ${m.attachment.name}]`
      : m.text,
  };
}

const REFUSAL_PHRASES = [
  "system instruction violation",
  "temporarily restricted",
  "non-conversational ai formats",
  "non-conversational ai",
  "system prompt block",
  "why'd you send me a system prompt",
  "break my brain today",
  "cannot engage in role-play",
  "cannot participate in role-play",
  "cannot engage in",
  "adopting a false personal identity",
  "false personal identity",
  "as gemini",
  "i am gemini",
  "as an ai",
  "large language model",
  "cannot adopt a persona",
  "assist you with poetry, philosophy",
];

export function isRefusalText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return REFUSAL_PHRASES.some((phrase) => lower.includes(phrase));
}

/** Strips leaked "[System ...]" headers from AI output for clean display. */
export function cleanDisplayContent(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[System instruction violation[^\]]*\]/gi, "")
    .replace(/\[System message[^\]]*\]/gi, "")
    .replace(/\[System[^\]]*\]/gi, "")
    .trim();
}

export function createMemoryItem(text: string): Memory {
  return {
    id: Math.random().toString(36).substring(7),
    text: text.trim(),
    createdAt: Date.now(),
  };
}

export function attachmentLabel(attachment: Attachment, text: string): string {
  const prefix = attachment.type === "image" ? "Image" : "File";
  return `[${prefix}] ${text}`.trim();
}