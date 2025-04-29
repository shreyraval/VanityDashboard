import { MetricsAnalysisDashboard } from "@/components/metrics-analysis-dashboard"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Metrics Analysis Framework</h1>
      <p className="text-gray-600 mb-8">
        Analyze how metrics are used across departments to identify redundancies and distinguish valuable metrics from
        vanity metrics.
      </p>
      <MetricsAnalysisDashboard />
    </div>
  )
}
