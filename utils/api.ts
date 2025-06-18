/**
 * API Utility Module for Dynamic ML Model Endpoints
 * Handles dynamic URLs, methods, and provides clean error handling
 */

export interface ApiCallOptions {
  method: "GET" | "POST"
  data?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status?: number
  url?: string
}

/**
 * Builds and validates API URL based on method and user input
 * @param userInputUrl - The base URL provided by user
 * @param method - HTTP method (GET or POST)
 * @returns Properly formatted API URL
 */
export function buildApiUrl(userInputUrl: string, method: string): string {
  if (!userInputUrl) {
    throw new Error("API URL is required")
  }

  let url = userInputUrl.trim()

  // Remove trailing slashes
  url = url.replace(/\/+$/, "")

  // Validate URL format
  try {
    new URL(url)
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`)
  }

  // Append /predict for POST requests if not already present
  if (method.toUpperCase() === "POST" && !url.endsWith("/predict")) {
    url = url + "/predict"
  }

  return url
}

/**
 * Makes API calls with proper error handling and logging
 * @param userInputUrl - Base API URL
 * @param options - API call options including method, data, headers
 * @returns Promise with API response
 */
export async function callApi<T = any>(userInputUrl: string, options: ApiCallOptions): Promise<ApiResponse<T>> {
  const { method, data = {}, headers = {}, timeout = 30000 } = options

  try {
    const apiUrl = buildApiUrl(userInputUrl, method)
    console.log(`🚀 API Call: ${method} ${apiUrl}`)

    const requestOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // For ngrok URLs
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    }

    // Add body for POST requests
    if (method.toUpperCase() === "POST") {
      requestOptions.body = JSON.stringify(data)
      console.log("📤 Request Data:", data)
    }

    const response = await fetch(apiUrl, requestOptions)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ API Response:", result)

    return {
      success: true,
      data: result,
      status: response.status,
      url: apiUrl,
    }
  } catch (error: any) {
    console.error("❌ API call failed:", error.message)

    return {
      success: false,
      error: error.message || "Unknown API error",
      url: userInputUrl,
    }
  }
}

/**
 * Convenience function for POST requests
 */
export async function postApi<T = any>(
  url: string,
  data: Record<string, any>,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return callApi<T>(url, { method: "POST", data, headers })
}

/**
 * Convenience function for GET requests
 */
export async function getApi<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
  return callApi<T>(url, { method: "GET", headers })
}

/**
 * Validates if a URL is properly formatted
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url.trim())
    return true
  } catch {
    return false
  }
}

/**
 * Gets default API URL from environment or fallback
 */
export function getDefaultApiUrl(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_API_URL || "http://localhost:5000"
}

/**
 * Builds query string for GET requests
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

/**
 * Builds full GET URL with query parameters
 */
export function buildGetUrl(baseUrl: string, params: Record<string, any>): string {
  const queryString = buildQueryString(params)
  const separator = baseUrl.includes("?") ? "&" : "?"
  return queryString ? `${baseUrl}${separator}${queryString}` : baseUrl
}
