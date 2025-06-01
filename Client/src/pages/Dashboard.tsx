import React, { useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  YAxis,
  Legend,
} from "recharts";

import {
  GlobalStats,
  CountrySummary,
  fetchGlobalStats,
  fetchCountriesSummary,
} from "../api/stats";

const formatNumber = (n: number) => n.toLocaleString();
const COLORS = ["#2563eb", "#dc2626", "#16a34a"]; // blue, red, green

const StatCard = ({
  label,
  value,
  delta,
  color,
  t
}: {
  label: string;
  value: number;
  delta: number;
  color: string;
  t: (key: string) => string;
}) => (
  <div className="bg-white rounded-2xl shadow p-6 flex-1 min-w-[12rem]">
    <h3 className="text-sm text-gray-500 mb-1 font-medium">{label}</h3>
    <p className={`text-3xl font-semibold ${color}`}>{formatNumber(value)}</p>
    <p className="text-xs text-gray-400 mt-1">+{formatNumber(delta)} {t('dashboard.today')}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [global, setGlobal] = useState<GlobalStats | null>(null);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const loadData = async () => {
    try {
      setLoading(true);
      const [g, c] = await Promise.all([
        fetchGlobalStats(),
        fetchCountriesSummary(),
      ]);
      setGlobal(g);
      setCountries(
        c.sort((a, b) => b.confirmed_total - a.confirmed_total).slice(0, 10)
      );
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5 * 60_000);
    return () => clearInterval(id);
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );

  if (error || !global)
    return (
      <div className="p-8 text-center text-red-600 font-medium">{error}</div>
    );

  const lastUpdated = new Date(global.last_updated);
  const lastUpdatedStr = lastUpdated.toLocaleString();

  const pieData = [
    { name: t("dashboard.confirmed"), value: global.confirmed },
    { name: t("dashboard.deaths"), value: global.deaths },
    { name: t("dashboard.recovered"), value: global.recovered },
  ];

  return (
    <div className="p-6 md:p-10 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
        <p className="text-gray-500">{t('dashboard.subtitle')}</p>
        <p className="text-xs text-gray-400">
          {t('dashboard.lastUpdate', { date: lastUpdatedStr })}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label={t('dashboard.confirmed')}
          value={global.confirmed}
          delta={global.new_confirmed}
          color="text-blue-600"
          t={t}
        />
        <StatCard
          label={t('dashboard.deaths')}
          value={global.deaths}
          delta={global.new_deaths}
          color="text-red-600"
          t={t}
        />
        <StatCard
          label={t('dashboard.recovered')}
          value={global.recovered}
          delta={global.new_recovered}
          color="text-green-600"
          t={t}
        />
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                paddingAngle={3}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                const label = typeof name === 'string' ? name.replace('_total', '').toLowerCase() : '';
                return [formatNumber(value as number), t(`dashboard.${label}`)];
              }}

/>

              <Legend verticalAlign="bottom" height={24} iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            {t('dashboard.chartTitle')}
          </h2>
          <Link to="/countries" className="flex items-center text-blue-600 hover:underline">
            {t('dashboard.viewAll')} <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countries} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" tickFormatter={formatNumber} hide />
              <YAxis
                type="category"
                dataKey="country"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(v: number) => formatNumber(v as number)} />
              <Bar
                dataKey="confirmed_total"
                fill="#2563eb"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <footer className="pt-12 text-center text-sm text-gray-400">
        {t('dashboard.footer')}
      </footer>
    </div>
  );
};

export default Dashboard;
