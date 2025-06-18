"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { ModelConfig, ModelInput } from "@/types/model-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, X } from "lucide-react"

interface ModelFormProps {
  initialData?: ModelConfig
  onSubmit: (data: Omit<ModelConfig, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
  isEditing?: boolean
}

export function ModelForm({ initialData, onSubmit, onCancel, isEditing = false }: ModelFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    type: "regression" as ModelConfig["type"],
    endpoint: "",
    description: "",
    capabilities: {
      inputFormat: "",
      outputFormat: "",
      metrics: [] as string[],
      supportedFormats: [] as string[],
    },
    inputs: [] as ModelInput[],
    defaultStats: {},
    usageStats: [
      { month: "Jan", calls: 0 },
      { month: "Feb", calls: 0 },
      { month: "Mar", calls: 0 },
      { month: "Apr", calls: 0 },
      { month: "May", calls: 0 },
      { month: "Jun", calls: 0 },
    ],
  })

  const [newMetric, setNewMetric] = useState("")
  const [newFormat, setNewFormat] = useState("")

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        purpose: initialData.purpose,
        type: initialData.type,
        endpoint: initialData.endpoint,
        description: initialData.description,
        capabilities: initialData.capabilities,
        inputs: initialData.inputs,
        defaultStats: initialData.defaultStats,
        usageStats: initialData.usageStats,
      })
    }
  }, [initialData])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCapabilityChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: { ...prev.capabilities, [field]: value },
    }))
  }

  const addMetric = () => {
    if (newMetric.trim()) {
      handleCapabilityChange("metrics", [...formData.capabilities.metrics, newMetric.trim()])
      setNewMetric("")
    }
  }

  const removeMetric = (index: number) => {
    const updatedMetrics = formData.capabilities.metrics.filter((_, i) => i !== index)
    handleCapabilityChange("metrics", updatedMetrics)
  }

  const addFormat = () => {
    if (newFormat.trim()) {
      handleCapabilityChange("supportedFormats", [...formData.capabilities.supportedFormats, newFormat.trim()])
      setNewFormat("")
    }
  }

  const removeFormat = (index: number) => {
    const updatedFormats = formData.capabilities.supportedFormats.filter((_, i) => i !== index)
    handleCapabilityChange("supportedFormats", updatedFormats)
  }

  const addInput = () => {
    const newInput: ModelInput = {
      name: "",
      label: "",
      type: "text",
      required: false,
    }
    setFormData((prev) => ({ ...prev, inputs: [...prev.inputs, newInput] }))
  }

  const updateInput = (index: number, field: keyof ModelInput, value: any) => {
    const updatedInputs = formData.inputs.map((input, i) => (i === index ? { ...input, [field]: value } : input))
    setFormData((prev) => ({ ...prev, inputs: updatedInputs }))
  }

  const removeInput = (index: number) => {
    const updatedInputs = formData.inputs.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, inputs: updatedInputs }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure the basic details of your model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Model Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Sales Prediction API"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Model Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="image_classification">Image Classification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange("purpose", e.target.value)}
              placeholder="Brief description of what the model does"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint *</Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) => handleInputChange("endpoint", e.target.value)}
              placeholder="https://api.example.com/predict"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detailed description of the model, training data, and use cases"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Model Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Model Capabilities</CardTitle>
          <CardDescription>Define the technical capabilities and specifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inputFormat">Input Format</Label>
              <Input
                id="inputFormat"
                value={formData.capabilities.inputFormat}
                onChange={(e) => handleCapabilityChange("inputFormat", e.target.value)}
                placeholder="e.g., numeric, text, image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output Format</Label>
              <Input
                id="outputFormat"
                value={formData.capabilities.outputFormat}
                onChange={(e) => handleCapabilityChange("outputFormat", e.target.value)}
                placeholder="e.g., numeric prediction, class label"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Metrics</Label>
            <div className="flex gap-2">
              <Input
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                placeholder="Add a metric (e.g., R², Accuracy)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMetric())}
              />
              <Button type="button" onClick={addMetric} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.capabilities.metrics.map((metric, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {metric}
                  <button type="button" onClick={() => removeMetric(index)} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supported Formats</Label>
            <div className="flex gap-2">
              <Input
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value)}
                placeholder="Add a format (e.g., JSON, CSV)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFormat())}
              />
              <Button type="button" onClick={addFormat} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.capabilities.supportedFormats.map((format, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {format}
                  <button type="button" onClick={() => removeFormat(index)} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Inputs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Model Inputs</CardTitle>
              <CardDescription>Define the input fields for your model</CardDescription>
            </div>
            <Button type="button" onClick={addInput} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Input
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.inputs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No inputs defined. Click "Add Input" to get started.
            </p>
          ) : (
            formData.inputs.map((input, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Input {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInput(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field Name</Label>
                    <Input
                      value={input.name}
                      onChange={(e) => updateInput(index, "name", e.target.value)}
                      placeholder="e.g., temperature"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Label</Label>
                    <Input
                      value={input.label}
                      onChange={(e) => updateInput(index, "label", e.target.value)}
                      placeholder="e.g., Temperature (°C)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Input Type</Label>
                    <Select value={input.type} onValueChange={(value) => updateInput(index, "type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder (optional)</Label>
                    <Input
                      value={input.placeholder || ""}
                      onChange={(e) => updateInput(index, "placeholder", e.target.value)}
                      placeholder="Placeholder text"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`required-${index}`}
                    checked={input.required}
                    onCheckedChange={(checked) => updateInput(index, "required", checked)}
                  />
                  <Label htmlFor={`required-${index}`}>Required field</Label>
                </div>

                {input.type === "file" && (
                  <div className="space-y-2">
                    <Label>Accepted File Types</Label>
                    <Input
                      value={input.accept || ""}
                      onChange={(e) => updateInput(index, "accept", e.target.value)}
                      placeholder="e.g., image/*, .jpg, .png"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? "Update Model" : "Create Model"}
        </Button>
      </div>
    </form>
  )
}
