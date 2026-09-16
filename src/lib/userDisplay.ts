/**
 * Real-data display helpers. These never invent fabricated names — they fall
 * back to the auth provider's email local-part (real data) instead of generic
 * placeholders like "Explorer" or "Traveler".
 */

function emailLocalPart(email?: string | null): string {
  if (!email) return "";
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

/** Real display name, falling back to the email prefix when the provider has no name. */
export function realName(name?: string | null, email?: string | null): string {
  const trimmed = name?.trim();
  return trimmed || emailLocalPart(email);
}

/** A stable handle derived from permanent nickname or real data (display name or email prefix). */
export function realUsername(name?: string | null, email?: string | null, nickname?: string | null): string {
  if (nickname?.trim()) {
    return nickname.trim().replace(/^@/, '');
  }
  const base = (name?.trim() || emailLocalPart(email)).toLowerCase();
  const slug = base.replace(/[^a-z0-9_]+/g, "").replace(/^([0-9]+)/, "");
  return slug || base || "user";
}