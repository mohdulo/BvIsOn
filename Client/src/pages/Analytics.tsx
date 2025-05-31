import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

import {
  fetchAnalyticsData,
  fetchTopCountries,
  AnalyticsData,
  CountryData,
  testEndpoints,
} from "../api/analytics";

/**
 * Types & helpers ------------------------------------------------------------------
 */

// Onglets primitifs existants
export type MetricType = "cases" | "deaths" | "recovered";

interface MetricConfig {
  label: string;
  displayLabel: string;
  barColor: string;
  lineColor: string;
  bgColor: string;
  textColor: string;
}

interface CombinedRates {
  name: string;
  mortalityRate: number; // %
  recoveryRate: number; // %
}

const formatNumber = (n: number) => n.toLocaleString();
const formatPercent = (n: number) => `${n.toFixed(1)}%`;

/**
 * Composant Analytics ----------------------------------------------------------------
 */
const Analytics: React.FC = () => {
  /** ---------------------------------------------------------------- Tabs & configs */
  const [activeTab, setActiveTab] = useState<MetricType>("cases");

  const metricConfigs: Record<MetricType, MetricConfig> = {
    cases: {
      label: "Cases",
      displayLabel: "cases",
      barColor: "#3b82f6",
      lineColor: "#3b82f6",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    deaths: {
      label: "Deaths",
      displayLabel: "deaths",
      barColor: "#ef4444",
      lineColor: "#ef4444",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    recovered: {
      label: "Recovered",
      displayLabel: "recovered",
      barColor: "#10b981",
      lineColor: "#10b981",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
  };

  const activeConfig = metricConfigs[activeTab];

  /** ---------------------------------------------------------------- API state */
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [combinedRates, setCombinedRates] = useState<CombinedRates[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);

  /** ---------------------------------------------------------------- Data loaders */
  const loadAnalyticsData = async (metric: MetricType) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAnalyticsData(metric);
      setAnalyticsData(data);
    } catch (err) {
      console.error("Erreur lors du chargement des données analytics:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Chargement des ratios (mortality / recovery) — une seule fois ou manuellement via Refresh
  const loadCombinedRates = async () => {
    try {
      setLoadingRates(true);
      // On se base sur les 10 pays avec le plus de cas (logique pour comparer)
      const [cases, deaths, recovered] = await Promise.all<CountryData[]>([
        fetchTopCountries("cases", 10),
        fetchTopCountries("deaths", 10),
        fetchTopCountries("recovered", 10),
      ]);

      const merged: CombinedRates[] = cases.map((c) => {
        const d = deaths.find((x) => x.name === c.name)?.value ?? 0;
        const r = recovered.find((x) => x.name === c.name)?.value ?? 0;
        return {
          name: c.name.toUpperCase(),
          mortalityRate: c.value ? (d / c.value) * 100 : 0,
          recoveryRate: c.value ? (r / c.value) * 100 : 0,
        };
      });
      setCombinedRates(merged);
    } catch (e) {
      console.error("Erreur lors du calcul des ratios:", e);
    } finally {
      setLoadingRates(false);
    }
  };

  /** ---------------------------------------------------------------- Side-effects */
  useEffect(() => {
    loadAnalyticsData(activeTab);
  }, [activeTab]);

  // onMount : charger les ratios
  useEffect(() => {
    loadCombinedRates();
  }, []);

  /** ---------------------------------------------------------------- Handlers */
  const handleTabChange = (metric: MetricType) => setActiveTab(metric);
  const handleRefresh = () => {
    loadAnalyticsData(activeTab);
    loadCombinedRates();
  };
  const handleTestEndpoints = () => testEndpoints(activeTab);

  /** ---------------------------------------------------------------- Memo helpers */
  const barChartCountries = useMemo(() => {
    return analyticsData?.totalByCountry.map((d) => ({
      ...d,
      name: d.name.toUpperCase(),
    }));
  }, [analyticsData]);

  const lineChartCountries = useMemo(() => {
    return analyticsData?.newByCountry.map((d) => ({
      ...d,
      name: d.name.toUpperCase(),
    }));
  }, [analyticsData]);

  /** ---------------------------------------------------------------- Tooltips */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            {activeConfig.displayLabel}: <span className="font-medium">{formatNumber(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const RatesTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name } = payload[0].payload;
      const mortality = payload.find((p: any) => p.dataKey === "mortalityRate")?.value ?? 0;
      const recovery = payload.find((p: any) => p.dataKey === "recoveryRate")?.value ?? 0;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-bold text-gray-800 mb-1">{name}</p>
          <p className="text-xs text-gray-600">Mortality: {formatPercent(mortality)}</p>
          <p className="text-xs text-gray-600">Recovery: {formatPercent(recovery)}</p>
        </div>
      );
    }
    return null;
  };

  /** ---------------------------------------------------------------- Render states */
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">COVID-19 Analytics</h1>
        <p className="text-gray-600">Loading analytics data…</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">COVID-19 Analytics</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
          <span>{error ?? "No analytics data available"}</span>
          <button
            onClick={handleRefresh}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <RefreshCw size={16} className="mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  /** ---------------------------------------------------------------- JSX */
  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">COVID-19 Analytics</h1>
        <p className="text-gray-600">Interactive dashboards for data analysts</p>
      </header>

      {/* Tabs & actions */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 mb-6">
        <div className="flex space-x-2">
          {Object.entries(metricConfigs).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleTabChange(key as MetricType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring ${
                activeTab === key ? `${cfg.bgColor} ${cfg.textColor}` : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleTestEndpoints}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors"
          >
            Test Endpoints
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading || loadingRates}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${loading || loadingRates ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Total by country */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Total {activeConfig.label} by Country</h2>
          <p className="text-sm text-gray-600 mb-4">Top 10 countries with highest totals</p>
          <div className="h-80">
            {barChartCountries && barChartCountries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartCountries}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barSize={30}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill={activeConfig.barColor}
                    name={activeConfig.label}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* New by country (line) */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">New {activeConfig.label} by Country</h2>
          <p className="text-sm text-gray-600 mb-4">Top 10 countries with highest new counts (latest)</p>
          <div className="h-80">
            {lineChartCountries && lineChartCountries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartCountries} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={activeConfig.lineColor}
                    strokeWidth={3}
                    dot={{ fill: activeConfig.lineColor, r: 5 }}
                    activeDot={{ r: 8, strokeWidth: 2, stroke: activeConfig.lineColor }}
                    name={`New ${activeConfig.label}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Mortality vs Recovery chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Mortality vs Recovery (Top 10 Cases)</h2>
        <p className="text-sm text-gray-600 mb-4">Rates relative to confirmed cases – lower mortality is better</p>
        <div className="h-96">
          {combinedRates && combinedRates.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedRates} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis tickFormatter={formatPercent} tick={{ fontSize: 12, fill: "#666" }} domain={[0, "dataMax + 5"]} />
                <Tooltip content={<RatesTooltip />} />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Bar
                  dataKey="mortalityRate"
                  name="Mortality %"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="recoveryRate"
                  name="Recovery %"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">{loadingRates ? "Calculating rates…" : "No rate data available"}</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        COVID-19 Analytics Dashboard – Powered by FastAPI & React
      </footer>
    </div>
  );
};

export default Analytics;
