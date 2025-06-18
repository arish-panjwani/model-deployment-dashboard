"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { callApi, buildApiUrl, getDefaultApiUrl, buildGetUrl, isValidUrl } from "@/utils/api"
import { Loader2, CheckCircle, XCircle, Globe, Code, Play } from "lucide-react"

export function ApiTester() {
  const [apiUrl, setApiUrl] = useState(getDefaultApiUrl())
  const [method, setMethod] = useState<"GET" | "POST">("POST")
  const [requestData, setRequestData] = useState('{\n  "temperature": 25.0,\n  "promotions": 5.0\n}')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields for easy input
  const [temperature, setTemperature] = useState(25)
  const [promotions, setPromotions] = useState(5)

  const handleFormSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      let data = {}

      if (method === "POST") {
        // Try to parse JSON data
        try {
          data = JSON.parse(requestData)
        } catch (e) {
          throw new Error("Invalid JSON in request data")
        }
      }

      const result = await callApi(apiUrl, { method, data })

      if (result.success) {
        setResponse(result.data)
      } else {
        setError(result.error || "Unknown error")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickTest = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const data = { temperature, promotions }
      const result = await callApi(apiUrl, { method: "POST", data })

      if (result.success) {
        setResponse(result.data)
      } else {
        setError(result.error || "Unknown error")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getBuiltUrl = () => {
    try {
      if (method === "GET") {
        const data = JSON.parse(requestData)
        return buildGetUrl(buildApiUrl(apiUrl, method), data)
      }
      return buildApiUrl(apiUrl, method)
    } catch {
      return "Invalid URL or data"
    }
  }

  const isUrlValid = isValidUrl(apiUrl)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Endpoint Tester
          </CardTitle>
          <CardDescription>
            Test your ML model APIs with dynamic URLs and methods. Handles both GET and POST requests with proper URL
            formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://your-api-url.ngrok-free.app"
                className={!isUrlValid ? "border-red-500" : ""}
              />
              {!isUrlValid && <p className="text-sm text-red-500">Please enter a valid URL</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={method} onValueChange={(value: "GET" | "POST") => setMethod(value)}>
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
        </CardContent>
      </Card>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Quick Test</TabsTrigger>
          <TabsTrigger value="json">JSON Request</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Form</CardTitle>
              <CardDescription>Test with simple form inputs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotions">Promotions</Label>
                  <Input
                    id="promotions"
                    type="number"
                    value={promotions}
                    onChange={(e) => setPromotions(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={handleQuickTest} disabled={isLoading || !isUrlValid} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing API...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Request</CardTitle>
              <CardDescription>Send custom JSON data to your API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestData">Request Data (JSON)</Label>
                <Textarea
                  id="requestData"
                  value={requestData}
                  onChange={(e) => setRequestData(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={handleFormSubmit} disabled={isLoading || !isUrlValid} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Section */}
      {(response || error) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {error ? (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  Error Response
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Success Response
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {response && (
              <div className="space-y-4">
                {/* Formatted Response for Sales Prediction */}
                {response.predicted_sales && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${response.predicted_sales.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Predicted Sales</div>
                    </div>
                    {response.model_metrics && (
                      <>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {response.model_metrics.r2?.toFixed(4)}
                          </div>
                          <div className="text-sm text-muted-foreground">R² Score</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {response.model_metrics.rmse?.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">RMSE</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {response.model_metrics.mae?.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">MAE</div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Raw JSON Response */}
                <details className="space-y-2">
                  <summary className="cursor-pointer font-medium">View Raw Response</summary>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>How to use the API utility in your code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary">POST Request</Badge>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto">
              {`import { callApi } from '@/utils/api'

// POST request (automatically appends /predict)
const result = await callApi('https://your-api.ngrok-free.app', {
  method: 'POST',
  data: { temperature: 25, promotions: 5 }
})

if (result.success) {
  console.log('Prediction:', result.data.predicted_sales)
} else {
  console.error('Error:', result.error)
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <Badge variant="secondary">GET Request</Badge>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto">
              {`import { getApi, buildGetUrl } from '@/utils/api'

// GET request with query parameters
const url = buildGetUrl('https://your-api.ngrok-free.app/predict', {
  temperature: 25,
  promotions: 5
})

const result = await getApi(url)
if (result.success) {
  console.log('Response:', result.data)
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
