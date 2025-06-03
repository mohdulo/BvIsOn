// Client/src/pages/Countries.tsx
import { useTranslation } from 'react-i18next';
// src/pages/Countries.tsx - VOTRE DESIGN ORIGINAL AVEC AUTHENTIFICATION
import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// ✅ Interface mise à jour pour correspondre au backend
interface CountrySummary {
  id: string;
  country: string;
  confirmed_total: number;
  confirmed_new: number;
  deaths_total: number;
  deaths_new: number;
}

// ✅ Import de l'API sécurisée au lieu de l'ancienne
import { api } from '../api/index';

const fetchCountriesSummary = async (): Promise<CountrySummary[]> => {
  try {
    console.log('🔍 Fetching countries summary...');
    const response = await api.get<CountrySummary[]>('/covid/countries/summary');
    console.log('✅ Countries summary received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching countries summary:', error);
    
    // Gestion spécifique des erreurs d'authentification
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error('Accès refusé. Veuillez vous reconnecter.');
    }
    
    throw new Error('Erreur lors du chargement des données.');
  }
};

const Countries: React.FC = () => {
  const [list, setList] = useState<CountrySummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        setError(null); // Reset de l'erreur
        const data = await fetchCountriesSummary();
        setList(data);
      } catch (err: any) {
        console.error('Countries page error:', err);
        setError(err.message || 'Erreur lors du chargement des données.');
        
        // Redirection automatique si erreur d'authentification
        if (err.message?.includes('reconnecter')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        }
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

  // ✅ VOTRE STYLING ORIGINAL - Loading
  if (loading) return <p className="p-8">Chargement…</p>;

  // ✅ VOTRE STYLING ORIGINAL - Error avec message amélioré
  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-4">{error}</p>
        {error.includes('reconnecter') && (
          <p className="text-sm text-gray-500">
            Redirection automatique vers la page de connexion dans quelques secondes...
          </p>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ✅ VOTRE DESIGN ORIGINAL EXACT
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
                    {c.confirmed_total?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    +{c.confirmed_new.toLocaleString()} {t('countries_page.new')}
                  </p>
                </div>
                <div className="w-1/2">
                  <p className="text-sm text-gray-600">{t('countries_page.deaths')}</p>
                  <p className="text-xl font-bold text-red-600">
                    {c.deaths_total?.toLocaleString() || 'N/A'}
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

      {/* Affichage du nombre de résultats */}
      {search && (
        <div className="mt-6 text-center text-sm text-gray-500">
          {filtered.length} pays trouvé{filtered.length > 1 ? 's' : ''} pour "{search}"
        </div>
      )}
    </div>
  );
};

export default Countries;