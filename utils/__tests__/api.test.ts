import { buildApiUrl, buildQueryString, buildGetUrl, isValidUrl } from "../api"

describe("API Utilities", () => {
  describe("buildApiUrl", () => {
    test("should append /predict for POST requests", () => {
      const url = buildApiUrl("https://example.com", "POST")
      expect(url).toBe("https://example.com/predict")
    })

    test("should not append /predict if already present", () => {
      const url = buildApiUrl("https://example.com/predict", "POST")
      expect(url).toBe("https://example.com/predict")
    })

    test("should handle GET requests without modification", () => {
      const url = buildApiUrl("https://example.com/api/data", "GET")
      expect(url).toBe("https://example.com/api/data")
    })

    test("should remove trailing slashes", () => {
      const url = buildApiUrl("https://example.com///", "POST")
      expect(url).toBe("https://example.com/predict")
    })

    test("should throw error for invalid URLs", () => {
      expect(() => buildApiUrl("invalid-url", "POST")).toThrow("Invalid URL format")
    })
  })

  describe("buildQueryString", () => {
    test("should build query string from object", () => {
      const params = { temperature: 25, promotions: 5 }
      const queryString = buildQueryString(params)
      expect(queryString).toBe("temperature=25&promotions=5")
    })

    test("should handle empty values", () => {
      const params = { temperature: 25, promotions: "", empty: null, undefined: undefined }
      const queryString = buildQueryString(params)
      expect(queryString).toBe("temperature=25")
    })
  })

  describe("buildGetUrl", () => {
    test("should append query parameters to URL", () => {
      const url = buildGetUrl("https://example.com/api", { temp: 25 })
      expect(url).toBe("https://example.com/api?temp=25")
    })

    test("should handle existing query parameters", () => {
      const url = buildGetUrl("https://example.com/api?existing=1", { temp: 25 })
      expect(url).toBe("https://example.com/api?existing=1&temp=25")
    })
  })

  describe("isValidUrl", () => {
    test("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true)
      expect(isValidUrl("http://localhost:3000")).toBe(true)
    })

    test("should reject invalid URLs", () => {
      expect(isValidUrl("invalid-url")).toBe(false)
      expect(isValidUrl("")).toBe(false)
    })
  })
})
