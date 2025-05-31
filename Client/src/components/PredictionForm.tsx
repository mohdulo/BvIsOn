import { useState, useEffect } from "react";
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

export default function PredictionForm() {
  const [form, setForm] = useState<InputRow>(emptyRow);
  const [metadata, setMetadata] = useState<Metadata>({
    who_regions: [],
    countries_by_region: {},
  });
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    getMetadata()
      .then((data) => setMetadata(data))
      .catch(() => setError("Impossible de charger les métadonnées"));
  }, []);

  const handleChange = (key: keyof InputRow) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;

    if (key === "WHO_Region") {
      setForm({ ...form, WHO_Region: value, Country: "" });
      const countries = metadata.countries_by_region[value] || [];
      setAvailableCountries(countries);
    } else if (key === "Country") {
      setForm({ ...form, Country: value });
    } else if (key === "date") {
      setForm({ ...form, date: value });
    } else {
      setForm({ ...form, [key]: parseInt(value) });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await predict(form);
      setResult(res.pred_new_deaths);
    } catch (err) {
      setError("Erreur lors de la prédiction 😢");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700 flex items-center justify-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" />
        </svg>
        Prédire les nouveaux décès Covid
      </h1>

      <div className="bg-white border border-blue-100 shadow-xl rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(emptyRow) as (keyof InputRow)[]).map((key) => (
            <div key={key} className="flex flex-col">
              <label htmlFor={key} className="text-sm font-semibold text-gray-700 mb-1 capitalize">
                {key.replace(/_/g, " ")}
              </label>

              {key === "WHO_Region" ? (
                <select
                  id={key}
                  value={form.WHO_Region}
                  onChange={handleChange("WHO_Region")}
                  required
                  className="border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Choisir une région OMS</option>
                  {metadata.who_regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : key === "Country" ? (
                <select
                  id={key}
                  value={form.Country}
                  onChange={handleChange("Country")}
                  required
                  disabled={!form.WHO_Region}
                  className="border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                >
                  <option value="">Choisir un pays</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={key}
                  type={key === "date" ? "date" : "number"}
                  step={key === "date" ? undefined : "1"}
                  value={form[key]}
                  onChange={handleChange(key)}
                  className="border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              )}
            </div>
          ))}

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Calcul en cours..." : "📉 Prédire"}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
        )}

        {result !== null && !error && (
          <div className="mt-6 text-center">
            <span className="inline-block bg-green-100 text-green-800 font-semibold text-md px-4 py-2 rounded-full shadow">
              ✅ Nouveaux décès prédits : {result.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
