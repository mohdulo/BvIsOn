import { useNavigate } from "react-router-dom";
import { countryList, CountryConfig } from "../contexts/CountryContext";

export default function CountrySelector() {
  const navigate = useNavigate();

  const selectCountry = (code: keyof typeof countryList) => {
    localStorage.setItem("country", code);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-4xl font-bold mb-10 text-blue-800 text-center">
        🌍 Veuillez sélectionner votre pays
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {Object.entries(countryList).map(([code, conf]: [string, CountryConfig]) => (
          <button
            key={code}
            onClick={() => selectCountry(code as keyof typeof countryList)}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-[1.03] transition-all flex flex-col items-center justify-center gap-4 border border-blue-100"
          >
            <span className="text-6xl">
              {code === "fr" ? "🇫🇷" : code === "us" ? "🇺🇸" : "🇨🇭"}
            </span>
            <span className="text-xl font-semibold text-gray-800">{conf.name}</span>
          </button>
        ))}
      </div>

      <p className="mt-10 text-sm text-gray-500 text-center">
        Vous pourrez changer de pays plus tard en vous déconnectant.
      </p>
    </div>
  );
}
