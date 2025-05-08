import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  color?: string;
}

interface GlobalStats {
  confirmed: number;
  deaths: number;
  recovered: number;
  new_confirmed: number;
  new_deaths: number;
  new_recovered: number;
  last_updated: string;
  last_updated_time: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, color = "text-gray-800" }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-gray-600 text-sm font-medium mb-2">{title}</h2>
      <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
      <p className="text-gray-500 text-sm">{subValue}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get<GlobalStats>('http://localhost:8000/api/v1/covid/global');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching global stats:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchGlobalStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p>No data available</p>
      </div>
    );
  }

  // Formatter les grands nombres avec des séparateurs
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">COVID-19 Dashboard</h1>
        <p className="text-gray-600">Global statistics and country-specific COVID-19 data</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Global Statistics</h2>
        <div className="flex flex-wrap -mx-3">
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <h2 className="text-gray-600 text-sm font-medium mb-2">Confirmed Cases</h2>
              <p className="text-3xl font-bold mb-1 text-gray-800">{formatNumber(stats.confirmed)}</p>
              <p className="text-gray-500 text-sm">+{formatNumber(stats.new_confirmed)} new cases</p>
            </div>
          </div>
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <h2 className="text-gray-600 text-sm font-medium mb-2">Deaths</h2>
              <p className="text-3xl font-bold mb-1 text-red-600">{formatNumber(stats.deaths)}</p>
              <p className="text-gray-500 text-sm">+{formatNumber(stats.new_deaths)} new deaths</p>
            </div>
          </div>
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <h2 className="text-black-800 text-sm font-medium mb-2">Recovered</h2>
              <p className="text-3xl font-bold mb-1 text-green-800">{formatNumber(stats.recovered)}</p>
              <p className="text-green-700 text-sm">+{formatNumber(stats.new_recovered)} new recovered</p>
            </div>
          </div>
          <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <h2 className="text-gray-600 text-sm font-medium mb-2">Last Updated</h2>
              <p className="text-3xl font-bold mb-1 text-gray-800">{stats.last_updated || "N/A"}</p>
              <p className="text-gray-500 text-sm">{stats.last_updated_time || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-16">
        <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
          View all countries <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        COVID-19 Dashboard - Connected to real database
      </div>
    </div>
  );
};

export default Dashboard;