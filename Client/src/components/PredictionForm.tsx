// src/components/PredictionForm.tsx - GESTION D'ERREURS AMÉLIORÉE
import { useState, useEffect } from "react";
import {
  HeartPulse,
  AlertTriangle,
  Activity,
  Globe,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { predict, InputRow, getMetadata, Metadata } from "../api/predict";

const emptyRow: InputRow = {
  date: "",
  WHO_Region: "",
  Country: "",
  Confirmed: 0,
  Deaths: 0,
  Recovered: 0,
  Active: 0,
  New_cases: 0,
  New_recovered: 0,
};

export default function PredictionPage() {
  const [form, setForm] = useState<InputRow>(emptyRow);
  const [metadata, setMetadata] = useState<Metadata>({
    who_regions: [],
    countries_by_region: {},
  });
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [predictedDeaths, setPredictedDeaths] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /* ------------------ Métadonnées OMS ------------------ */
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setMetadataError(null);
        console.log('🔍 Loading metadata...');
        const data = await getMetadata();
        setMetadata(data);
        console.log('✅ Metadata loaded successfully');
      } catch (err: any) {
        console.error('❌ Metadata loading failed:', err);
        setMetadataError(err.message || 'Impossible de charger les métadonnées');
        
        // Si erreur d'authentification, rediriger
        if (err.message?.includes('Accès refusé')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        }
      }
    };

    loadMetadata();
  }, []);

  /* ------------------ Handlers ------------------ */
  const handleChange =
    (key: keyof InputRow) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;

      if (key === "WHO_Region") {
        setForm({ ...form, WHO_Region: value, Country: "" });
        setAvailableCountries(metadata.countries_by_region[value] || []);
      } else if (key === "Country" || key === "date") {
        setForm({ ...form, [key]: value });
      } else {
        setForm({ ...form, [key]: parseInt(value) || 0 });
      }
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPredictedDeaths(null);
    setLoading(true);
    
    try {
      console.log('🔍 Submitting prediction...');
      const res = await predict(form);
      setPredictedDeaths(res.pred_new_deaths);
      setSubmitted(true);
      console.log('✅ Prediction completed:', res.pred_new_deaths);
    } catch (err: any) {
      console.error('❌ Prediction failed:', err);
      setError(err.message || 'Erreur lors de la prédiction');
      
      // Si erreur d'authentification, rediriger
      if (err.message?.includes('Accès refusé')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }

  /* ------------------ Calcul des taux ------------------ */
  const confirmed = form.Confirmed;
  const deathRate = confirmed > 0 && predictedDeaths !== null ? (predictedDeaths / confirmed) * 100 : 0;
  const recoveredRate = confirmed > 0 ? (form.Recovered / confirmed) * 100 : 0;

  /* ------------------ Style helpers ------------------ */
  const inputClass =
    "border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40";
  const labelClass = "text-sm font-semibold text-gray-700 mb-1 capitalize";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* ------------- FORMULAIRE ------------- */}
      <aside className="w-full md:w-[380px] bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-6 py-5 rounded-b-3xl">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HeartPulse className="w-5 h-5" /> Paramètres de Prédiction
          </h2>
          <p className="text-xs opacity-80 mt-1">
            Entrez les données pour générer une prédiction
          </p>
        </div>

        {/* Erreur metadata */}
        {metadataError && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{metadataError}</p>
            {metadataError.includes('Accès refusé') && (
              <p className="text-red-500 text-xs mt-1">
                Redirection vers la connexion dans 3 secondes...
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(Object.keys(emptyRow) as (keyof InputRow)[]).map((key) => (
            <div key={key} className="flex flex-col">
              <label htmlFor={key} className={labelClass}>
                {key.replace(/_/g, " ")}
              </label>

              {key === "WHO_Region" ? (
                <select
                  id={key}
                  value={form.WHO_Region}
                  onChange={handleChange("WHO_Region")}
                  required
                  disabled={metadata.who_regions.length === 0}
                  className={`${inputClass} ${metadata.who_regions.length === 0 ? 'opacity-50' : ''}`}
                >
                  <option value="">
                    {metadata.who_regions.length === 0 ? 'Chargement...' : 'Choisir une région OMS'}
                  </option>
                  {metadata.who_regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : key === "Country" ? (
                <select
                  id={key}
                  value={form.Country}
                  onChange={handleChange("Country")}
                  required
                  disabled={!form.WHO_Region || availableCountries.length === 0}
                  className={`${inputClass} ${(!form.WHO_Region || availableCountries.length === 0) ? 'opacity-50' : ''}`}
                >
                  <option value="">
                    {!form.WHO_Region ? 'Sélectionner une région d\'abord' : 'Choisir un pays'}
                  </option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={key}
                  type={key === "date" ? "date" : "number"}
                  step={key === "date" ? undefined : "1"}
                  value={form[key] as any}
                  onChange={handleChange(key)}
                  className={inputClass}
                  required
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || metadata.who_regions.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Calcul en cours..." : "📉 Générer Prédiction"}
          </button>
        </form>
      </aside>

      {/* ------------- DASHBOARD ------------- */}
      <main className="flex-1 p-6 md:p-10">
        {!submitted ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            <MetricCard
              icon={AlertTriangle}
              label="Décès Prédits"
              value={predictedDeaths ?? 0}
              accent="red"
            />

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CountryInfo
                country={form.Country}
                region={form.WHO_Region}
                date={form.date}
              />
              <RatesChart deathRate={deathRate} recoveredRate={recoveredRate} />
            </section>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            {error.includes('Accès refusé') && (
              <p className="text-red-500 text-sm mt-1">
                Redirection vers la connexion dans 3 secondes...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ----------- Sous‑composants (inchangés) ----------- */
function EmptyState() {
  return (
    <div className="border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-gray-500">
      <Activity className="w-5 h-5 mb-4" />
      <h3 className="text-lg font-semibold mb-1">Prêt pour la prédiction</h3>
      <p className="text-sm max-w-sm text-center">
        Entrez vos paramètres et cliquez sur "Générer Prédiction" pour commencer
      </p>
    </div>
  );
}

interface MetricProps {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: "red" | "orange" | "green" | "blue";
}

function MetricCard({ icon: Icon, label, value, accent }: MetricProps) {
  const bg: Record<MetricProps["accent"], string> = {
    red: "bg-red-50",
    orange: "bg-orange-50",
    green: "bg-green-50",
    blue: "bg-blue-50",
  };
  const text: Record<MetricProps["accent"], string> = {
    red: "text-red-600",
    orange: "text-orange-600",
    green: "text-green-600",
    blue: "text-blue-600",
  };

  return (
    <div className={`${bg[accent]} rounded-2xl p-5 shadow-lg flex flex-col gap-3 w-full sm:max-w-xs`}>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${text[accent]} bg-white shadow`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${text[accent]}`}>{value.toLocaleString()}</p>
    </div>
  );
}

interface InfoProps {
  country: string;
  region: string;
  date: string;
}

function CountryInfo({ country, region, date }: InfoProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" /> Informations Pays
        </h3>

        <dl className="space-y-4">
          <Item icon={MapPin} label="Pays" value={country || "-"} />
          <Item icon={Globe} label="Région OMS" value={region || "-"} />
          <Item icon={Calendar} label="Date de prédiction" value={formattedDate} />
        </dl>
      </div>

      <p className="text-xs text-center text-gray-400 mt-8">
        Dernière mise à jour
        <br />
        {formattedDate}
      </p>
    </div>
  );
}

interface ItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function Item({ icon: Icon, label, value }: ItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-600">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

interface RatesProps {
  deathRate: number;
  recoveredRate: number;
}

function RatesChart({ deathRate, recoveredRate }: RatesProps) {
  const data = [
    { name: "Décès", value: Number(deathRate.toFixed(2)) },
    { name: "Guéris", value: Number(recoveredRate.toFixed(2)) },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" /> Visualisation des
        Taux (%)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(value: any) => `${value}%`} />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}