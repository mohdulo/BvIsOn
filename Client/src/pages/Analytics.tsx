import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Analytics: React.FC = () => {
  // État pour stocker l'onglet actif (Cases, Deaths, Recovered)
  const [activeTab, setActiveTab] = useState('Cases');

  // Données factices pour les graphiques (à remplacer par des données réelles)
  const totalCasesByCountry = [
    { name: 'Italy', cases: 4850000 },
    { name: 'Russia', cases: 4500000 },
    { name: 'Japan', cases: 4200000 },
    { name: 'South Africa', cases: 4000000 },
    { name: 'China', cases: 3800000 },
    { name: 'United States', cases: 3600000 },
    { name: 'Mexico', cases: 3400000 },
    { name: 'Australia', cases: 2800000 },
    { name: 'Brazil', cases: 2400000 },
    { name: 'Nigeria', cases: 2200000 }
  ];

  const newCasesByCountry = [
    { name: 'South Korea', newCases: 10000 },
    { name: 'Japan', newCases: 9500 },
    { name: 'India', newCases: 8500 },
    { name: 'Egypt', newCases: 7800 },
    { name: 'United Kingdom', newCases: 7200 },
    { name: 'Sweden', newCases: 6900 },
    { name: 'Italy', newCases: 6400 },
    { name: 'Kenya', newCases: 6200 },
    { name: 'Nigeria', newCases: 5800 },
    { name: 'Mexico', newCases: 4800 }
  ];

  const cumulativeCasesTrend = [
    { name: 'Italy', cases: 4850000 },
    { name: 'Russia', cases: 4500000 },
    { name: 'Japan', cases: 4200000 },
    { name: 'South Africa', cases: 4000000 },
    { name: 'China', cases: 3800000 },
    { name: 'United States', cases: 3600000 },
    { name: 'Mexico', cases: 3400000 },
    { name: 'Australia', cases: 2800000 },
    { name: 'Brazil', cases: 2400000 },
    { name: 'Nigeria', cases: 2200000 }
  ];

  const totalDeathsByCountry = [
    { name: 'Italy', deaths: 35000 },
    { name: 'Russia', deaths: 290000 },
    { name: 'Japan', deaths: 230000 },
    { name: 'South Africa', deaths: 380725 },
    { name: 'China', deaths: 180000 },
    { name: 'United States', deaths: 220000 },
    { name: 'Mexico', deaths: 10000 },
    { name: 'Australia', deaths: 5000 },
    { name: 'Brazil', deaths: 230000 },
    { name: 'Nigeria', deaths: 25000 }
  ];

  const newDeathsByCountry = [
    { name: 'South Korea', newDeaths: 350 },
    { name: 'Japan', newDeaths: 340 },
    { name: 'India', newDeaths: 320 },
    { name: 'Egypt', newDeaths: 250 },
    { name: 'United Kingdom', newDeaths: 240 },
    { name: 'Sweden', newDeaths: 250 },
    { name: 'Italy', newDeaths: 720 },
    { name: 'Kenya', newDeaths: 850 },
    { name: 'Nigeria', newDeaths: 950 },
    { name: 'Mexico', newDeaths: 600 }
  ];

  const cumulativeDeathsTrend = [
    { name: 'Italy', deaths: 35000 },
    { name: 'Russia', deaths: 290000 },
    { name: 'Japan', deaths: 230000 },
    { name: 'South Africa', deaths: 380725 },
    { name: 'China', deaths: 180000 },
    { name: 'United States', deaths: 345000 },
    { name: 'Mexico', deaths: 10000 },
    { name: 'Australia', deaths: 5000 },
    { name: 'Brazil', deaths: 230000 },
    { name: 'Nigeria', deaths: 210000 }
  ];

  const totalRecoveredByCountry = [
    { name: 'Italy', recovered: 2600000 },
    { name: 'Russia', recovered: 2580000 },
    { name: 'Japan', recovered: 2300000 },
    { name: 'South Africa', recovered: 3350000 },
    { name: 'China', recovered: 2200000 },
    { name: 'United States', recovered: 2580000 },
    { name: 'Mexico', recovered: 2600000 },
    { name: 'Australia', recovered: 2000000 },
    { name: 'Brazil', recovered: 1950000 },
    { name: 'Nigeria', recovered: 1200000 }
  ];

  const newRecoveredByCountry = [
    { name: 'South Korea', newRecovered: 18000 },
    { name: 'Japan', newRecovered: 3000 },
    { name: 'India', newRecovered: 2500 },
    { name: 'Egypt', newRecovered: 12000 },
    { name: 'United Kingdom', newRecovered: 8000 },
    { name: 'Sweden', newRecovered: 7500 },
    { name: 'Italy', newRecovered: 13000 },
    { name: 'Kenya', newRecovered: 13500 },
    { name: 'Nigeria', newRecovered: 7500 },
    { name: 'Mexico', newRecovered: 1500 }
  ];

  const cumulativeRecoveredTrend = [
    { name: 'Italy', recovered: 2600000 },
    { name: 'Russia', recovered: 2580000 },
    { name: 'Japan', recovered: 2300000 },
    { name: 'South Africa', recovered: 3350000 },
    { name: 'China', recovered: 2200000 },
    { name: 'United States', recovered: 2580000 },
    { name: 'Mexico', recovered: 2600000 },
    { name: 'Australia', recovered: 2000000 },
    { name: 'Brazil', recovered: 1950000 },
    { name: 'Nigeria', recovered: 1200000 }
  ];

  // Définir les données actuelles en fonction de l'onglet actif
  const getActiveData = () => {
    switch (activeTab) {
      case 'Cases':
        return {
          totalByCountry: totalCasesByCountry,
          newByCountry: newCasesByCountry,
          cumulativeTrend: cumulativeCasesTrend,
          barColor: '#8884d8',
          lineColor: '#8884d8',
          areaColor: '#8884d8',
          dataKey: 'cases',
          newDataKey: 'newCases'
        };
      case 'Deaths':
        return {
          totalByCountry: totalDeathsByCountry,
          newByCountry: newDeathsByCountry,
          cumulativeTrend: cumulativeDeathsTrend,
          barColor: '#ff5252',
          lineColor: '#ff5252',
          areaColor: '#ff5252',
          dataKey: 'deaths',
          newDataKey: 'newDeaths'
        };
      case 'Recovered':
        return {
          totalByCountry: totalRecoveredByCountry,
          newByCountry: newRecoveredByCountry,
          cumulativeTrend: cumulativeRecoveredTrend,
          barColor: '#4caf50',
          lineColor: '#4caf50',
          areaColor: '#4caf50',
          dataKey: 'recovered',
          newDataKey: 'newRecovered'
        };
      default:
        return {
          totalByCountry: totalCasesByCountry,
          newByCountry: newCasesByCountry,
          cumulativeTrend: cumulativeCasesTrend,
          barColor: '#8884d8',
          lineColor: '#8884d8',
          areaColor: '#8884d8',
          dataKey: 'cases',
          newDataKey: 'newCases'
        };
    }
  };

  const activeData = getActiveData();

  // Formater les nombres pour les tooltips
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };

  // Tooltip personnalisé pour montrer les pays dans les graphiques
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-bold">{payload[0].payload.name}</p>
          <p className="text-sm">
            {activeTab === 'Cases' 
              ? `cases : ${formatNumber(payload[0].value)}`
              : activeTab === 'Deaths'
                ? `deaths : ${formatNumber(payload[0].value)}`
                : `recovered : ${formatNumber(payload[0].value)}`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">COVID-19 Analytics</h1>
      
      {/* Onglets */}
      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'Cases' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('Cases')}
        >
          Cases
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'Deaths' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('Deaths')}
        >
          Deaths
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'Recovered' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('Recovered')}
        >
          Recovered
        </button>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Total par pays */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Total {activeTab.toLowerCase()} by Country
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Top 10 countries with highest totals
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeData.totalByCountry}
                margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={activeData.dataKey} 
                  fill={activeData.barColor} 
                  name={activeTab} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nouveaux cas par pays */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            New {activeTab.toLowerCase()} by Country
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Top 10 countries with highest new counts
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeData.newByCountry}
                margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={activeData.newDataKey}
                  stroke={activeData.lineColor}
                  activeDot={{ r: 8 }}
                  name={`new${activeTab}`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tendance cumulative */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Cumulative {activeTab.toLowerCase()} Trend
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Showing distribution across top countries
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activeData.cumulativeTrend}
              margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={activeData.dataKey}
                stroke={activeData.lineColor}
                fill={activeData.areaColor}
                fillOpacity={0.3}
                name={activeTab}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        COVID-19 Dashboard - Visualization with sample data
      </div>
    </div>
  );
};

export default Analytics;