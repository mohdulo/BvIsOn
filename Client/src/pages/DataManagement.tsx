import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  CountryData,
  fetchCountries,  // GET /covid/manage/countries
  saveCountry,    // PUT /covid/manage/countries/:id
  deleteCountry,  // DELETE /covid/manage/countries/:id
} from '../api/manage';

const DataManagement: React.FC = () => {
  /* -------------------- états -------------------- */
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CountryData;
    direction: 'asc' | 'desc';
  }>({ key: 'country', direction: 'asc' });
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  /* édition */
  const [editCountryId, setEditCountryId] = useState<string | null>(null);
  const [editData, setEditData] = useState<
    Omit<CountryData, 'id'> | null
  >(null);

  /* ------------------- chargement initial ------------------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ------------------- helpers ------------------- */
  const formatNumber = (num: number) => num.toLocaleString();

  const requestSort = (key: keyof CountryData) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedCountries = useMemo(() => {
    let data = countries;

    if (searchTerm) {
      data = data.filter((c) =>
        c.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    data = [...data].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [countries, searchTerm, sortConfig]);

  /* ------------------- édition ------------------- */
  const handleEdit = (id: string) => {
    const c = countries.find((x) => x.id === id);
    if (!c) return;
    setEditCountryId(id);
    setEditData({
      country: c.country,
      totalCases: c.totalCases,
      totalDeaths: c.totalDeaths,
      totalRecovered: c.totalRecovered,
    });
  };

  const handleCancelEdit = () => {
    setEditCountryId(null);
    setEditData(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editData) return;
    try {
      const saved = await saveCountry({ id, ...editData });
      setCountries((cs) => cs.map((c) => (c.id === id ? saved : c)));
    } catch {
      alert('Save failed');
    } finally {
      handleCancelEdit();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this country?')) return;
    try {
      await deleteCountry(id);
      setCountries((cs) => cs.filter((c) => c.id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!editData) return;
    setEditData({
      ...editData,
      [name]:
        name === 'country' ? value : (Number(value) as unknown as never),
    });
  };

  /* ------------------- rendu ------------------- */
  if (loading) return <p className="p-8">Chargement…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  const SortableHeader = ({
    title,
    column,
  }: {
    title: string;
    column: keyof CountryData;
  }) => (
    <th
      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => requestSort(column)}
    >
      <div className="flex items-center">
        {title}
        {sortConfig.key === column && (
          <span className="ml-2">
            {sortConfig.direction === 'asc' ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </span>
        )}
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
              {(['country', 'totalCases', 'totalDeaths', 'totalRecovered'] as const).map(
                (k) => (
                  <button
                    key={k}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      requestSort(k);
                      setShowFilterMenu(false);
                    }}
                  >
                    Sort by {k}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            COVID-19 Country Data
          </h2>
          <p className="text-gray-600 mb-4">
            Manage and update COVID-19 statistics by country.
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Sorting by {sortConfig.key} (
              {sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
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
                <SortableHeader
                  title="Total Recovered"
                  column="totalRecovered"
                />
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCountries.map((c) => (
                <tr key={c.id}>
                  {editCountryId === c.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="country"
                          className="border rounded px-2 py-1 w-full"
                          value={editData?.country ?? ''}
                          onChange={handleInputChange}
                        />
                      </td>
                      {(['totalCases', 'totalDeaths', 'totalRecovered'] as const).map(
                        (f) => (
                          <td key={f} className="px-6 py-4">
                            <input
                              type="number"
                              name={f}
                              className="border rounded px-2 py-1 w-full"
                              value={editData?.[f] ?? 0}
                              onChange={handleInputChange}
                            />
                          </td>
                        )
                      )}
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {c.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatNumber(c.totalCases)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatNumber(c.totalDeaths)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatNumber(c.totalRecovered)}
                      </td>
                    </>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editCountryId === c.id ? (
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="bg-black text-white px-3 py-1 rounded"
                          onClick={() => handleSaveEdit(c.id)}
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
                          onClick={() => handleEdit(c.id)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleDelete(c.id)}
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
        COVID-19 Dashboard – Data Management
      </div>
    </div>
  );
};

export default DataManagement;
