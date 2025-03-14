import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import Create from "./components/Create";
import Edit from "./components/Edit";
import Filters from "./components/Filters";
import { getTasks, deleteTask, Task } from "./services/api";

const statusMap: { [key: string]: string } = {
  pending: "Pendente",
  in_progress: "Em Progresso",
  completed: "Concluído",
};

const statusColors: { [key: string]: string } = {
  pending: "!bg-red-500",
  in_progress: "!bg-blue-500",
  completed: "!bg-green-500",
};

const App: React.FC = () => {
  const toast = useRef<Toast | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  useEffect(() => {
    fetchTasks();
  }, [sortBy, sortOrder]);

  const [filters, setFilters] = useState<{
    title?: string;
    date?: string;
    status?: string;
  }>({});

  const fetchTasks = async (
    customFilters = filters,
    customPagination = pagination
  ) => {
    const result = await getTasks({
      ...customFilters,
      page: customPagination.currentPage,
      perPage: customPagination.perPage,
      sortBy,
      sortOrder,
    });

    setTasks(result.tasks);
    setPagination({
      currentPage: result.pagination.currentPage,
      lastPage: result.pagination.lastPage,
      perPage: result.pagination.perPage,
      total: result.pagination.total,
    });
  };

  const handleRowClick = (task: Task) => {
    setSelectedTask({
      ...task,
      date: typeof task.date === "string" ? new Date(task.date) : task.date,
    });
    setEditVisible(true);
  };

  const onTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    fetchTasks();
  };

  const handleDelete = (task: Task) => {
    confirmDialog({
      message: `Tem certeza que deseja excluir a tarefa "${task.title}"?`,
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, excluir",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteTask(task.id);
          toast.current?.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Tarefa excluída com sucesso!",
            life: 3000,
          });
          fetchTasks();
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao excluir tarefa!",
            life: 3000,
          });
        }
      },
    });
  };

  return (
    <div className="App">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="container mx-auto px-3 sm:px-0">
        <h1 className="text-[var(--primary-color)] text-center text-3xl my-2 font-bold">
          To-Do List
        </h1>

        <div className="flex flex-col lg:flex-row gap-2 justify-between">
          <Filters
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              fetchTasks(newFilters, { ...pagination, currentPage: 1 });
            }}
          />
          <Button
            label="Nova Tarefa"
            icon="pi pi-plus"
            onClick={() => setCreateVisible(true)}
            severity="success"
          />
        </div>

        <DataTable
          value={tasks}
          sortField={sortBy}
          sortOrder={sortOrder === "asc" ? 1 : -1}
          onSort={(e) => {
            setSortBy(e.sortField);
            setSortOrder(e.sortOrder === 1 ? "asc" : "desc");
          }}
          className="mt-4"
          rowClassName={(rowData) => statusColors[rowData.status] || ""}
          onRowClick={(e) => handleRowClick(e.data as Task)}
        >
          <Column field="id" header="ID" sortable />
          <Column field="title" header="Título" />
          <Column field="description" header="Descrição" />
          <Column
            field="date"
            header="Data"
            body={(rowData) =>
              rowData.date instanceof Date
                ? rowData.date.toLocaleDateString()
                : new Date(rowData.date).toLocaleDateString()
            }
            sortable
          />
          <Column
            field="status"
            header="Status"
            body={(rowData) => <span>{statusMap[rowData.status]}</span>}
            sortable
          />
          <Column
            header="Deletar"
            body={(rowData) => (
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-text"
                severity="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(rowData);
                }}
              />
            )}
            style={{ textAlign: "center", width: "5rem" }}
          />
        </DataTable>

        <Paginator
          first={(pagination.currentPage - 1) * pagination.perPage}
          rows={pagination.perPage}
          totalRecords={pagination.total}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          onPageChange={(e) => {
            setPagination((prev) => {
              const newPagination = {
                ...prev,
                currentPage: e.page + 1,
                perPage: e.rows,
              };
              fetchTasks(filters, newPagination);
              return newPagination;
            });
          }}
        />

        <Create
          visible={createVisible}
          onHide={() => setCreateVisible(false)}
          onTaskCreated={() => fetchTasks()}
          toast={toast}
        />

        <Edit
          visible={editVisible}
          onHide={() => setEditVisible(false)}
          task={selectedTask}
          onTaskUpdated={onTaskUpdated}
          toast={toast}
        />
      </div>
    </div>
  );
};

export default App;
