"use client"

import { useState, useEffect } from "react"
import { ModelListDashboard } from "@/components/model-list-dashboard"
import { ModelForm } from "@/components/model-form"
import { IndividualModelDashboard } from "@/components/individual-model-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ModelConfig } from "@/types/model-config"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"

type View = "list" | "add" | "edit" | "individual"

export default function Home() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [currentView, setCurrentView] = useState<View>("list")
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null)
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null)

  // Load models from localStorage on mount
  useEffect(() => {
    const savedModels = localStorage.getItem("ml-models")
    if (savedModels) {
      try {
        const parsedModels = JSON.parse(savedModels)
        setModels(parsedModels)
      } catch (error) {
        console.error("Error loading models:", error)
        // Load default models if localStorage is corrupted
        setModels(getDefaultModels())
      }
    } else {
      // Load default models if none exist
      setModels(getDefaultModels())
    }
  }, [])

  // Save models to localStorage whenever models change
  useEffect(() => {
    if (models.length > 0) {
      localStorage.setItem("ml-models", JSON.stringify(models))
    }
  }, [models])

  const getDefaultModels = (): ModelConfig[] => [
    {
      id: "sales-prediction",
      name: "Sales Prediction API",
      purpose: "Predict sales based on temperature and promotions",
      type: "regression",
      capabilities: {
        inputFormat: "numeric",
        outputFormat: "numeric prediction",
        metrics: ["R²", "MSE", "RMSE", "MAE"],
        supportedFormats: ["JSON"],
      },
      endpoint: "https://api.example.com/predict/sales",
      description:
        "This model is trained for sales prediction using Linear Regression on historical sales data. It provides predictions based on temperature and promotion data and returns key model performance metrics for interpretability.",
      inputs: [
        { name: "temperature", label: "Temperature (°C)", type: "number", required: true },
        { name: "promotions", label: "Promotions", type: "number", required: true },
      ],
      defaultStats: {
        r2: 0.85,
        mse: 230.56,
        rmse: 15.19,
        mae: 10.23,
      },
      usageStats: [
        { month: "Jan", calls: 100 },
        { month: "Feb", calls: 200 },
        { month: "Mar", calls: 150 },
        { month: "Apr", calls: 180 },
        { month: "May", calls: 170 },
        { month: "Jun", calls: 160 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const handleAddModel = (modelData: Omit<ModelConfig, "id" | "createdAt" | "updatedAt">) => {
    const newModel: ModelConfig = {
      ...modelData,
      id: `model-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setModels((prev) => [...prev, newModel])
    setCurrentView("list")
  }

  const handleEditModel = (modelData: Omit<ModelConfig, "id" | "createdAt" | "updatedAt">) => {
    if (!editingModel) return

    const updatedModel: ModelConfig = {
      ...modelData,
      id: editingModel.id,
      createdAt: editingModel.createdAt,
      updatedAt: new Date().toISOString(),
    }

    setModels((prev) => prev.map((model) => (model.id === editingModel.id ? updatedModel : model)))
    setEditingModel(null)
    setCurrentView("list")
  }

  const handleDeleteModel = (modelId: string) => {
    setModels((prev) => prev.filter((model) => model.id !== modelId))
    if (selectedModel?.id === modelId) {
      setSelectedModel(null)
      setCurrentView("list")
    }
  }

  const handleViewModel = (model: ModelConfig) => {
    setSelectedModel(model)
    setCurrentView("individual")
  }

  const handleEditModelClick = (model: ModelConfig) => {
    setEditingModel(model)
    setCurrentView("edit")
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {currentView !== "list" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentView("list")
              setSelectedModel(null)
              setEditingModel(null)
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Models
          </Button>
        )}
        <div>
          <h1 className="text-4xl font-bold">ML Model Dashboard</h1>
          <p className="text-muted-foreground">
            {currentView === "list" && "Manage and monitor your machine learning models"}
            {currentView === "add" && "Add a new machine learning model"}
            {currentView === "edit" && "Edit model configuration"}
            {currentView === "individual" && selectedModel?.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {currentView === "list" && (
          <Button onClick={() => setCurrentView("add")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </Button>
        )}
        <ThemeToggle />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {renderHeader()}

        {currentView === "list" && (
          <ModelListDashboard
            models={models}
            onViewModel={handleViewModel}
            onEditModel={handleEditModelClick}
            onDeleteModel={handleDeleteModel}
          />
        )}

        {currentView === "add" && <ModelForm onSubmit={handleAddModel} onCancel={() => setCurrentView("list")} />}

        {currentView === "edit" && editingModel && (
          <ModelForm
            initialData={editingModel}
            onSubmit={handleEditModel}
            onCancel={() => {
              setEditingModel(null)
              setCurrentView("list")
            }}
            isEditing
          />
        )}

        {currentView === "individual" && selectedModel && <IndividualModelDashboard model={selectedModel} />}
      </div>
    </div>
  )
}
