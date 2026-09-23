const API_BASE = "/api"

export async function analyzeContent(payload) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || "Analysis request failed.")
  }
  return response.json()
}

export async function fetchHistory() {
  const response = await fetch(`${API_BASE}/history`)
  if (!response.ok) {
    throw new Error("Failed to load history.")
  }
  return response.json()
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE}/stats`)
  if (!response.ok) {
    throw new Error("Failed to load statistics.")
  }
  return response.json()
}

export async function fetchSamples() {
  const response = await fetch(`${API_BASE}/samples`)
  if (!response.ok) {
    throw new Error("Failed to load sample cases.")
  }
  return response.json()
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health`)
  return response.json()
}
