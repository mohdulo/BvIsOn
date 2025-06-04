/// <reference types="vitest" />

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import PredictionForm from "../components/PredictionForm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api/predict";
import '@testing-library/jest-dom';
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

    const regionSelect = await screen.findByLabelText("WHO Region");
    fireEvent.change(regionSelect, { target: { value: "Africa" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
      expect(screen.getByText("Senegal")).toBeInTheDocument();
      expect(screen.getByText("Nigeria")).toBeInTheDocument();
    });
  });

  it("remplit les champs et soumet le formulaire", async () => {
    render(<PredictionForm />);

    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });
    fireEvent.change(screen.getByLabelText("Confirmed"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Deaths"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.New_recovered")), { target: { value: "200" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.Active")), { target: { value: "790" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.New_cases")), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.Recovered")), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.date")), { target: { value: "2023-01-01" } });

    fireEvent.click(screen.getByRole("button", { name: /predict/i }));

    await waitFor(() => {
      expect(screen.getByText(/Predicted Deaths/i)).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    (api.predict as any).mockRejectedValueOnce(new Error("API down"));

    render(<PredictionForm />);

    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });
    fireEvent.change(screen.getByLabelText("Confirmed"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Deaths"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.New_cases")), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.Recovered")), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.date")), { target: { value: "2023-01-01" } });

    fireEvent.click(screen.getByRole("button", { name: /predict/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("n'envoie pas le formulaire si des champs sont vides", async () => {
    render(<PredictionForm />);

    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });

    fireEvent.click(screen.getByRole("button", { name: /predict/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Predicted Deaths/i)).not.toBeInTheDocument();
    });
  });

  it("désactive le bouton pendant la prédiction", async () => {
    (api.predict as any).mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ pred_new_deaths: 42 }), 500)
    ));

    render(<PredictionForm />);

    fireEvent.change(await screen.findByLabelText("WHO Region"), { target: { value: "Africa" } });
    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Senegal" } });
    fireEvent.change(screen.getByLabelText("Confirmed"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Deaths"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.New_cases")), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.Recovered")), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(t("form.fields.date")), { target: { value: "2023-01-01" } });

    const submitButton = screen.getByRole("button", { name: /predict/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/calcul/i);

    await waitFor(() => {
      expect(screen.getByText(/Predicted Deaths/i)).toBeInTheDocument();
    });

    expect(submitButton).not.toBeDisabled();
  });
});
