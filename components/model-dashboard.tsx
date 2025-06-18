"use client"

import { useState } from "react"
import type { ModelConfig } from "@/types/model-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelInputForm } from "./model-input-form"
import { ModelMetrics } from "./model-metrics"
import { UsageChart } from "./usage-chart"
import { PredictionResults } from "./prediction-results"
import { Activity, BarChart3, Settings, TrendingUp } from "lucide-react"

interface ModelDashboardProps {
  model: ModelConfig
}

export function ModelDashboard({ model }: ModelDashboardProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrediction = async (inputData: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock prediction based on model type
      let mockPrediction
      switch (model.type) {
        case "regression":
          mockPrediction = {
            prediction: Math.round(Math.random() * 1000 + 500),
            confidence: 0.85,
            metrics: model.defaultStats,
          }
          break
        case "classification":
          const sentiments = ["positive", "negative", "neutral"]
          const probabilities = [Math.random(), Math.random(), Math.random()]
          const sum = probabilities.reduce((a, b) => a + b, 0)
          const normalizedProbs = probabilities.map((p) => p / sum)

          mockPrediction = {
            prediction: sentiments[normalizedProbs.indexOf(Math.max(...normalizedProbs))],
            probabilities: sentiments.map((sentiment, i) => ({
              label: sentiment,
              probability: normalizedProbs[i],
            })),
            confidence: Math.max(...normalizedProbs),
            metrics: model.defaultStats,
          }
          break
        case "image_classification":
          const classes = ["cat", "dog", "car", "bird", "flower"]
          const classProbs = Array.from({ length: 5 }, () => Math.random())
          const classSum = classProbs.reduce((a, b) => a + b, 0)
          const normalizedClassProbs = classProbs.map((p) => p / classSum)

          mockPrediction = {
            prediction: classes[normalizedClassProbs.indexOf(Math.max(...normalizedClassProbs))],
            probabilities: classes.map((cls, i) => ({
              label: cls,
              probability: normalizedClassProbs[i],
            })),
            confidence: Math.max(...normalizedClassProbs),
            metrics: model.defaultStats,
          }
          break
        default:
          mockPrediction = { prediction: "Unknown", confidence: 0 }
      }

      setPrediction(mockPrediction)
    } catch (error) {
      console.error("Prediction error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="predict" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predict" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Predict
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Usage
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
          <ModelMetrics model={model} />
        </TabsContent>

        <TabsContent value="usage">
          <UsageChart data={model.usageStats} />
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
                <code className="bg-muted p-2 rounded text-sm block">{model.endpoint}</code>
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
