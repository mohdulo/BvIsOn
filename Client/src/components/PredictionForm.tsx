// src/components/PredictionForm.tsx - GESTION D'ERREURS AMÉLIORÉE
import { useState, useEffect } from "react";
import i18n from "../i18n/i18n"; 
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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        setMetadataError(err.message || t("error.metadata"));
        
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
    console.log("🔍 Submitting prediction...");
    const res = await predict(form);
    setPredictedDeaths(res.pred_new_deaths);
    setSubmitted(true);
    console.log("✅ Prediction completed:", res.pred_new_deaths);
  } catch (err: any) {
    console.error("❌ Prediction failed:", err);

    // Utilise toujours la traduction
    setError(t("error.prediction"));

    // Redirige si besoin
    if (err.message?.includes("Accès refusé")) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    }
  } finally {
    setLoading(false);
  }
}



  const confirmed = form.Confirmed;
  const deathRate = confirmed > 0 && predictedDeaths !== null ? (predictedDeaths / confirmed) * 100 : 0;
  const recoveredRate = confirmed > 0 ? (form.Recovered / confirmed) * 100 : 0;

  const inputClass =
    "border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40";
  const labelClass = "text-sm font-semibold text-gray-700 mb-1 capitalize";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-[380px] bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-6 py-5 rounded-b-3xl">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HeartPulse className="w-5 h-5" /> {t("form.title")}
          </h2>
          <p className="text-xs opacity-80 mt-1">{t("form.subtitle")}</p>
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
                {t(`form.fields.${key}`)}
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
                  <option value="">{t("form.selectRegion")}</option>
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
                  <option value="">{t("form.selectCountry")}</option>
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
            {loading ? t("form.loading") : `📉 ${t("form.button")}`}
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {!submitted ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            <MetricCard
              icon={AlertTriangle}
              label={t("result.predictedDeaths")}
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

/* Sub-components */
function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-gray-500">
      <Activity className="w-5 h-5 mb-4" />
      <h3 className="text-lg font-semibold mb-1">{t("empty.title")}</h3>
      <p className="text-sm max-w-sm text-center">{t("empty.subtitle")}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, accent }: any) {
  const bg: any = {
    red: "bg-red-50",
    orange: "bg-orange-50",
    green: "bg-green-50",
    blue: "bg-blue-50",
  };
  const text: any = {
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

function CountryInfo({ country, region, date }: any) {
  const { t } = useTranslation();
  const formattedDate = date
    ? new Date(date).toLocaleDateString(i18n.language, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" /> {t("country.title")}
        </h3>

        <dl className="space-y-4">
          <Item icon={MapPin} label={t("country.name")} value={country || "-"} />
          <Item icon={Globe} label={t("country.region")} value={region || "-"} />
          <Item icon={Calendar} label={t("country.date")} value={formattedDate} />
        </dl>
      </div>

      <p className="text-xs text-center text-gray-400 mt-8">
        {t("country.updated")}
        <br />
        {formattedDate}
      </p>
    </div>
  );
}

function Item({ icon: Icon, label, value }: any) {
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

function RatesChart({ deathRate, recoveredRate }: { deathRate: number; recoveredRate: number }) {
  const { t } = useTranslation();
  const data = [
    { name: t("chart.deaths"), value: Number(deathRate.toFixed(2)) },
    { name: t("chart.recovered"), value: Number(recoveredRate.toFixed(2)) },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" /> {t("chart.title")}
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