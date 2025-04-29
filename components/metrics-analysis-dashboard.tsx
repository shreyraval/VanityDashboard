"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MetricsTable } from "./metrics-table"
import { RedundancyAnalysis } from "./redundancy-analysis"
import { MetricValueAnalysis } from "./metric-value-analysis"
import { fetchMetricsData } from "@/lib/data-service"
import type { Metric } from "@/lib/types"
import { Loader2 } from "lucide-react"

export function MetricsAnalysisDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [businessGoal, setBusinessGoal] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMetricsData()
        setMetrics(data)

        // Extract unique departments
        const uniqueDepartments = Array.from(new Set(data.map((item) => item.Department)))
        setDepartments(uniqueDepartments)

        // Set default department if available
        if (uniqueDepartments.length > 0) {
          setSelectedDepartment(uniqueDepartments[0])
        }

        setLoading(false)
      } catch (error) {
        console.error("Failed to load metrics data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value)
  }

  const handleBusinessGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessGoal(e.target.value)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading metrics data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department & Goal Selection</CardTitle>
          <CardDescription>
            Select your department and enter your business goal to get tailored metrics recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-goal">Business Goal</Label>
              <Input
                id="business-goal"
                placeholder="Enter your primary business goal"
                value={businessGoal}
                onChange={handleBusinessGoalChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="redundancy">Redundancy Analysis</TabsTrigger>
          <TabsTrigger value="value">Value Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metrics Overview</CardTitle>
              <CardDescription>All metrics for {selectedDepartment || "all departments"}</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsTable metrics={metrics} selectedDepartment={selectedDepartment} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redundancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redundancy Analysis</CardTitle>
              <CardDescription>Identify metrics that are tracked redundantly across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <RedundancyAnalysis metrics={metrics} departments={departments} selectedDepartment={selectedDepartment} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Value vs. Vanity Analysis</CardTitle>
              <CardDescription>Identify which metrics provide real value vs. potential vanity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricValueAnalysis
                metrics={metrics}
                selectedDepartment={selectedDepartment}
                businessGoal={businessGoal}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
