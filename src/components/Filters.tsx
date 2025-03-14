import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

interface FilterProps {
  onFilterChange: (filters: { title?: string; date?: string; status?: string }) => void;
}

const Filters: React.FC<FilterProps> = ({ onFilterChange }) => {
  const initialFilters = { title: "", date: null, status: "" };
  const [filters, setFilters] = useState<{ title?: string; date?: Date | null; status?: string }>(initialFilters);

  const statusOptions = [
    { label: "Pendente", value: "pending" },
    { label: "Em Progresso", value: "in_progress" },
    { label: "Concluído", value: "completed" },
  ];

  const handleFilterChange = (field: keyof typeof filters, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    onFilterChange({
      title: filters.title || undefined,
      date: filters.date ? filters.date.toISOString().split("T")[0] : undefined,
      status: filters.status || undefined,
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    onFilterChange({});
  };

  const hasFilters = filters.title !== "" || filters.date !== null || filters.status !== "";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
      <InputText
        placeholder="Filtrar por título"
        value={filters.title}
        onChange={(e) => handleFilterChange("title", e.target.value)}
      />

      <Calendar
        value={filters.date}
        onChange={(e) => handleFilterChange("date", e.value)}
        dateFormat="dd/mm/yy"
        placeholder="Filtrar por data"
        showIcon
      />

      <Dropdown
        value={filters.status}
        options={statusOptions}
        onChange={(e) => handleFilterChange("status", e.value)}
        placeholder="Filtrar por status"
      />

      <Button label="Aplicar Filtros" icon="pi pi-filter" onClick={applyFilters} />

      {hasFilters && (
        <Button label="Resetar Filtros" icon="pi pi-times" onClick={resetFilters} severity="danger" />
      )}
    </div>
  );
};

export default Filters;