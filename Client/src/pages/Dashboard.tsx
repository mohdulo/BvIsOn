// Client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { fetchGlobalStats, GlobalStats } from "../api/stats";

const formatNumber = (num: number) => num.toLocaleString();

const StatCard = ({
  title,
  value,
  subValue,
  color = "text-gray-800",
}: {
  title: string;
  value: string;
  subValue: string;
  color?: string;
}) => (
  <div className="bg-white rounded-lg shadow p-6 h-full">
    <h2 className="text-gray-600 text-sm font-medium mb-2">{title}</h2>
    <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
    <p className="text-gray-500 text-sm">{subValue}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchGlobalStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 5 * 60_000); // refresh toutes les 5 min
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error ?? "No data available"}
        </div>
      </div>
    );
  }

  const [date, time = ""] = stats.last_updated.split("T");

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          COVID-19 Dashboard
        </h1>
        <p className="text-gray-600">
          Global statistics and country-specific COVID-19 data
        </p>
      </header>

      {/* Global Stats */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Global Statistics
        </h2>
        <div className="flex flex-wrap -mx-3">
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <StatCard
              title="Confirmed Cases"
              value={formatNumber(stats.confirmed)}
              subValue={`+${formatNumber(stats.new_confirmed)} new cases`}
            />
          </div>
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <StatCard
              title="Deaths"
              value={formatNumber(stats.deaths)}
              subValue={`+${formatNumber(stats.new_deaths)} new deaths`}
              color="text-red-600"
            />
          </div>
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <StatCard
              title="Recovered"
              value={formatNumber(stats.recovered)}
              subValue={`+${formatNumber(stats.new_recovered)} new recovered`}
              color="text-green-700"
            />
          </div>
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <StatCard
              title="Last Updated"
              value={date}
              subValue={time.replace("Z", "")}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-end mb-16">
        <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
          View all countries <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      <footer className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        COVID-19 Dashboard – Connected to real database
      </footer>
    </div>
  );
};

export default Dashboard;
