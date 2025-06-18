"use client"

import type { ModelConfig } from "@/types/model-config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ModelSelectorProps {
  models: ModelConfig[]
  selectedModel: ModelConfig
  onModelSelect: (model: ModelConfig) => void
}

export function ModelSelector({ models, selectedModel, onModelSelect }: ModelSelectorProps) {
  const getModelTypeBadgeColor = (type: string) => {
    switch (type) {
      case "regression":
        return "bg-blue-100 text-blue-800"
      case "classification":
        return "bg-green-100 text-green-800"
      case "image_classification":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Select
          value={selectedModel.id}
          onValueChange={(value) => {
            const model = models.find((m) => m.id === value)
            if (model) onModelSelect(model)
          }}
        >
          <SelectTrigger className="w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2">
                  <span>{model.name}</span>
                  <Badge className={getModelTypeBadgeColor(model.type)}>{model.type.replace("_", " ")}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{selectedModel.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{selectedModel.purpose}</p>
        <p className="text-xs text-muted-foreground">{selectedModel.description}</p>
      </div>
    </div>
  )
}
