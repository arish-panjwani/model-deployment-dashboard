"use client"

import { useState, useEffect } from "react"
import type { ApiPreset } from "@/types/model-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getApiPresets, addApiPreset, updateApiPreset, deleteApiPreset } from "@/utils/presets"
import { isValidUrl } from "@/utils/api"
import { Plus, Edit, Trash2, Save, Settings, Globe, Clock, Check } from "lucide-react"

interface ApiPresetManagerProps {
  currentEndpoint: string
  currentMethod: "GET" | "POST"
  onPresetSelect: (endpoint: string, method: "GET" | "POST") => void
  onSaveAsPreset?: (endpoint: string, method: "GET" | "POST") => void
}

export function ApiPresetManager({
  currentEndpoint,
  currentMethod,
  onPresetSelect,
  onSaveAsPreset,
}: ApiPresetManagerProps) {
  const [presets, setPresets] = useState<ApiPreset[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<ApiPreset | null>(null)
  const [deletePresetId, setDeletePresetId] = useState<string | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    endpoint: "",
    method: "POST" as "GET" | "POST",
    description: "",
  })

  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = () => {
    const loadedPresets = getApiPresets()
    setPresets(loadedPresets)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      endpoint: "",
      method: "POST",
      description: "",
    })
  }

  const handleAddPreset = () => {
    if (!formData.name.trim() || !isValidUrl(formData.endpoint)) return

    addApiPreset({
      name: formData.name.trim(),
      endpoint: formData.endpoint.trim(),
      method: formData.method,
      description: formData.description.trim(),
    })

    loadPresets()
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditPreset = () => {
    if (!editingPreset || !formData.name.trim() || !isValidUrl(formData.endpoint)) return

    updateApiPreset(editingPreset.id, {
      name: formData.name.trim(),
      endpoint: formData.endpoint.trim(),
      method: formData.method,
      description: formData.description.trim(),
    })

    loadPresets()
    setEditingPreset(null)
    resetForm()
    setIsEditDialogOpen(false)
  }

  const handleDeletePreset = (id: string) => {
    deleteApiPreset(id)
    loadPresets()
    setDeletePresetId(null)
    if (selectedPresetId === id) {
      setSelectedPresetId("")
    }
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      setSelectedPresetId(presetId)
      onPresetSelect(preset.endpoint, preset.method)
    }
  }

  const handleSaveCurrentAsPreset = () => {
    setFormData({
      name: "",
      endpoint: currentEndpoint,
      method: currentMethod,
      description: "",
    })
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (preset: ApiPreset) => {
    setEditingPreset(preset)
    setFormData({
      name: preset.name,
      endpoint: preset.endpoint,
      method: preset.method,
      description: preset.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isCurrentPreset = (preset: ApiPreset) => {
    return preset.endpoint === currentEndpoint && preset.method === currentMethod
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              API Configuration Presets
            </CardTitle>
            <CardDescription>Save and manage common API endpoint configurations for quick switching</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveCurrentAsPreset}>
              <Save className="w-4 h-4 mr-2" />
              Save Current
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New API Preset</DialogTitle>
                  <DialogDescription>Create a new preset for quick access to this API configuration</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset-name">Preset Name *</Label>
                    <Input
                      id="preset-name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Production API"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="preset-endpoint">API Endpoint *</Label>
                      <Input
                        id="preset-endpoint"
                        value={formData.endpoint}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="https://api.example.com"
                        className={!isValidUrl(formData.endpoint) && formData.endpoint ? "border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preset-method">Method</Label>
                      <Select
                        value={formData.method}
                        onValueChange={(value: "GET" | "POST") => setFormData((prev) => ({ ...prev, method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="GET">GET</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preset-description">Description</Label>
                    <Textarea
                      id="preset-description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description for this preset"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPreset} disabled={!formData.name.trim() || !isValidUrl(formData.endpoint)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {presets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>No API presets saved yet.</p>
            <p className="text-sm">Create your first preset to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`p-4 border rounded-lg transition-colors ${
                  isCurrentPreset(preset) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{preset.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {preset.method}
                      </Badge>
                      {isCurrentPreset(preset) && (
                        <Badge variant="default" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Globe className="w-3 h-3" />
                      <code className="text-xs truncate">{preset.endpoint}</code>
                    </div>
                    {preset.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{preset.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" />
                      Created {formatDate(preset.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePresetSelect(preset.id)}
                      disabled={isCurrentPreset(preset)}
                    >
                      {isCurrentPreset(preset) ? "Active" : "Use"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(preset)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletePresetId(preset.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit API Preset</DialogTitle>
              <DialogDescription>Update the configuration for this API preset</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-preset-name">Preset Name *</Label>
                <Input
                  id="edit-preset-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production API"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-preset-endpoint">API Endpoint *</Label>
                  <Input
                    id="edit-preset-endpoint"
                    value={formData.endpoint}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="https://api.example.com"
                    className={!isValidUrl(formData.endpoint) && formData.endpoint ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-preset-method">Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value: "GET" | "POST") => setFormData((prev) => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-preset-description">Description</Label>
                <Textarea
                  id="edit-preset-description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this preset"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPreset} disabled={!formData.name.trim() || !isValidUrl(formData.endpoint)}>
                <Save className="w-4 h-4 mr-2" />
                Update Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletePresetId} onOpenChange={() => setDeletePresetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete API Preset</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this API preset? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletePresetId && handleDeletePreset(deletePresetId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
