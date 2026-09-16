import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function resolveServiceAccountJson(): string | null {
  const envVal = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envVal) {
    return envVal.startsWith("{") ? envVal : Buffer.from(envVal, "base64").toString("utf8");
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8");
  }

  try {
    const keysDir = path.join(process.cwd(), "private-keys");
    const candidate = readdirSync(keysDir)
      .filter((f) => f.endsWith(".json") && !f.startsWith("."))
      .map((f) => path.join(keysDir, f))
      .find((file) => {
        try {
          const raw = JSON.parse(readFileSync(file, "utf8"));
          return raw?.type === "service_account" && !!raw?.private_key;
        } catch {
          return false;
        }
      });
    if (candidate) {
      return readFileSync(candidate, "utf8");
    }
  } catch {
    // no private-keys directory
  }

  return null;
}

function createAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = resolveServiceAccountJson();
  if (serviceAccount) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(serviceAccount);
    } catch (error: any) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${error?.message || error}`);
    }
    return initializeApp({ credential: cert(parsed as any) });
  }

  throw new Error(
    "No Firebase service account found. Set FIREBASE_SERVICE_ACCOUNT (JSON or base64), GOOGLE_APPLICATION_CREDENTIALS, or place the key file in private-keys/."
  );
}

export const admin = createAdminApp();
export const db = process.env.FIRESTORE_DATABASE_ID
  ? getFirestore(admin, process.env.FIRESTORE_DATABASE_ID)
  : getFirestore(admin);
export const auth = getAuth(admin);