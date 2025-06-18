"use client"

import { useState } from "react"
import type { ModelConfig } from "@/types/model-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ModelInputForm } from "./model-input-form"
import { ModelMetrics } from "./model-metrics"
import { PredictionResults } from "./prediction-results"
import { BarChart3, Settings, TrendingUp, Globe } from "lucide-react"

interface IndividualModelDashboardProps {
  model: ModelConfig
}

export function IndividualModelDashboard({ model }: IndividualModelDashboardProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [latestMetrics, setLatestMetrics] = useState<any>(null)

  const handlePrediction = async (inputData: any) => {
    setIsLoading(true)
    try {
      // Make actual API call to the model endpoint
      const response = await fetch(model.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add ngrok bypass header if needed
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(inputData),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const apiResponse = await response.json()
      console.log("API Response:", apiResponse)

      // Map API response to prediction format based on model type
      let mappedPrediction
      switch (model.type) {
        case "regression":
          // Handle regression response (like your sales prediction API)
          mappedPrediction = {
            prediction: apiResponse.predicted_sales || apiResponse.prediction || apiResponse.value,
            confidence: apiResponse.confidence || apiResponse.model_metrics?.r2 || 0.85,
            metrics: {
              r2: apiResponse.model_metrics?.r2 || model.defaultStats.r2,
              mse: apiResponse.model_metrics?.mse || model.defaultStats.mse,
              rmse: apiResponse.model_metrics?.rmse || model.defaultStats.rmse,
              mae: apiResponse.model_metrics?.mae || model.defaultStats.mae,
              coefficients: apiResponse.model_metrics?.coefficients,
              intercept: apiResponse.model_metrics?.intercept,
            },
            rawResponse: apiResponse,
          }
          setLatestMetrics(mappedPrediction.metrics)
          break

        case "classification":
          // Handle classification response
          if (apiResponse.probabilities) {
            mappedPrediction = {
              prediction: apiResponse.prediction || apiResponse.predicted_class,
              probabilities: apiResponse.probabilities,
              confidence: Math.max(...Object.values(apiResponse.probabilities)),
              metrics: apiResponse.model_metrics || model.defaultStats,
              rawResponse: apiResponse,
            }
          } else {
            // If probabilities not provided, create from prediction
            mappedPrediction = {
              prediction: apiResponse.prediction || apiResponse.predicted_class,
              probabilities: [
                { label: apiResponse.prediction || "positive", probability: apiResponse.confidence || 0.85 },
              ],
              confidence: apiResponse.confidence || 0.85,
              metrics: apiResponse.model_metrics || model.defaultStats,
              rawResponse: apiResponse,
            }
          }
          setLatestMetrics(mappedPrediction.metrics)
          break

        case "image_classification":
          // Handle image classification response
          mappedPrediction = {
            prediction: apiResponse.prediction || apiResponse.predicted_class,
            probabilities: apiResponse.probabilities || apiResponse.class_probabilities || [],
            confidence:
              apiResponse.confidence || Math.max(...(apiResponse.probabilities?.map((p) => p.probability) || [0.85])),
            metrics: apiResponse.model_metrics || model.defaultStats,
            rawResponse: apiResponse,
          }
          setLatestMetrics(mappedPrediction.metrics)
          break

        default:
          // Generic response handling
          mappedPrediction = {
            prediction: apiResponse.prediction || apiResponse.result || "Unknown",
            confidence: apiResponse.confidence || 0.85,
            metrics: apiResponse.model_metrics || model.defaultStats,
            rawResponse: apiResponse,
          }
          setLatestMetrics(mappedPrediction.metrics)
      }

      setPrediction(mappedPrediction)
    } catch (error) {
      console.error("Prediction error:", error)

      // Show error to user
      setPrediction({
        error: true,
        message: error.message || "Failed to get prediction from API",
        details: error.toString(),
      })
    } finally {
      setIsLoading(false)
    }
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
              <span className="font-mono">{new URL(model.endpoint).hostname}</span>
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
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Input</CardTitle>
                <CardDescription>Enter the required data for {model.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ModelInputForm model={model} onSubmit={handlePrediction} isLoading={isLoading} />
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
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>Technical details and API information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">API Endpoint</h4>
                <code className="bg-muted p-2 rounded text-sm block break-all">{model.endpoint}</code>
              </div>

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
        </TabsContent>
      </Tabs>
    </div>
  )
}
