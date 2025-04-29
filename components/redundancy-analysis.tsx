"use client"

import { useMemo } from "react"
import type { Metric } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface RedundancyAnalysisProps {
  metrics: Metric[]
  departments: string[]
  selectedDepartment: string
}

export function RedundancyAnalysis({ metrics, departments, selectedDepartment }: RedundancyAnalysisProps) {
  // Find metrics that are tracked in multiple departments
  const redundantMetrics = useMemo(() => {
    // Group metrics by name
    const metricGroups = metrics.reduce(
      (groups, metric) => {
        if (!groups[metric.Metric_Name]) {
          groups[metric.Metric_Name] = []
        }
        groups[metric.Metric_Name].push(metric)
        return groups
      },
      {} as Record<string, Metric[]>,
    )

    // Filter for metrics used in multiple departments
    return Object.entries(metricGroups)
      .filter(([_, metrics]) => metrics.length > 1)
      .map(([metricName, metrics]) => {
        const departments = metrics.map((m) => m.Department)
        const visibleCount = metrics.filter((m) => m.Visible_in_Dashboard === "Yes").length
        const usedCount = metrics.filter((m) => m.Used_in_Decision_Making === "Yes").length
        const requestedCount = metrics.filter((m) => m.Executive_Requested === "Yes").length

        return {
          metricName,
          departments,
          metrics,
          visibleCount,
          usedCount,
          requestedCount,
          redundancyScore: departments.length,
          efficiencyScore: usedCount / departments.length,
        }
      })
      .sort((a, b) => b.redundancyScore - a.redundancyScore)
  }, [metrics])

  // Recommendations for the selected department
  const departmentRecommendations = useMemo(() => {
    if (!selectedDepartment) return []

    return redundantMetrics
      .filter((rm) => rm.departments.includes(selectedDepartment))
      .map((rm) => {
        const deptMetric = rm.metrics.find((m) => m.Department === selectedDepartment)
        const otherDeptMetrics = rm.metrics.filter((m) => m.Department !== selectedDepartment)

        // Check if this department uses the metric for decisions
        const isUsedInDept = deptMetric?.Used_in_Decision_Making === "Yes"

        // Check if other departments use it for decisions
        const usedInOtherDepts = otherDeptMetrics.some((m) => m.Used_in_Decision_Making === "Yes")

        let recommendation = ""
        let type = ""

        if (isUsedInDept && !usedInOtherDepts) {
          recommendation = `Your department is the only one using "${rm.metricName}" for decision making. Consider sharing your insights with ${otherDeptMetrics.map((m) => m.Department).join(", ")}.`
          type = "share"
        } else if (!isUsedInDept && usedInOtherDepts) {
          const deptsThatUse = otherDeptMetrics
            .filter((m) => m.Used_in_Decision_Making === "Yes")
            .map((m) => m.Department)
          recommendation = `"${rm.metricName}" is used for decision making in ${deptsThatUse.join(", ")} but not in your department. Consider learning how they use this metric.`
          type = "learn"
        } else if (isUsedInDept && usedInOtherDepts) {
          recommendation = `"${rm.metricName}" is used for decision making across multiple departments including yours. Consider establishing a cross-department standard for this metric.`
          type = "standardize"
        } else {
          recommendation = `"${rm.metricName}" is tracked across multiple departments including yours, but isn't used for decision making. Consider if this is a vanity metric that could be consolidated or removed.`
          type = "consolidate"
        }

        return {
          metricName: rm.metricName,
          recommendation,
          type,
        }
      })
  }, [redundantMetrics, selectedDepartment])

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric Name</TableHead>
              <TableHead>Departments</TableHead>
              <TableHead className="text-center">Redundancy Score</TableHead>
              <TableHead className="text-center">Efficiency Score</TableHead>
              <TableHead className="text-center">Dashboard Visibility</TableHead>
              <TableHead className="text-center">Decision Usage</TableHead>
              <TableHead>Recommendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redundantMetrics.map((rm, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{rm.metricName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {rm.departments.map((dept, i) => (
                      <Badge key={i} variant="outline" className={dept === selectedDepartment ? "bg-primary/20" : ""}>
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={rm.redundancyScore > 3 ? "destructive" : "secondary"}>{rm.redundancyScore}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={rm.efficiencyScore >= 0.5 ? "default" : "outline"}>
                    {(rm.efficiencyScore * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {rm.visibleCount}/{rm.departments.length}
                </TableCell>
                <TableCell className="text-center">
                  {rm.usedCount}/{rm.departments.length}
                </TableCell>
                <TableCell>
                  {rm.efficiencyScore < 0.5
                    ? "Potential redundancy - consolidate tracking"
                    : "Valuable across departments - standardize"}
                </TableCell>
              </TableRow>
            ))}
            {redundantMetrics.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No redundant metrics found across departments.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedDepartment && departmentRecommendations.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recommendations for {selectedDepartment}</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-2">
              {departmentRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge
                    variant={
                      rec.type === "share"
                        ? "default"
                        : rec.type === "learn"
                          ? "secondary"
                          : rec.type === "standardize"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {rec.type}
                  </Badge>
                  <span>{rec.recommendation}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
