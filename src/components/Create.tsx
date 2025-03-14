import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { createTask } from "../services/api";
import { FloatLabel } from "primereact/floatlabel";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

interface CreateProps {
  visible: boolean;
  onHide: () => void;
  onTaskCreated: (task: Task) => void;
  toast: RefObject<Toast | null>;
}

interface Task {
  id?: number;
  title: string;
  description: string;
  date: Date | null;
  status: string;
}

const Create: React.FC<CreateProps> = ({
  visible,
  onHide,
  onTaskCreated,
  toast,
}) => {
  const [task, setTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    date: null,
    status: "pending",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const statusOptions = [
    { label: "Pendente", value: "pending" },
    { label: "Em Progresso", value: "in_progress" },
    { label: "Concluído", value: "completed" },
  ];

  const handleChange = (field: keyof Task, value: any) => {
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    setLoading(true);
    setErrors({});

    try {
      const formattedTask = {
        ...task,
        date: task.date ? task.date.toISOString().split("T")[0] : "",
      };

      const createdTask = await createTask(formattedTask);
      onTaskCreated({
        ...createdTask,
        date: new Date(createdTask.date),
      });

      setTask({ title: "", description: "", date: null, status: "pending" });
      onHide();

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Tarefa criada com sucesso!",
        life: 3000,
      });
    } catch (error: any) {
      console.error("Erro ao criar tarefa", error);

      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);

        toast.current?.show({
          severity: "error",
          summary: "Erro ao criar tarefa",
          detail: "Verifique os campos em vermelho.",
          life: 5000,
        });
      }
    }
    setLoading(false);
  };

  const handleClose = () => {
    setErrors({});
    setTask({ title: "", description: "", date: null, status: "pending" });
    onHide();
  };

  return (
    <Dialog
      header="Adicionar Tarefa"
      visible={visible}
      onHide={handleClose}
      className="w-full md:max-w-2xl px-2"
    >
      <div className="flex flex-col gap-y-6 py-6">
        <div>
          <FloatLabel>
            <InputText
              id="title"
              value={task.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full"
              invalid={!!errors.title}
            />
            <label htmlFor="title">Título</label>
          </FloatLabel>
          {errors.title && <small className="p-error">{errors.title[0]}</small>}
        </div>

        <div>
          <FloatLabel>
            <InputTextarea
              id="description"
              rows={3}
              value={task.description}
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
            value={task.date}
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
              value={task.status}
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

        <div className="flex justify-between mt-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={handleClose}
            severity="danger"
          />
          <Button
            label="Adicionar"
            icon="pi pi-check"
            className="p-button-primary ml-2"
            onClick={handleCreate}
            loading={loading}
            severity="success"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default Create;
