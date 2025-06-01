import React from "react";
import { ChevronUp, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CountryData } from "../api/manage";

/* ------------------------------------------------------------------ */
interface SortConfig {
  key: keyof CountryData;
  direction: "asc" | "desc";
}

interface Props {
  countries: CountryData[];

  /* tri */
  sortConfig: SortConfig;
  requestSort: (key: keyof CountryData) => void;

  /* édition */
  editCountryId: string | null;
  editData: Omit<CountryData, "id"> | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditRow: (id: string) => void;

  /* suppression côté UI */
  onDeleteRow: (id: string) => void;

  /* format n° */
  formatNumber: (n: number) => string;
}

/* ------------------------------------------------------------------ */
const CountryTable: React.FC<Props> = ({
  countries,
  sortConfig,
  requestSort,
  editCountryId,
  editData,
  onInputChange,
  onSaveEdit,
  onCancelEdit,
  onEditRow,
  onDeleteRow,
  formatNumber,
}) => {
  const { t } = useTranslation();

  const SortableHeader = ({
    title,
    column,
  }: {
    title: string;
    column: keyof CountryData;
  }) => (
    <th
      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => requestSort(column)}
    >
      <div className="flex items-center">
        {title}
        {sortConfig.key === column && (
          <span className="ml-2">
            {sortConfig.direction === "asc" ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader title={t("data.columns.country")} column="country" />
            <SortableHeader title={t("data.columns.totalCases")} column="totalCases" />
            <SortableHeader title={t("data.columns.totalDeaths")} column="totalDeaths" />
            <SortableHeader title={t("data.columns.totalRecovered")} column="totalRecovered" />
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
              {t("data.columns.actions")}
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {countries.map((c) => (
            <tr key={c.id}>
              {/* ----- mode édition ----- */}
              {editCountryId === c.id ? (
                <>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      name="country"
                      className="border rounded px-2 py-1 w-full"
                      value={editData?.country ?? ""}
                      onChange={onInputChange}
                    />
                  </td>
                  {(["totalCases", "totalDeaths", "totalRecovered"] as const).map(
                    (f) => (
                      <td key={f} className="px-6 py-4">
                        <input
                          type="number"
                          name={f}
                          className="border rounded px-2 py-1 w-full"
                          value={editData?.[f] ?? 0}
                          onChange={onInputChange}
                        />
                      </td>
                    )
                  )}
                </>
              ) : (
                /* ----- mode affichage ----- */
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {c.country}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatNumber(c.totalCases)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatNumber(c.totalDeaths)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatNumber(c.totalRecovered)}
                  </td>
                </>
              )}

              {/* ----- actions ----- */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {editCountryId === c.id ? (
                  <div className="flex space-x-2 justify-end">
                    <button
                      className="bg-black text-white px-3 py-1 rounded"
                      onClick={() => onSaveEdit(c.id)}
                    >
                      {t("actions.save")}
                    </button>
                    <button
                      className="border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50"
                      onClick={onCancelEdit}
                    >
                      {t("actions.cancel")}
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2 justify-end">
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => onEditRow(c.id)}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => onDeleteRow(c.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CountryTable;
