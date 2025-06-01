// Client/src/pages/Countries.tsx
import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchCountriesSummary, CountrySummary } from '../api/countries';

const Countries: React.FC = () => {
  const [list, setList] = useState<CountrySummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        setList(await fetchCountriesSummary());
      } catch {
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter(c =>
      c.country.toLowerCase().includes(search.toLowerCase())
    );
  }, [list, search]);

  if (loading) return <p className="p-8">Chargement…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{t('countries_page.title')}</h1>

      <div className="relative w-full mb-8">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('countries_page.search_placeholder')}
          className="pl-10 pr-4 py-2 w-full border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <Link
            key={c.id}
            to={`/countries/${c.id}`}
            className="block transition-transform hover:scale-105"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{c.country}</h2>

              <div className="flex">
                <div className="w-1/2">
                  <p className="text-sm text-gray-600">{t('countries_page.confirmed')}</p>
                  <p className="text-xl font-bold">
                    {c.confirmed_total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    +{c.confirmed_new.toLocaleString()} {t('countries_page.new')}
                  </p>
                </div>
                <div className="w-1/2">
                  <p className="text-sm text-gray-600">{t('countries_page.deaths')}</p>
                  <p className="text-xl font-bold text-red-600">
                    {c.deaths_total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    +{c.deaths_new.toLocaleString()} {t('countries_page.new')}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Countries;
