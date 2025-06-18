import type { ApiPreset } from "@/types/model-config"

const PRESETS_STORAGE_KEY = "ml-model-api-presets"

export function getApiPresets(): ApiPreset[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : getDefaultPresets()
  } catch (error) {
    console.error("Error loading API presets:", error)
    return getDefaultPresets()
  }
}

export function saveApiPresets(presets: ApiPreset[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
  } catch (error) {
    console.error("Error saving API presets:", error)
  }
}

export function addApiPreset(preset: Omit<ApiPreset, "id" | "createdAt">): ApiPreset {
  const newPreset: ApiPreset = {
    ...preset,
    id: `preset-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  const presets = getApiPresets()
  const updatedPresets = [...presets, newPreset]
  saveApiPresets(updatedPresets)

  return newPreset
}

export function updateApiPreset(id: string, updates: Partial<ApiPreset>): void {
  const presets = getApiPresets()
  const updatedPresets = presets.map((preset) => (preset.id === id ? { ...preset, ...updates } : preset))
  saveApiPresets(updatedPresets)
}

export function deleteApiPreset(id: string): void {
  const presets = getApiPresets()
  const updatedPresets = presets.filter((preset) => preset.id !== id)
  saveApiPresets(updatedPresets)
}

function getDefaultPresets(): ApiPreset[] {
  return [
    {
      id: "local-dev",
      name: "Local Development",
      endpoint: "http://localhost:5000",
      method: "POST",
      description: "Local Flask development server",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ngrok-tunnel",
      name: "Ngrok Tunnel",
      endpoint: "https://your-tunnel.ngrok-free.app",
      method: "POST",
      description: "Ngrok tunnel for local development",
      createdAt: new Date().toISOString(),
    },
    {
      id: "production-api",
      name: "Production API",
      endpoint: "https://api.yourcompany.com",
      method: "POST",
      description: "Production ML API endpoint",
      createdAt: new Date().toISOString(),
    },
  ]
}
