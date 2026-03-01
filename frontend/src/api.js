const BASE = "http://localhost:5000";

async function j(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export async function submitApplication(payload) {
  const res = await fetch(`${BASE}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return j(res);
}

export async function seedRules() {
  const res = await fetch(`${BASE}/api/rules/seed`, { method: "POST" });
  return j(res);
}

export async function listRules() {
  const res = await fetch(`${BASE}/api/rules`);
  return j(res);
}

export async function createRule(payload) {
  const res = await fetch(`${BASE}/api/rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return j(res);
}

export async function updateRule(id, payload) {
  const res = await fetch(`${BASE}/api/rules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return j(res);
}

export async function deleteRule(id) {
  const res = await fetch(`${BASE}/api/rules/${id}`, { method: "DELETE" });
  return j(res);
}

export async function getStats() {
  const res = await fetch(`${BASE}/api/stats`);
  return j(res);
}
