import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchCountryDetail, CountryDetail } from "../api/country";

const formatNumber = (n: number | undefined) =>
  n !== undefined ? n.toLocaleString() : "-";

/* ---------------- sub components ---------------- */
const StatCard: React.FC<{ title: string; value: string; subtitle?: string; color?: string }> = ({
  title,
  value,
  subtitle,
  color = "text-gray-800",
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">{title}</h2>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);

/* ---------------- main component ---------------- */
const CountryDetailPage: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCountryDetail(countryId);
        if (!data) setError("Country not found in API");
        setCountry(data);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [countryId]);

  /* ---- derived metrics ---- */
  const fatalityRate = country
    ? ((country.deaths_total / country.confirmed_total) * 100).toFixed(2) + "%"
    : "-";
  const newCaseRate = country
    ? ((country.confirmed_new / country.confirmed_total) * 100).toFixed(2) + "%"
    : "-";

  /* ---- guards ---- */
  const backLink = (
    <div className="flex items-center text-blue-600 mb-6">
      <ArrowLeft size={16} className="mr-2" />
      <Link to="/countries" className="hover:underline">
        Back to all countries
      </Link>
    </div>
  );

  if (loading)
    return (
      <div className="p-8">
        {backLink}
        <p className="text-gray-500">Loading country data…</p>
      </div>
    );

  if (error || !country)
    return (
      <div className="p-8">
        {backLink}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">{error ?? "Country not found"}</p>
        </div>
      </div>
    );

  return (
    <div className="p-8 space-y-8">
      {backLink}

      {/* headline */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-800">{country.country}</h1>
        <p className="text-gray-500 text-sm">Latest COVID‑19 snapshot</p>
      </header>

      {/* main stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Confirmed"
          value={formatNumber(country.confirmed_total)}
          subtitle={"+" + formatNumber(country.confirmed_new) + " today"}
          color="text-blue-600"
        />
        <StatCard
          title="Deaths"
          value={formatNumber(country.deaths_total)}
          subtitle={"+" + formatNumber(country.deaths_new) + " today"}
          color="text-red-600"
        />
        <StatCard title="Fatality Rate" value={fatalityRate} color="text-red-700" />
        <StatCard title="New‑case %" value={newCaseRate} />
      </section>

      {/* info grid */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Country Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Slug / ID" value={country.id} />
          <InfoItem label="Total Confirmed" value={formatNumber(country.confirmed_total)} />
          <InfoItem label="Total Deaths" value={formatNumber(country.deaths_total)} />
          <InfoItem label="Fatality Rate" value={fatalityRate} />
        </div>
      </section>

      <footer className="pt-8 border-t text-center text-gray-400 text-sm">
        COVID‑19 Dashboard 
      </footer>
    </div>
  );
};

export default CountryDetailPage;
