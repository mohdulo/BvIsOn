// src/pages/Prediction.tsx
import { useTranslation } from "react-i18next";
import PredictionForm from "../components/PredictionForm";

export default function Prediction() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t("prediction.pageTitle")}</h2>
      <PredictionForm />
    </div>
  );
}
