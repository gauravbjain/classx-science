/**
 * A challenge is a fixed set of quiz questions encoded entirely inside a URL —
 * no server, no accounts. `s` = subject slug, `t` = title, `q` = [chapterSlug, quizIndex] pairs.
 */
export type ChallengeSpec = { s: string; t: string; q: [string, number][] };

function toB64(json: string): string {
  const b64 = typeof window === "undefined"
    ? Buffer.from(json, "utf8").toString("base64")
    : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64(code: string): string {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window === "undefined"
    ? Buffer.from(b64, "base64").toString("utf8")
    : decodeURIComponent(escape(atob(b64)));
}

export function encodeChallenge(spec: ChallengeSpec): string {
  return toB64(JSON.stringify(spec));
}

export function decodeChallenge(code: string): ChallengeSpec | null {
  try {
    const o = JSON.parse(fromB64(code));
    if (!o || typeof o.s !== "string" || !Array.isArray(o.q)) return null;
    return { s: o.s, t: typeof o.t === "string" ? o.t : "Challenge", q: o.q };
  } catch {
    return null;
  }
}
