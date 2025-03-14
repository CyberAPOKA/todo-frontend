import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { updateTask } from "../services/api";
import { FloatLabel } from "primereact/floatlabel";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

interface EditProps {
  visible: boolean;
  onHide: () => void;
  task: Task | null;
  onTaskUpdated: (updatedTask: Task) => void;
  toast: RefObject<Toast | null>;
}

interface Task {
  id: number;
  title: string;
  description: string;
  date: string | Date;
  status: string;
}

const Edit: React.FC<EditProps> = ({
  visible,
  onHide,
  task,
  onTaskUpdated,
  toast,
}) => {
  const [editedTask, setEditedTask] = useState<Omit<Task, "id"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        date: typeof task.date === "string" ? new Date(task.date) : task.date,
      });
    }
  }, [task]);

  const statusOptions = [
    { label: "Pendente", value: "pending" },
    { label: "Em Progresso", value: "in_progress" },
    { label: "Concluído", value: "completed" },
  ];

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleUpdate = async () => {
    if (!task || !editedTask) return;
    setLoading(true);
    setErrors({});

    try {
      const formattedTask = {
        ...editedTask,
        date: editedTask.date
          ? typeof editedTask.date === "string"
            ? editedTask.date
            : editedTask.date.toISOString().split("T")[0]
          : "",
      };

      const updatedTask = await updateTask(task.id, formattedTask);
      onTaskUpdated(updatedTask);
      onHide();

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Tarefa atualizada com sucesso!",
        life: 3000,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar tarefa", error);

      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);

        toast.current?.show({
          severity: "error",
          summary: "Erro ao atualizar tarefa",
          detail: "Verifique os campos em vermelho.",
          life: 5000,
        });
      }
    }

    setLoading(false);
  };

  const handleClose = () => {
    setErrors({});
    onHide();
  };

  return (
    <Dialog
      header="Editar Tarefa"
      visible={visible}
      onHide={handleClose}
      className="w-full md:max-w-2xl px-2"
    >
      <div className="flex flex-col gap-y-6 py-6">
        <div>
          <FloatLabel>
            <InputText
              id="title"
              value={editedTask?.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full"
              invalid={!!errors.title}
            />
            <label htmlFor="title">Título</label>
          </FloatLabel>
          {errors.title && <small className="p-error">{errors.title[0]}</small>}{" "}
        </div>

        <div>
          <FloatLabel>
            <InputTextarea
              id="description"
              rows={3}
              value={editedTask?.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full"
              invalid={!!errors.description}
            />
            <label htmlFor="description">Descrição</label>
          </FloatLabel>
          {errors.description && (
            <small className="p-error">{errors.description[0]}</small>
          )}
        </div>

        <div className="-mt-6">
          <label htmlFor="date" className="text-xs ml-2 mb-8 text-[#6b7280]">
            Data de Conclusão
          </label>
          <Calendar
            inputId="date"
            value={editedTask?.date ? new Date(editedTask.date) : null}
            onChange={(e) => handleChange("date", e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
            placeholder="Data de Conclusão"
            invalid={!!errors.date}
          />
          {errors.date && <small className="p-error">{errors.date[0]}</small>}
        </div>

        <div>
          <FloatLabel>
            <Dropdown
              id="status"
              value={editedTask?.status || ""}
              options={statusOptions}
              onChange={(e) => handleChange("status", e.value)}
              style={{ width: "100%" }}
              invalid={!!errors.status}
            />
            <label htmlFor="status">Status</label>
          </FloatLabel>
          {errors.status && (
            <small className="p-error">{errors.status[0]}</small>
          )}
        </div>
        <div className="flex justify-between mt-3">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={handleClose}
            severity="danger"
          />
          <Button
            label="Atualizar"
            icon="pi pi-check"
            className="p-button-primary ml-2"
            onClick={handleUpdate}
            loading={loading}
            severity="success"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default Edit;
