import { useState } from "react";
import { predict, InputRow } from "../api/predict";

const emptyRow: InputRow = {
  Confirmed: 0,
  Deaths: 0,
  Recovered: 0,
  Active: 0,
  New_cases: 0,
  New_recovered: 0,
  date: "",
  Country: "",
  WHO_Region: "",
};

export default function PredictionForm() {
  const [form, setForm] = useState<InputRow>(emptyRow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const handleChange = (key: keyof InputRow) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isNumeric =
      key !== "date" && key !== "Country" && key !== "WHO_Region";
    setForm({
      ...form,
      [key]: isNumeric ? Number(e.target.value) : e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Prédire les nouveaux décès Covid</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {(Object.keys(emptyRow) as (keyof InputRow)[]).map((key) => (
          <label key={key} className="flex flex-col text-sm">
            {key}
            <input
              type={
                key === "date"
                  ? "date"
                  : key === "Country" || key === "WHO_Region"
                  ? "text"
                  : "number"
              }
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
          Nouveaux décès prédits :{" "}
          <strong>{result.toLocaleString()}</strong>
        </p>
      )}
    </div>
  );
}
