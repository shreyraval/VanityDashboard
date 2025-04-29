"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Filter, Search } from "lucide-react"
import type { Metric } from "@/lib/types"

interface MetricsTableProps {
  metrics: Metric[]
  selectedDepartment: string
}

export function MetricsTable({ metrics, selectedDepartment }: MetricsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterVisible, setFilterVisible] = useState<string | null>(null)
  const [filterUsed, setFilterUsed] = useState<string | null>(null)
  const [filterRequested, setFilterRequested] = useState<string | null>(null)

  // Filter metrics based on department and search term
  const filteredMetrics = metrics.filter((metric) => {
    // Department filter
    if (selectedDepartment && metric.Department !== selectedDepartment) {
      return false
    }

    // Search filter
    if (searchTerm && !metric.Metric_Name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Visibility filter
    if (filterVisible !== null && metric.Visible_in_Dashboard !== filterVisible) {
      return false
    }

    // Used in decision making filter
    if (filterUsed !== null && metric.Used_in_Decision_Making !== filterUsed) {
      return false
    }

    // Executive requested filter
    if (filterRequested !== null && metric.Executive_Requested !== filterRequested) {
      return false
    }

    return true
  })

  const getMetricStatusBadge = (metric: Metric) => {
    if (metric.Used_in_Decision_Making === "Yes" && metric.Executive_Requested === "Yes") {
      return <Badge className="bg-green-500">High Value</Badge>
    } else if (metric.Used_in_Decision_Making === "No" && metric.Executive_Requested === "Yes") {
      return <Badge className="bg-yellow-500">Potential Vanity</Badge>
    } else if (metric.Used_in_Decision_Making === "Yes" && metric.Executive_Requested === "No") {
      return <Badge className="bg-blue-500">Team Value</Badge>
    } else {
      return <Badge variant="outline">Low Priority</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search metrics..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                <Filter className="h-4 w-4" />
                Visible
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterVisible(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterVisible("Yes")}>Yes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterVisible("No")}>No</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                <Filter className="h-4 w-4" />
                Used
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterUsed(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterUsed("Yes")}>Yes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterUsed("No")}>No</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                <Filter className="h-4 w-4" />
                Requested
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterRequested(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterRequested("Yes")}>Yes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterRequested("No")}>No</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Dashboard</TableHead>
              <TableHead>Decision Making</TableHead>
              <TableHead>Executive Requested</TableHead>
              <TableHead>Last Reviewed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMetrics.length > 0 ? (
              filteredMetrics.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{metric.Metric_Name}</TableCell>
                  <TableCell>{metric.Department}</TableCell>
                  <TableCell>{metric.Visible_in_Dashboard}</TableCell>
                  <TableCell>{metric.Used_in_Decision_Making}</TableCell>
                  <TableCell>{metric.Executive_Requested}</TableCell>
                  <TableCell>{metric.Last_Reviewed}</TableCell>
                  <TableCell>{getMetricStatusBadge(metric)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No metrics found matching the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
