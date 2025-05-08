import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface CountryData {
  id: string;
  country: string;
  totalCases: number;
  totalDeaths: number;
  totalRecovered: number;
  isEditing?: boolean;
}

const DataManagement: React.FC = () => {
  // État pour les données des pays
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'country',
    direction: 'asc' as 'asc' | 'desc'
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // État pour la modification des données
  const [editData, setEditData] = useState<{
    country: string;
    totalCases: number;
    totalDeaths: number;
    totalRecovered: number;
  } | null>(null);
  const [editCountryId, setEditCountryId] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    // Simulation de données pour les pays
    const mockData: CountryData[] = [
      { id: '1', country: 'Australia', totalCases: 4563618, totalDeaths: 9079, totalRecovered: 3953961 },
      { id: '2', country: 'Brazil', totalCases: 4330237, totalDeaths: 392368, totalRecovered: 2669804.5 },
      { id: '3', country: 'Canada', totalCases: 765237, totalDeaths: 20576, totalRecovered: 440442.5 },
      { id: '4', country: 'China', totalCases: 4196441, totalDeaths: 239710, totalRecovered: 3480372.5 },
      { id: '5', country: 'Egypt', totalCases: 1450030, totalDeaths: 81315, totalRecovered: 1199911 },
      { id: '6', country: 'France', totalCases: 5832345, totalDeaths: 112376, totalRecovered: 4567890 },
      { id: '7', country: 'Germany', totalCases: 4328901, totalDeaths: 98765, totalRecovered: 3872456 },
      { id: '8', country: 'India', totalCases: 6872345, totalDeaths: 457289, totalRecovered: 5783452 },
      { id: '9', country: 'Italy', totalCases: 3927834, totalDeaths: 89472, totalRecovered: 3265431 },
      { id: '10', country: 'Japan', totalCases: 2987654, totalDeaths: 34567, totalRecovered: 2687543 },
      { id: '11', country: 'Kenya', totalCases: 876543, totalDeaths: 21345, totalRecovered: 765432 },
      { id: '12', country: 'Mexico', totalCases: 3245678, totalDeaths: 178965, totalRecovered: 2876543 },
      { id: '13', country: 'Nigeria', totalCases: 987654, totalDeaths: 34567, totalRecovered: 876543 },
      { id: '14', country: 'Russia', totalCases: 5432178, totalDeaths: 234567, totalRecovered: 4876543 },
      { id: '15', country: 'South Africa', totalCases: 2765489, totalDeaths: 98763, totalRecovered: 2345678 },
      { id: '16', country: 'South Korea', totalCases: 1876543, totalDeaths: 19876, totalRecovered: 1765432 },
      { id: '17', country: 'United Kingdom', totalCases: 4987654, totalDeaths: 147832, totalRecovered: 4567890 },
      { id: '18', country: 'United States', totalCases: 7654321, totalDeaths: 567890, totalRecovered: 6543210 }
    ];
    
    setCountries(mockData);
  }, []);

  // Formatage des nombres
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  // Fonction pour trier les colonnes
  const requestSort = (key: keyof CountryData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Appliquer le tri et le filtrage
  const filteredAndSortedCountries = React.useMemo(() => {
    let filteredData = [...countries];
    
    if (searchTerm) {
      filteredData = filteredData.filter(country => 
        country.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof CountryData];
      const bValue = b[sortConfig.key as keyof CountryData];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filteredData;
  }, [countries, searchTerm, sortConfig]);

  // Gérer le mode d'édition
  const handleEdit = (id: string) => {
    const country = countries.find(c => c.id === id);
    if (country) {
      setEditCountryId(id);
      setEditData({
        country: country.country,
        totalCases: country.totalCases,
        totalDeaths: country.totalDeaths,
        totalRecovered: country.totalRecovered
      });
    }
  };

  // Gérer l'annulation de l'édition
  const handleCancelEdit = () => {
    setEditCountryId(null);
    setEditData(null);
  };

  // Gérer l'enregistrement des modifications
  const handleSaveEdit = (id: string) => {
    if (editData) {
      setCountries(countries.map(country => 
        country.id === id ? { ...country, ...editData } : country
      ));
      setEditCountryId(null);
      setEditData(null);
    }
  };

  // Gérer la suppression d'un pays
  const handleDelete = (id: string) => {
    setCountries(countries.filter(country => country.id !== id));
  };

  // Gérer les mises à jour des champs d'édition
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editData) {
      setEditData({
        ...editData,
        [name]: name === 'country' ? value : Number(value)
      });
    }
  };

  // Rendu d'en-tête de colonne triable
  const SortableHeader = ({ title, column }: { title: string, column: keyof CountryData }) => (
    <th
      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => requestSort(column)}
    >
      <div className="flex items-center">
        {title}
        {sortConfig.key === column ? (
          <span className="ml-2">
            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        ) : null}
      </div>
    </th>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Management</h1>
        <div className="relative">
          <button 
            className="flex items-center px-4 py-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={18} className="mr-2" />
            Filter
            <ChevronDown size={14} className="ml-2" />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => requestSort('country')}>
                  Sort by Country Name
                </button>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => requestSort('totalCases')}>
                  Sort by Total Cases
                </button>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => requestSort('totalDeaths')}>
                  Sort by Total Deaths
                </button>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => requestSort('totalRecovered')}>
                  Sort by Total Recovered
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">COVID-19 Country Data</h2>
          <p className="text-gray-600 mb-4">Manage and update COVID-19 statistics by country.</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Sorting by {sortConfig.key} ({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
            </p>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search countries..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader title="Country" column="country" />
                <SortableHeader title="Total Cases" column="totalCases" />
                <SortableHeader title="Total Deaths" column="totalDeaths" />
                <SortableHeader title="Total Recovered" column="totalRecovered" />
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCountries.map((country) => (
                <tr key={country.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editCountryId === country.id ? (
                      <input
                        type="text"
                        name="country"
                        className="border rounded px-2 py-1 w-full"
                        value={editData?.country || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{country.country}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editCountryId === country.id ? (
                      <input
                        type="number"
                        name="totalCases"
                        className="border rounded px-2 py-1 w-full"
                        value={editData?.totalCases || 0}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formatNumber(country.totalCases)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editCountryId === country.id ? (
                      <input
                        type="number"
                        name="totalDeaths"
                        className="border rounded px-2 py-1 w-full"
                        value={editData?.totalDeaths || 0}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formatNumber(country.totalDeaths)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editCountryId === country.id ? (
                      <input
                        type="number"
                        name="totalRecovered"
                        className="border rounded px-2 py-1 w-full"
                        value={editData?.totalRecovered || 0}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formatNumber(country.totalRecovered)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editCountryId === country.id ? (
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="bg-black text-white px-3 py-1 rounded"
                          onClick={() => handleSaveEdit(country.id)}
                        >
                          Save
                        </button>
                        <button
                          className="border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleEdit(country.id)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleDelete(country.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        COVID-19 Dashboard - Visualization with sample data
      </div>
    </div>
  );
};

export default DataManagement;