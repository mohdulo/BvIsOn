/// <reference types="vitest" />

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import PredictionForm from "../components/PredictionForm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api/predict";
import '@testing-library/jest-dom'
import { t } from 'i18next';

// Mock des appels API
vi.mock("../api/predict");

const mockedMetadata = {
  who_regions: ["Africa", "Europe"],
  countries_by_region: {
    Africa: ["Senegal", "Nigeria"],
    Europe: ["France", "Germany"],
  },
};

describe("PredictionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getMetadata as any).mockResolvedValue(mockedMetadata);
    (api.predict as any).mockResolvedValue({ pred_new_deaths: 42 });
  });

  it("affiche les régions OMS et les pays selon la sélection", async () => {
    render(<PredictionForm />);

    // Sélection de la région OMS
    const regionSelect = await screen.findByLabelText("WHO Region");
    fireEvent.change(regionSelect, { target: { value: "Africa" } });

    // Vérifie que les bons pays sont affichés
    await waitFor(() => {
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
      expect(screen.getByText("Senegal")).toBeInTheDocument();
      expect(screen.getByText("Nigeria")).toBeInTheDocument();
    });
  });
}); // 👈 fermeture du describe ici !


  it("remplit les champs numériques et soumet le formulaire", async () => {
    render(<PredictionForm />);

    // Remplit le formulaire
    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });
    fireEvent.change(screen.getByLabelText("Confirmed"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Deaths"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.New_recovered")), { target: { value: "200" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.Active")), { target: { value: "790" } });
    fireEvent.change(screen.getByLabelText(t('form.fields.New_cases')), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.Recovered")), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.date")), { target: { value: "2023-01-01" } });

    // Soumission
    fireEvent.click(screen.getByRole("button", { name: /predict/i })
);

    // Vérifie le résultat
    await waitFor(() => {
      expect(screen.getByText((content) =>
  content.includes("Predicted Deaths")
)).toBeInTheDocument();

      expect(screen.getByText(/42/)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    // Simule une erreur côté API
    (api.predict as any).mockRejectedValueOnce(new Error("API down"));

    render(<PredictionForm />);

    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });

  fireEvent.change(screen.getByLabelText("Confirmed"), { target: { value: "1000" } });
  fireEvent.change(screen.getByLabelText("Deaths"), { target: { value: "10" } });
  fireEvent.change(screen.getByLabelText("Recovered"), { target: { value: "200" } });
  fireEvent.change(screen.getByLabelText("Active"), { target: { value: "790" } });
  fireEvent.change(screen.getByLabelText(t("form.fields.New_cases")), { target: { value: "50" } });
  fireEvent.change(screen.getByLabelText(t("form.fields.Recovered")), { target: { value: "30" } });
  fireEvent.change(screen.getByLabelText(t("form.fields.date")), { target: { value: "2023-01-01" } });

  fireEvent.click(screen.getByRole("button", { name: /predict/i })
);

  await waitFor(() => {
    expect(screen.getByText(/Error during prediction/i)).toBeInTheDocument();
  });
});
it("n'envoie pas le formulaire si des champs sont vides", async () => {
  render(<PredictionForm />);

  fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
  fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });

  // Laisse tous les autres champs vides

  const submitButton = screen.getByRole("button", { name: /predict/i })
;
  fireEvent.click(submitButton);

  await waitFor(() => {
    // Il ne doit PAS y avoir de texte "nouveaux décès prédits"
    expect(screen.queryByText(/Predicted Deaths/i)).not.toBeInTheDocument();
  });
});
it("désactive le bouton pendant la prédiction", async () => {
  // Simule un délai pour voir l'état intermédiaire
  (api.predict as any).mockImplementation(() => new Promise(resolve =>
    setTimeout(() => resolve({ pred_new_deaths: 42 }), 500)
  ));

  render(<PredictionForm />);

  fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });
fireEvent.change(screen.getByLabelText("Confirmed"), { target: { value: "1000" } });
fireEvent.change(screen.getByLabelText("Deaths"), { target: { value: "10" } });
fireEvent.change(screen.getByLabelText("Recovered"), { target: { value: "200" } });
fireEvent.change(screen.getByLabelText("Active"), { target: { value: "790" } });
fireEvent.change(screen.getByLabelText(t("form.fields.New_cases")), { target: { value: "50" } });
fireEvent.change(screen.getByLabelText(t("form.fields.Recovered")), { target: { value: "30" } });
fireEvent.change(screen.getByLabelText(t("form.fields.date")), { target: { value: "2023-01-01" } });


  const submitButton = screen.getByRole("button", { name: /predict/i })
;
  fireEvent.click(submitButton);

  // Dès le clic, le bouton doit être désactivé (et afficher "Calcul…")
  expect(submitButton).toBeDisabled();
  expect(submitButton).toHaveTextContent(/calcul/i);

  // Attend la fin
  await waitFor(() => {
    expect(screen.getByText(/Predicted Deaths/i)).toBeInTheDocument();
  });

  it("n'envoie pas le formulaire si des champs sont vides", async () => {
    render(<PredictionForm />);

    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });

    // Laisse tous les autres champs vides

    const submitButton = screen.getByRole("button", { name: /prédiction/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Il ne doit PAS y avoir de texte "nouveaux décès prédits"
      expect(screen.queryByText(/Décès Prédits/i)).not.toBeInTheDocument();
    });
  });

  it("désactive le bouton pendant la prédiction", async () => {
    // Simule un délai pour voir l'état intermédiaire
    (api.predict as any).mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ pred_new_deaths: 42 }), 500)
    ));

    render(<PredictionForm />);

    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });
    fireEvent.change(screen.getByLabelText("Confirmed"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Deaths"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Recovered"), { target: { value: "200" } });
    fireEvent.change(screen.getByLabelText("Active"), { target: { value: "790" } });
    fireEvent.change(screen.getByLabelText("New cases"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("New recovered"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText("date"), { target: { value: "2023-01-01" } });

    const submitButton = screen.getByRole("button", { name: /prédiction/i });
    fireEvent.click(submitButton);

    // Dès le clic, le bouton doit être désactivé (et afficher "Calcul…")
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/calcul/i);

    // Attend la fin
    await waitFor(() => {
      expect(screen.getByText(/Décès Prédits/i)).toBeInTheDocument();
    });

    // Le bouton est à nouveau actif
    expect(submitButton).not.toBeDisabled();
  });
});