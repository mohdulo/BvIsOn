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

/*
 * Ajout du calcul des taux Décès / Guérisons (Recovered) en pourcentage des cas confirmés.
 * Un graphique à deux barres affiche ces taux.
 */

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
  const [predictedDeaths, setPredictedDeaths] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /* ------------------ Métadonnées OMS ------------------ */
  useEffect(() => {
    getMetadata()
      .then((data) => setMetadata(data))
      .catch(() => setError("Impossible de charger les métadonnées"));
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
        setForm({ ...form, [key]: parseInt(value) });
      }
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPredictedDeaths(null);
    setLoading(true);
    try {
      const res = await predict(form);
      setPredictedDeaths(res.pred_new_deaths);
      setSubmitted(true);
    } catch (err) {
      setError("Error during prediction 😢");
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
            <HeartPulse className="w-5 h-5" /> Prediction Settings
          </h2>
          <p className="text-xs opacity-80 mt-1">
            Enter the data to generate a prediction
          </p>
        </div>

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
                  className={inputClass}
                >
                  <option value="">Select WHO region</option>
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
                  disabled={!form.WHO_Region}
                  className={inputClass + " disabled:opacity-50"}
                >
                  <option value="">Select country</option>
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
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-fuchsia-700 transition-all disabled:opacity-50"
          >
            {loading ? "Calculating..." : "📉 Generate Prediction"}
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
              label="Predicted Deaths"
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

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </main>
    </div>
  );
}

/* ----------- Sous‑composants ----------- */
function EmptyState() {
  return (
    <div className="border-2 border-dashed rounded-xl h-full flex flex-col items-center justify-center text-gray-500">
      <Activity className="w-5 h-5 mb-4" />
      <h3 className="text-lg font-semibold mb-1">Ready for prediction</h3>
      <p className="text-sm max-w-sm text-center">
        Enter your parameters and click "Generate Prediction" to start
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
          <Globe className="w-5 h-5 text-indigo-600" /> Country Information
        </h3>

        <dl className="space-y-4">
          <Item icon={MapPin} label="Country" value={country || "-"} />
          <Item icon={Globe} label="WHO Region" value={region || "-"} />
          <Item icon={Calendar} label="Prediction Date" value={formattedDate} />
        </dl>
      </div>

      <p className="text-xs text-center text-gray-400 mt-8">
        Last update
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

/* ---------------- Chart Taux Décès / Guérisons ---------------- */
interface RatesProps {
  deathRate: number;
  recoveredRate: number;
}

function RatesChart({ deathRate, recoveredRate }: RatesProps) {
  const data = [
    { name: "Deaths", value: Number(deathRate.toFixed(2)) },
    { name: "Recovered", value: Number(recoveredRate.toFixed(2)) },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" /> Rates Visualization (%)
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
