import { useState } from "react";
import { predict, InputRow } from "../api/predict";

const emptyRow: InputRow = {
  Confirmed_log: 0,
  Confirmed_log_ma_14: 0,
  cases_per_million: 0,
  tests_per_million: 0,
  population: 0,
  density: 0,
  Lat: 0,
  Long: 0,
};

export default function PredictionForm() {
  const [form, setForm] = useState<InputRow>(emptyRow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const handleChange = (key: keyof InputRow) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: Number(e.target.value) });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await predict(form);
      setResult(res.pred_deaths);
    } catch (err) {
      setError("Erreur lors de la prédiction 😢");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Prédire les décès Covid</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {(
          Object.keys(emptyRow) as (keyof InputRow)[]
        ).map((key) => (
          <label key={key} className="flex flex-col text-sm">
            {key}
            <input
              type="number"
              step="any"
              value={form[key]}
              onChange={handleChange(key)}
              className="border p-1 rounded"
              required
            />
          </label>
        ))}
        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Calcul…" : "Prédire"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result !== null && !error && (
        <p className="mt-6 text-xl">
          Décès prédits : <strong>{result.toLocaleString()}</strong>
        </p>
      )}
    </div>
  );
}
