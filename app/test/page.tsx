"use client"

import { ApiTester } from "@/components/api-tester"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <ApiTester />
      </div>
    </div>
  )
}
