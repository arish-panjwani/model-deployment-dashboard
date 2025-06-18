"use client"

import type React from "react"

import { useState } from "react"
import type { ModelConfig } from "@/types/model-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { buildGetUrl } from "@/utils/api"
import { Loader2, Upload, Globe } from "lucide-react"

interface EnhancedModelInputFormProps {
  model: ModelConfig
  onSubmit: (data: any) => void
  isLoading: boolean
  method: "GET" | "POST"
}

export function EnhancedModelInputForm({ model, onSubmit, isLoading, method }: EnhancedModelInputFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFormData((prev) => ({ ...prev, image: file }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format data for API call
    const apiData = { ...formData }

    // Convert file inputs to base64 or handle appropriately
    if (selectedFile && model.type === "image_classification") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        apiData.image = base64
        onSubmit(apiData)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      // Remove any undefined or empty values
      Object.keys(apiData).forEach((key) => {
        if (apiData[key] === undefined || apiData[key] === "") {
          delete apiData[key]
        }
      })

      onSubmit(apiData)
    }
  }

  const getPreviewUrl = () => {
    if (method === "GET" && Object.keys(formData).length > 0) {
      try {
        return buildGetUrl(model.endpoint, formData)
      } catch {
        return "Invalid data for URL"
      }
    }
    return null
  }

  const renderInput = (input: any) => {
    switch (input.type) {
      case "number":
        return (
          <Input
            type="number"
            value={formData[input.name] ?? ""}
            onChange={(e) =>
              handleInputChange(input.name, e.target.value === "" ? "" : Number.parseFloat(e.target.value))
            }
            placeholder={input.placeholder}
            required={input.required}
          />
        )
      case "textarea":
        return (
          <Textarea
            value={formData[input.name] || ""}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
            placeholder={input.placeholder}
            required={input.required}
            rows={4}
          />
        )
      case "file":
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or JPEG</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept={input.accept}
                  onChange={handleFileChange}
                  required={input.required}
                />
              </label>
            </div>
            {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          </div>
        )
      default:
        return (
          <Input
            value={formData[input.name] || ""}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
            placeholder={input.placeholder}
            required={input.required}
          />
        )
    }
  }

  const previewUrl = getPreviewUrl()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline">{method}</Badge>
        <span className="text-sm text-muted-foreground">Request Method</span>
      </div>

      {previewUrl && (
        <div className="space-y-2">
          <Label>GET URL Preview</Label>
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <code className="text-sm break-all">{previewUrl}</code>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {model.inputs.map((input) => (
          <div key={input.name} className="space-y-2">
            <Label htmlFor={input.name}>
              {input.label}
              {input.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderInput(input)}
          </div>
        ))}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Send ${method} Request`
          )}
        </Button>
      </form>
    </div>
  )
}
