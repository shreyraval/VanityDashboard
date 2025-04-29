"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Metric } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MetricValueAnalysisProps {
  metrics: Metric[]
  selectedDepartment: string
  businessGoal: string
}

export function MetricValueAnalysis({ metrics, selectedDepartment, businessGoal }: MetricValueAnalysisProps) {
  // Filter metrics for the selected department
  const departmentMetrics = useMemo(() => {
    if (!selectedDepartment) return metrics
    return metrics.filter((m) => m.Department === selectedDepartment)
  }, [metrics, selectedDepartment])

  // Calculate value score for each metric
  const metricsWithScore = useMemo(() => {
    return departmentMetrics
      .map((metric) => {
        // Base score calculation
        let valueScore = 0

        // Core value factors
        if (metric.Used_in_Decision_Making === "Yes") valueScore += 40
        if (metric.Executive_Requested === "Yes") valueScore += 20
        if (metric.Visible_in_Dashboard === "Yes") valueScore += 10

        // Recency factors
        if (metric.Last_Reviewed === "Last month") valueScore += 15
        else if (metric.Last_Reviewed === "Last quarter") valueScore += 10
        else if (metric.Last_Reviewed === "Last year") valueScore += 5

        // Decision usage factors
        if (metric.Metric_Last_Used_For_Decision === "Last week") valueScore += 15
        else if (metric.Metric_Last_Used_For_Decision === "Last month") valueScore += 10
        else if (metric.Metric_Last_Used_For_Decision === "Last quarter") valueScore += 5

        // Generate justification
        let justification = ""
        let impact = ""

        if (metric.Used_in_Decision_Making === "Yes" && metric.Executive_Requested === "Yes") {
          justification =
            "This metric is highly valuable as it's both used for decision-making and requested by executives."
          if (metric.Last_Reviewed.includes("Last")) {
            justification += " It's also been recently reviewed."
          }
          impact =
            "Focusing on this metric will align team actions with executive priorities, creating organizational coherence and driving strategic outcomes."
        } else if (metric.Used_in_Decision_Making === "Yes") {
          justification = "This metric drives team decisions but isn't explicitly requested by executives."
          impact =
            "Highlighting this metric to leadership could bridge the gap between executive vision and team execution, potentially revealing valuable operational insights."
        } else if (metric.Executive_Requested === "Yes") {
          justification = "This metric is requested by executives but not currently used for decision-making."
          impact =
            "Finding ways to incorporate this metric into decision processes could better align with executive priorities and demonstrate value to leadership."
        } else {
          justification = "This metric is neither used for decisions nor requested by executives."
          impact =
            "Consider whether this metric should be maintained or if resources could be better allocated elsewhere."
        }

        // Add notes if available
        if (metric.Interpretation_Notes && metric.Interpretation_Notes !== "N/A") {
          justification += ` Note: ${metric.Interpretation_Notes}`
        }

        return {
          ...metric,
          valueScore,
          justification,
          impact,
          category:
            metric.Used_in_Decision_Making === "Yes" && metric.Executive_Requested === "Yes"
              ? "High Value"
              : metric.Used_in_Decision_Making === "No" && metric.Executive_Requested === "Yes"
                ? "Potential Vanity"
                : metric.Used_in_Decision_Making === "Yes" && metric.Executive_Requested === "No"
                  ? "Team Value"
                  : "Low Priority",
        }
      })
      .sort((a, b) => b.valueScore - a.valueScore)
  }, [departmentMetrics])

  // Get top 3 metrics by value score
  const topMetrics = useMemo(() => {
    return metricsWithScore.slice(0, 3)
  }, [metricsWithScore])

  // Categorize metrics by their value type for the pie chart
  const categorizedMetrics = useMemo(() => {
    const highValue = metricsWithScore.filter((m) => m.category === "High Value")
    const potentialVanity = metricsWithScore.filter((m) => m.category === "Potential Vanity")
    const teamValue = metricsWithScore.filter((m) => m.category === "Team Value")
    const lowPriority = metricsWithScore.filter((m) => m.category === "Low Priority")

    return {
      highValue,
      potentialVanity,
      teamValue,
      lowPriority,
    }
  }, [metricsWithScore])

  // Prepare data for the pie chart
  const pieChartData = useMemo(() => {
    return [
      { name: "High Value", value: categorizedMetrics.highValue.length, color: "#22c55e" },
      { name: "Potential Vanity", value: categorizedMetrics.potentialVanity.length, color: "#eab308" },
      { name: "Team Value", value: categorizedMetrics.teamValue.length, color: "#3b82f6" },
      { name: "Low Priority", value: categorizedMetrics.lowPriority.length, color: "#94a3b8" },
    ].filter((item) => item.value > 0)
  }, [categorizedMetrics])

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "High Value":
        return "bg-green-500"
      case "Potential Vanity":
        return "bg-yellow-500"
      case "Team Value":
        return "bg-blue-500"
      default:
        return "bg-slate-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Metric Value Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} metrics`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Metric Categories</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-medium">High Value Metrics ({categorizedMetrics.highValue.length})</h4>
                <p className="text-sm text-muted-foreground">Used for decision making and requested by executives</p>
                <ul className="mt-1 text-sm">
                  {categorizedMetrics.highValue.slice(0, 3).map((metric, i) => (
                    <li key={i} className="ml-4 list-disc">
                      {metric.Metric_Name} <span className="text-muted-foreground">(Score: {metric.valueScore})</span>
                    </li>
                  ))}
                  {categorizedMetrics.highValue.length > 3 && (
                    <li className="ml-4 list-disc text-muted-foreground">
                      +{categorizedMetrics.highValue.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-medium">Potential Vanity Metrics ({categorizedMetrics.potentialVanity.length})</h4>
                <p className="text-sm text-muted-foreground">
                  Requested by executives but not used for decision making
                </p>
                <ul className="mt-1 text-sm">
                  {categorizedMetrics.potentialVanity.slice(0, 3).map((metric, i) => (
                    <li key={i} className="ml-4 list-disc">
                      {metric.Metric_Name} <span className="text-muted-foreground">(Score: {metric.valueScore})</span>
                    </li>
                  ))}
                  {categorizedMetrics.potentialVanity.length > 3 && (
                    <li className="ml-4 list-disc text-muted-foreground">
                      +{categorizedMetrics.potentialVanity.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-medium">Team Value Metrics ({categorizedMetrics.teamValue.length})</h4>
                <p className="text-sm text-muted-foreground">
                  Used for decision making but not requested by executives
                </p>
                <ul className="mt-1 text-sm">
                  {categorizedMetrics.teamValue.slice(0, 3).map((metric, i) => (
                    <li key={i} className="ml-4 list-disc">
                      {metric.Metric_Name} <span className="text-muted-foreground">(Score: {metric.valueScore})</span>
                    </li>
                  ))}
                  {categorizedMetrics.teamValue.length > 3 && (
                    <li className="ml-4 list-disc text-muted-foreground">
                      +{categorizedMetrics.teamValue.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedDepartment && (
        <Alert className="bg-primary/10 border-primary/20">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertTitle>Top 3 Metrics by Value Score for {selectedDepartment}</AlertTitle>
          <AlertDescription>
            {businessGoal && (
              <p className="mb-2">
                Based on your business goal: <span className="font-medium italic">{businessGoal}</span>
              </p>
            )}

            {topMetrics.length > 0 ? (
              <div className="space-y-6 mt-4">
                {topMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(metric.category)}>{index + 1}</Badge>
                        <h3 className="text-lg font-semibold">{metric.Metric_Name}</h3>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        Value Score: {metric.valueScore}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Justification</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{metric.justification}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Impact Analysis</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{metric.impact}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
                      <div className="border rounded p-2">
                        <span className="block text-muted-foreground">Dashboard</span>
                        <span className={metric.Visible_in_Dashboard === "Yes" ? "text-green-600 font-medium" : ""}>
                          {metric.Visible_in_Dashboard}
                        </span>
                      </div>
                      <div className="border rounded p-2">
                        <span className="block text-muted-foreground">Decision Making</span>
                        <span className={metric.Used_in_Decision_Making === "Yes" ? "text-green-600 font-medium" : ""}>
                          {metric.Used_in_Decision_Making}
                        </span>
                      </div>
                      <div className="border rounded p-2">
                        <span className="block text-muted-foreground">Executive Requested</span>
                        <span className={metric.Executive_Requested === "Yes" ? "text-green-600 font-medium" : ""}>
                          {metric.Executive_Requested}
                        </span>
                      </div>
                      <div className="border rounded p-2">
                        <span className="block text-muted-foreground">Last Reviewed</span>
                        <span>{metric.Last_Reviewed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p>No metrics found for this department. Please select a department with metrics data.</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
