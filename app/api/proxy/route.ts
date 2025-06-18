import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, method, data, headers } = await request.json()

    const response = await fetch(url, {
      method: method || "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...headers,
      },
      body: method === "GET" ? undefined : JSON.stringify(data),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Proxy request failed" }, { status: 500 })
  }
}
