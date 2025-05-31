import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface CountryDetailData {
  name: string;
  stats: {
    confirmed: {
      total: string;
      new: string;
    };
    deaths: {
      total: string;
      new: string;
    };
    recovered: {
      total: string;
      new: string;
    };
  };
  info: {
    code: string;
    lastUpdated: string;
  };
}

const StatCard: React.FC<{
  title: string;
  value: string;
  newValue: string;
  color?: string;
}> = ({ title, value, newValue, color = "text-gray-800" }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <div className="flex items-center mt-2">
        <span className="bg-gray-200 rounded-full w-2 h-2 mr-2"></span>
        <span className="text-sm text-gray-600">New: {newValue}</span>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div>
      <p className="text-gray-600 mb-1">{label}</p>
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  );
};

const CountryDetail: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const [countryData, setCountryData] = useState<CountryDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données depuis une API
    setLoading(true);
    
    // Dans une application réelle, vous feriez un appel API ici
    // fetch(`/api/countries/${countryId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setCountryData(data);
    //     setLoading(false);
    //   });
    
    // Simulation de données pour la démonstration
    setTimeout(() => {
      // Données factices pour Nigeria, à remplacer par des données réelles
      const mockData: CountryDetailData = {
        name: countryId?.charAt(0).toUpperCase() + countryId?.slice(1) || 'Country',
        stats: {
          confirmed: {
            total: '4,161,120',
            new: '+4,518'
          },
          deaths: {
            total: '87,587',
            new: '+240'
          },
          recovered: {
            total: '3,973,108',
            new: '+9,497'
          }
        },
        info: {
          code: countryId?.toUpperCase().substring(0, 2) || 'XX',
          lastUpdated: '4/30/2025'
        }
      };
      
      setCountryData(mockData);
      setLoading(false);
    }, 500);
  }, [countryId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center text-blue-600 mb-6">
          <ArrowLeft size={16} className="mr-2" />
          <Link to="/countries" className="hover:underline">Back to all countries</Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading country data...</p>
        </div>
      </div>
    );
  }

  if (!countryData) {
    return (
      <div className="p-8">
        <div className="flex items-center text-blue-600 mb-6">
          <ArrowLeft size={16} className="mr-2" />
          <Link to="/countries" className="hover:underline">Back to all countries</Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Country not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center text-blue-600 mb-6">
        <ArrowLeft size={16} className="mr-2" />
        <Link to="/countries" className="hover:underline">Back to all countries</Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{countryData.name}</h1>
        <p className="text-gray-600">COVID-19 statistics for {countryData.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Confirmed Cases" 
          value={countryData.stats.confirmed.total} 
          newValue={countryData.stats.confirmed.new} 
        />
        <StatCard 
          title="Deaths" 
          value={countryData.stats.deaths.total} 
          newValue={countryData.stats.deaths.new}
          color="text-red-600" 
        />
        <StatCard 
          title="Recovered" 
          value={countryData.stats.recovered.total} 
          newValue={countryData.stats.recovered.new}
          color="text-green-600" 
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Country Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Country Code" value={countryData.info.code} />
          <InfoItem label="Last Updated" value={countryData.info.lastUpdated} />
        </div>
      </div>

      <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        COVID-19 Dashboard - Visualization with sample data
      </div>
    </div>
  );
};

export default CountryDetail;