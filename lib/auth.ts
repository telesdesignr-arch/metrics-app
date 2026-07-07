const COOKIE_NAME = "im_session";

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function expectedSessionValue(): Promise<string> {
  const password = process.env.APP_PASSWORD || "";
  const secret = process.env.AUTH_SECRET || "fallback-secret-change-me";
  return sha256Hex(password + secret);
}

export async function isValidSessionValue(
  value: string | undefined | null
): Promise<boolean> {
  if (!value) return false;
  const expected = await expectedSessionValue();
  return value === expected;
}

export { COOKIE_NAME };

