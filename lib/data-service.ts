import type { Metric } from "./types"

export async function fetchMetricsData(): Promise<Metric[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Week%202%20Problem%204%20Vanity%20Metrics%20Dashboard%20Revised-liqfhn9jgfcYEBqEzmzkaLSb8tvW1I.csv",
    )
    const csvText = await response.text()

    // Parse CSV
    const rows = csvText.split("\n")
    const headers = rows[0].split(",")

    const metrics: Metric[] = []

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue // Skip empty rows

      const values = parseCSVRow(rows[i])
      if (values.length !== headers.length) continue // Skip malformed rows

      const metric: any = {}
      headers.forEach((header, index) => {
        metric[header.trim()] = values[index].trim()
      })

      metrics.push(metric as Metric)
    }

    return metrics
  } catch (error) {
    console.error("Error fetching metrics data:", error)
    return []
  }
}

// Helper function to parse CSV rows correctly (handling commas in quoted fields)
function parseCSVRow(row: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current) // Add the last field
  return result
}
