"use client"

import { useState } from "react"
import type { ModelConfig } from "@/types/model-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { EnhancedModelInputForm } from "./enhanced-model-input-form"
import { ModelMetrics } from "./model-metrics"
import { PredictionResults } from "./prediction-results"
import { ApiPresetManager } from "./api-preset-manager"
import { callApi, buildApiUrl, isValidUrl } from "@/utils/api"
import { BarChart3, Settings, TrendingUp, Globe, Edit, Save, X } from "lucide-react"

interface EnhancedIndividualModelDashboardProps {
  model: ModelConfig
  onModelUpdate?: (updatedModel: ModelConfig) => void
}

export function EnhancedIndividualModelDashboard({ model, onModelUpdate }: EnhancedIndividualModelDashboardProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditingEndpoint, setIsEditingEndpoint] = useState(false)
  const [tempEndpoint, setTempEndpoint] = useState(model.endpoint)
  const [tempMethod, setTempMethod] = useState<"GET" | "POST">("POST")
  const [latestMetrics, setLatestMetrics] = useState<any>(null)

  const handlePrediction = async (inputData: any) => {
    setIsLoading(true)
    try {
      const result = await callApi(tempEndpoint, {
        method: tempMethod,
        data: inputData,
      })

      if (result.success) {
        // Map API response to prediction format based on model type
        let mappedPrediction
        switch (model.type) {
          case "regression":
            mappedPrediction = {
              prediction: result.data.predicted_sales || result.data.prediction || result.data.value,
              confidence: result.data.confidence || result.data.model_metrics?.r2 || 0.85,
              metrics: {
                r2: result.data.model_metrics?.r2 || model.defaultStats.r2,
                mse: result.data.model_metrics?.mse || model.defaultStats.mse,
                rmse: result.data.model_metrics?.rmse || model.defaultStats.rmse,
                mae: result.data.model_metrics?.mae || model.defaultStats.mae,
                coefficients: result.data.model_metrics?.coefficients,
                intercept: result.data.model_metrics?.intercept,
              },
              rawResponse: result.data,
            }
            setLatestMetrics(mappedPrediction.metrics)
            break

          case "classification":
            if (result.data.probabilities) {
              mappedPrediction = {
                prediction: result.data.prediction || result.data.predicted_class,
                probabilities: result.data.probabilities,
                confidence: Math.max(...Object.values(result.data.probabilities)),
                metrics: result.data.model_metrics || model.defaultStats,
                rawResponse: result.data,
              }
            } else {
              mappedPrediction = {
                prediction: result.data.prediction || result.data.predicted_class,
                probabilities: [
                  { label: result.data.prediction || "positive", probability: result.data.confidence || 0.85 },
                ],
                confidence: result.data.confidence || 0.85,
                metrics: result.data.model_metrics || model.defaultStats,
                rawResponse: result.data,
              }
            }
            setLatestMetrics(mappedPrediction.metrics)
            break

          case "image_classification":
            mappedPrediction = {
              prediction: result.data.prediction || result.data.predicted_class,
              probabilities: result.data.probabilities || result.data.class_probabilities || [],
              confidence:
                result.data.confidence || Math.max(...(result.data.probabilities?.map((p) => p.probability) || [0.85])),
              metrics: result.data.model_metrics || model.defaultStats,
              rawResponse: result.data,
            }
            setLatestMetrics(mappedPrediction.metrics)
            break

          default:
            mappedPrediction = {
              prediction: result.data.prediction || result.data.result || "Unknown",
              confidence: result.data.confidence || 0.85,
              metrics: result.data.model_metrics || model.defaultStats,
              rawResponse: result.data,
            }
            setLatestMetrics(mappedPrediction.metrics)
        }

        setPrediction(mappedPrediction)
      } else {
        setPrediction({
          error: true,
          message: result.error || "Failed to get prediction from API",
          details: result.error,
        })
      }
    } catch (error: any) {
      console.error("Prediction error:", error)
      setPrediction({
        error: true,
        message: error.message || "Failed to get prediction from API",
        details: error.toString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEndpoint = () => {
    if (isValidUrl(tempEndpoint) && onModelUpdate) {
      const updatedModel = { ...model, endpoint: tempEndpoint }
      onModelUpdate(updatedModel)
      setIsEditingEndpoint(false)
    }
  }

  const handleCancelEdit = () => {
    setTempEndpoint(model.endpoint)
    setIsEditingEndpoint(false)
  }

  const handlePresetSelect = (endpoint: string, method: "GET" | "POST") => {
    setTempEndpoint(endpoint)
    setTempMethod(method)
  }

  const getModelTypeBadgeColor = (type: string) => {
    switch (type) {
      case "regression":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "classification":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "image_classification":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getBuiltUrl = () => {
    try {
      return buildApiUrl(tempEndpoint, tempMethod)
    } catch {
      return "Invalid URL"
    }
  }

  return (
    <div className="space-y-6">
      {/* Model Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{model.name}</CardTitle>
                <Badge className={getModelTypeBadgeColor(model.type)}>{model.type.replace("_", " ")}</Badge>
              </div>
              <CardDescription className="text-base">{model.purpose}</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span className="font-mono">{new URL(tempEndpoint || model.endpoint).hostname}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{model.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="predict" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predict" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Predict
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predict" className="space-y-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                API Configuration
                <Button variant="outline" size="sm" onClick={() => setIsEditingEndpoint(!isEditingEndpoint)}>
                  {isEditingEndpoint ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingEndpoint ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>API Endpoint</Label>
                      <Input
                        value={tempEndpoint}
                        onChange={(e) => setTempEndpoint(e.target.value)}
                        placeholder="https://your-api-url.ngrok-free.app"
                        className={!isValidUrl(tempEndpoint) ? "border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select value={tempMethod} onValueChange={(value: "GET" | "POST") => setTempMethod(value)}>
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
                    <Label>Built URL</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm break-all">{getBuiltUrl()}</code>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEndpoint} disabled={!isValidUrl(tempEndpoint)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Endpoint:</span>
                    <Badge variant="outline">{tempMethod}</Badge>
                  </div>
                  <code className="bg-muted p-2 rounded text-sm block break-all">{getBuiltUrl()}</code>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Input</CardTitle>
                <CardDescription>Enter the required data for {model.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedModelInputForm
                  model={model}
                  onSubmit={handlePrediction}
                  isLoading={isLoading}
                  method={tempMethod}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
                <CardDescription>Model output and confidence scores</CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionResults prediction={prediction} modelType={model.type} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <ModelMetrics model={model} latestMetrics={latestMetrics} />
        </TabsContent>

        <TabsContent value="config">
          <div className="space-y-6">
            {/* API Preset Manager */}
            <ApiPresetManager
              currentEndpoint={tempEndpoint}
              currentMethod={tempMethod}
              onPresetSelect={handlePresetSelect}
            />

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current API Configuration
                  <Button variant="outline" size="sm" onClick={() => setIsEditingEndpoint(!isEditingEndpoint)}>
                    {isEditingEndpoint ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingEndpoint ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label>API Endpoint</Label>
                        <Input
                          value={tempEndpoint}
                          onChange={(e) => setTempEndpoint(e.target.value)}
                          placeholder="https://your-api-url.ngrok-free.app"
                          className={!isValidUrl(tempEndpoint) ? "border-red-500" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>HTTP Method</Label>
                        <Select value={tempMethod} onValueChange={(value: "GET" | "POST") => setTempMethod(value)}>
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
                      <Label>Built URL</Label>
                      <div className="p-3 bg-muted rounded-lg">
                        <code className="text-sm break-all">{getBuiltUrl()}</code>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEndpoint} disabled={!isValidUrl(tempEndpoint)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">API Endpoint</Label>
                        <code className="bg-muted p-2 rounded text-sm block break-all mt-1">{tempEndpoint}</code>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">HTTP Method</Label>
                        <div className="mt-1">
                          <Badge variant="outline">{tempMethod}</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Final URL</Label>
                      <code className="bg-muted p-2 rounded text-sm block break-all mt-1">{getBuiltUrl()}</code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model Details */}
            <Card>
              <CardHeader>
                <CardTitle>Model Details</CardTitle>
                <CardDescription>Technical specifications and input configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Model Inputs</h4>
                  <div className="space-y-2">
                    {model.inputs.map((input, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{input.label}</span>
                          <span className="text-sm text-muted-foreground ml-2">({input.name})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{input.type}</Badge>
                          {input.required && <Badge variant="secondary">Required</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Capabilities</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Input Format:</span> {model.capabilities.inputFormat}
                    </div>
                    <div>
                      <span className="font-medium">Output Format:</span> {model.capabilities.outputFormat}
                    </div>
                    <div>
                      <span className="font-medium">Metrics:</span> {model.capabilities.metrics.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium">Supported Formats:</span>{" "}
                      {model.capabilities.supportedFormats.join(", ")}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Deployment Notes</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Model is containerized via Docker</li>
                    <li>• Supports CI/CD, peer code review, and SonarQube analysis</li>
                    <li>• Configurations provided via config files — no hardcoded values</li>
                    <li>• Model APIs are tested inside VM using Docker</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
