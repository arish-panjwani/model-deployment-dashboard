import type { ModelConfig } from "@/types/model-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ModelMetricsProps {
  model: ModelConfig
  latestMetrics?: any
}

export function ModelMetrics({ model, latestMetrics }: ModelMetricsProps) {
  const renderRegressionMetrics = () => {
    // Use latest metrics from API if available, otherwise fall back to default stats
    const stats = latestMetrics || (model.defaultStats as any)
    const metricsData = [
      { name: "R² Score", value: Math.max(0, (stats.r2 || 0) * 100), unit: "%" },
      { name: "RMSE", value: Math.abs(stats.rmse || 0), unit: "" },
      { name: "MAE", value: Math.abs(stats.mae || 0), unit: "" },
    ]

    // Normalize values for better visualization
    const maxValue = Math.max(...metricsData.map((d) => d.value))
    const normalizedData = metricsData.map((item) => ({
      ...item,
      normalizedValue: maxValue > 0 ? (item.value / maxValue) * 100 : 0,
      originalValue: item.value,
    }))

    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
            <CardDescription>{latestMetrics ? "Latest prediction metrics" : "Default model metrics"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>R² Score</span>
                <Badge variant="secondary">{stats.r2?.toFixed(4) || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Mean Squared Error</span>
                <Badge variant="secondary">{stats.mse?.toFixed(2) || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Root Mean Squared Error</span>
                <Badge variant="secondary">{stats.rmse?.toFixed(2) || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Mean Absolute Error</span>
                <Badge variant="secondary">{stats.mae?.toFixed(2) || "N/A"}</Badge>
              </div>
              {stats.coefficients && (
                <div className="pt-2 border-t">
                  <span className="font-medium">Coefficients:</span>
                  <div className="mt-1 text-sm">
                    {stats.coefficients.map((coef: number, index: number) => (
                      <div key={index}>
                        Coeff {index + 1}: {coef.toFixed(4)}
                      </div>
                    ))}
                    {stats.intercept && <div>Intercept: {stats.intercept.toFixed(4)}</div>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metrics Visualization</CardTitle>
            <CardDescription>Performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex flex-col justify-center">
              {/* Fallback bar chart using CSS */}
              <div className="space-y-4">
                {normalizedData.map((item, index) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-mono">
                        {item.originalValue.toFixed(2)}
                        {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? "bg-blue-500" : index === 1 ? "bg-green-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${Math.max(5, item.normalizedValue)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Try to render Recharts as well */}
              <div className="mt-4" style={{ display: "none" }}>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={normalizedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        const item = normalizedData.find((d) => d.name === name)
                        return [`${item?.originalValue?.toFixed(4) || 0}${item?.unit || ""}`, name]
                      }}
                    />
                    <Bar dataKey="normalizedValue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderClassificationMetrics = () => {
    const stats = latestMetrics || (model.defaultStats as any)
    const metricsData = [
      { name: "Accuracy", value: (stats.accuracy || 0) * 100 },
      { name: "F1 Score", value: (stats.f1Score || 0) * 100 },
      { name: "Precision", value: (stats.precision || 0) * 100 },
      { name: "Recall", value: (stats.recall || 0) * 100 },
    ]

    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Classification Metrics</CardTitle>
            <CardDescription>{latestMetrics ? "Latest prediction metrics" : "Default model metrics"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Accuracy</span>
                <Badge variant="secondary">{((stats.accuracy || 0) * 100).toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>F1 Score</span>
                <Badge variant="secondary">{stats.f1Score?.toFixed(3) || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Precision</span>
                <Badge variant="secondary">{stats.precision?.toFixed(3) || "N/A"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Recall</span>
                <Badge variant="secondary">{stats.recall?.toFixed(3) || "N/A"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
            <CardDescription>Metrics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderImageClassificationMetrics = () => {
    const stats = latestMetrics || (model.defaultStats as any)

    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Classification Metrics</CardTitle>
            <CardDescription>{latestMetrics ? "Latest prediction metrics" : "Default model metrics"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Accuracy</span>
                <Badge variant="secondary">{((stats.accuracy || 0) * 100).toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Top-5 Accuracy</span>
                <Badge variant="secondary">{((stats.top5Accuracy || 0) * 100).toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Test Samples</span>
                <Badge variant="secondary">{stats.testSamples?.toLocaleString() || "N/A"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy Comparison</CardTitle>
            <CardDescription>Top-1 vs Top-5 accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Top-1", value: (stats.accuracy || 0) * 100 },
                    { name: "Top-5", value: (stats.top5Accuracy || 0) * 100 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="value" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {model.type === "regression" && renderRegressionMetrics()}
      {model.type === "classification" && renderClassificationMetrics()}
      {model.type === "image_classification" && renderImageClassificationMetrics()}
    </div>
  )
}
