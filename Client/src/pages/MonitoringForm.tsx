import { useState } from "react";
import axios from "axios";

export default function MonitoringForm() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/monitor", formData);
      setResult(res.data);
    } catch (err) {
      console.error("Erreur d'appel API", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
        Lancer le monitoring
      </button>

      {result && (
        <div>
          <p>✅ RMSE : {result.rmse.toFixed(3)}</p>
          <p>✅ MAE : {result.mae.toFixed(3)}</p>
          <p>✅ R² : {result.r2.toFixed(3)}</p>
          {result.alert && <p className="text-red-500">⚠️ Alerte : RMSE trop élevé !</p>}
          <a href={`/${result.drift_report}`} target="_blank" rel="noopener noreferrer">Voir le rapport de drift</a>
        </div>
      )}
    </div>
  );
}
