import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Metric {
  date: string;
  rmse: number;
  r2: number;
}

export default function MetricsTable() {
  const { data, error } = useSWR<Metric[]>(
    `${import.meta.env.VITE_API_URL_ROOT}/metrics`,
    fetcher,
    { refreshInterval: 60_000 }
  );

  if (error) return <p>Impossible de charger les métriques.</p>;
  if (!data) return <p>Chargement…</p>;

  return (
    <table className="mx-auto mt-8 border">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-2">Date</th>
          <th className="px-2">RMSE log</th>
          <th className="px-2">R²</th>
        </tr>
      </thead>
      <tbody>
        {data.map((m) => (
          <tr key={m.date} className="text-center even:bg-gray-50">
            <td className="px-2">{m.date}</td>
            <td className="px-2">{m.rmse.toFixed(3)}</td>
            <td className="px-2">{m.r2.toFixed(3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
