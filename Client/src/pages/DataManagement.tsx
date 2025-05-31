import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import {
  CountryData,
  fetchCountries,
  saveCountry,
} from "../api/manage";
import CountryTable from "./CountryTable";

/* util */
const formatNumber = (n: number) => n.toLocaleString();

interface SortConfig {
  key: keyof CountryData;
  direction: "asc" | "desc";
}

/* ------------------------------------------------------------ */
const DataManagement: React.FC = () => {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "country", direction: "asc" });
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  /* edition */
  const [editCountryId, setEditCountryId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<CountryData, "id"> | null>(null);

  /* ---------------- initial fetch ---------------- */
  useEffect(() => {
    (async () => {
      try {
        setCountries(await fetchCountries());
      } catch (e) {
        console.error(e);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- helpers ---------------- */
  const requestSort = (key: keyof CountryData) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const filteredAndSortedCountries = useMemo(() => {
    let data = countries;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((c) => c.country.toLowerCase().includes(term));
    }
    data = [...data].sort((a, b) => {
      const av = a[sortConfig.key] as number | string;
      const bv = b[sortConfig.key] as number | string;
      if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [countries, searchTerm, sortConfig]);

  /* ---------------- edition ---------------- */
  const handleEditRow = (id: string) => {
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
      alert("Save failed");
    } finally {
      handleCancelEdit();
    }
  };

  /* ---------------- soft‑delete UI only ---------------- */
  const handleDeleteRow = (id: string) => {
    if (!window.confirm("Remove this country from the view? (DB intact)")) return;
    setCountries((cs) => cs.filter((c) => c.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!editData) return;
    setEditData((prev) => ({
      ...prev!,
      [name]: name === "country" ? value : Number(value),
    }));
  };

  /* ---------------- render guards ---------------- */
  if (loading) return <p className="p-8">Chargement…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  /* ---------------- JSX ---------------- */
  return (
    <div className="p-8">
      {/* header & filter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Management</h1>
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={() => setShowFilterMenu((v) => !v)}
          >
            <Filter size={18} className="mr-2" />Filter
            <ChevronDown size={14} className="ml-2" />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
              {(["country", "totalCases", "totalDeaths", "totalRecovered"] as const).map((k) => (
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* search */}
      <div className="mb-6 flex justify-end">
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

      {/* table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <CountryTable
          countries={filteredAndSortedCountries}
          sortConfig={sortConfig}
          requestSort={requestSort}
          editCountryId={editCountryId}
          editData={editData}
          onInputChange={handleInputChange}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
          formatNumber={formatNumber}
        />
      </div>

      <footer className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">COVID‑19 Dashboard – Data Management</footer>
    </div>
  );
};

export default DataManagement;
