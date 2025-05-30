import { createContext, useContext } from "react";

export type CountryCode = "fr" | "us" | "ch";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  features: {
    analytics: boolean;
    dataviz: boolean;
    technicalAPI: boolean;
    languages: string[];
  };
}

export const countryList: Record<CountryCode, CountryConfig> = {
  fr: {
    code: "fr",
    name: "France",
    features: {
      analytics: true,
      dataviz: true,
      technicalAPI: false,
      languages: ["fr"],
    },
  },
  us: {
    code: "us",
    name: "États-Unis",
    features: {
      analytics: true,
      dataviz: true,
      technicalAPI: true,
      languages: ["en"],
    },
  },
  ch: {
    code: "ch",
    name: "Suisse",
    features: {
      analytics: false,
      dataviz: false,
      technicalAPI: false,
      languages: ["fr", "de", "it"],
    },
  },
};

export const CountryContext = createContext<CountryConfig>(countryList.fr);

export const useCountry = () => useContext(CountryContext);
