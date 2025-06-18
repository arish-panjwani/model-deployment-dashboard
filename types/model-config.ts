export interface ModelInput {
  name: string
  label: string
  type: "text" | "number" | "textarea" | "file"
  required: boolean
  placeholder?: string
  accept?: string
}

export interface ModelCapabilities {
  inputFormat: string
  outputFormat: string
  metrics: string[]
  supportedFormats: string[]
}

export interface UsageStats {
  month: string
  calls: number
}

export interface ApiPreset {
  id: string
  name: string
  endpoint: string
  method: "GET" | "POST"
  description?: string
  createdAt: string
}

export interface ModelConfig {
  id: string
  name: string
  purpose: string
  type: "regression" | "classification" | "image_classification"
  capabilities: ModelCapabilities
  endpoint: string
  description: string
  inputs: ModelInput[]
  defaultStats: Record<string, any>
  usageStats: UsageStats[]
  createdAt: string
  updatedAt: string
  apiPresets?: ApiPreset[]
}
