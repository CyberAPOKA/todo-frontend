import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export interface Task {
  id: number;
  title: string;
  description: string;
  date: string | Date;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const createTask = async (task: Omit<Task, "id">) => {
  try {
    const response = await axios.post<{ message: string; task: Task }>(
      `${API_URL}/task/create`,
      task
    );
    return response.data.task;
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    throw error;
  }
};

export const getTasks = async (filters: {
  title?: string;
  date?: string;
  status?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  try {
    const response = await axios.get<PaginatedResponse<Task>>(
      `${API_URL}/tasks`,
      {
        params: filters,
      }
    );

    return {
      tasks: response.data.data.map((task) => ({
        ...task,
        date: new Date(task.date + "T00:00:00"),
      })),
      pagination: {
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        perPage: response.data.per_page,
        total: response.data.total,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    throw error;
  }
};

export const updateTask = async (id: number, task: Omit<Task, "id">) => {
  try {
    const response = await axios.put<{ message: string; task: Task }>(
      `${API_URL}/task/${id}`,
      task
    );
    return response.data.task;
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw error;
  }
};

export const deleteTask = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/task/${id}`);
    return true;
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    throw error;
  }
};
