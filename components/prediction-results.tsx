"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, Target, ImageIcon, X } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

interface PredictionResultsProps {
  prediction: any
  modelType: string
  isLoading: boolean
}

export function PredictionResults({ prediction, modelType, isLoading }: PredictionResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Calling API endpoint...</p>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <div className="text-center">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <p>No prediction yet. Submit your data to get started.</p>
        </div>
      </div>
    )
  }

  // Handle API errors
  if (prediction.error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center text-red-600 dark:text-red-400">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <X className="w-4 h-4" />
          </div>
          <p className="font-medium mb-1">API Error</p>
          <p className="text-sm">{prediction.message}</p>
          {prediction.details && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer">Show details</summary>
              <pre className="mt-1 p-2 bg-muted rounded text-left overflow-auto">{prediction.details}</pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  // Add raw response viewer for debugging
  const renderRawResponse = () => (
    <details className="mt-4 text-xs">
      <summary className="cursor-pointer text-muted-foreground">View Raw API Response</summary>
      <pre className="mt-2 p-3 bg-muted rounded overflow-auto text-left">
        {JSON.stringify(prediction.rawResponse, null, 2)}
      </pre>
    </details>
  )

  const renderRegressionResults = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-primary mb-2">
          {typeof prediction.prediction === "number"
            ? `$${prediction.prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : prediction.prediction}
        </div>
        <Badge variant="secondary">Confidence: {(prediction.confidence * 100).toFixed(1)}%</Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Model Confidence</span>
          <span>{(prediction.confidence * 100).toFixed(1)}%</span>
        </div>
        <Progress value={prediction.confidence * 100} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">R²</div>
          <div>{prediction.metrics.r2?.toFixed(4) || "N/A"}</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">RMSE</div>
          <div>{prediction.metrics.rmse?.toFixed(2) || "N/A"}</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">MAE</div>
          <div>{prediction.metrics.mae?.toFixed(2) || "N/A"}</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="font-semibold">MSE</div>
          <div>{prediction.metrics.mse?.toFixed(2) || "N/A"}</div>
        </div>
      </div>

      {prediction.metrics.coefficients && (
        <div className="text-sm">
          <div className="font-semibold mb-1">Model Coefficients:</div>
          <div className="bg-muted p-2 rounded">
            {prediction.metrics.coefficients.map((coef, index) => (
              <div key={index}>
                Coefficient {index + 1}: {coef.toFixed(4)}
              </div>
            ))}
            {prediction.metrics.intercept && <div>Intercept: {prediction.metrics.intercept.toFixed(4)}</div>}
          </div>
        </div>
      )}

      {renderRawResponse()}
    </div>
  )

  // Rest of the component remains the same...
  const renderClassificationResults = () => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2 capitalize">{prediction.prediction}</div>
          <Badge variant="secondary">Confidence: {(prediction.confidence * 100).toFixed(1)}%</Badge>
        </div>

        {prediction.probabilities && prediction.probabilities.length > 1 && (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prediction.probabilities}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="probability"
                    nameKey="label"
                  >
                    {prediction.probabilities.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {prediction.probabilities.map((prob: any, index: number) => (
                <div key={prob.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="capitalize text-sm">{prob.label}</span>
                  </div>
                  <span className="text-sm font-medium">{(prob.probability * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {renderRawResponse()}
      </div>
    )
  }

  const renderImageClassificationResults = () => {
    const chartData =
      prediction.probabilities?.map((prob: any) => ({
        name: prob.label,
        value: prob.probability * 100,
      })) || []

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2 capitalize">{prediction.prediction}</div>
          <Badge variant="secondary">Confidence: {(prediction.confidence * 100).toFixed(1)}%</Badge>
        </div>

        {chartData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Image classification complete
        </div>

        {renderRawResponse()}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Prediction Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        {modelType === "regression" && renderRegressionResults()}
        {modelType === "classification" && renderClassificationResults()}
        {modelType === "image_classification" && renderImageClassificationResults()}
      </CardContent>
    </Card>
  )
}
