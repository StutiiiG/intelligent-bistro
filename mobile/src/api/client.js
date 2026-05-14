// Tiny fetch wrapper for the Intelligent Bistro backend.

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export function sendChat({ message, cart, history }) {
  return postJson("/api/chat", { message, cart, history });
}

export function fetchPairings(cart) {
  return postJson("/api/pairings", { cart });
}

export function fetchChefPick(prompt = "") {
  return postJson("/api/chef-pick", { prompt });
}

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
