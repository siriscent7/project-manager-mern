import axios from 'axios';

const API = axios.create({
  baseURL: 'https://project-manager-backend-97b0.onrender.com/api'
});

// Add token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const signup = (name, email, password) =>
  API.post('/auth/signup', { name, email, password });

export const login = (email, password) =>
  API.post('/auth/login', { email, password });

// Project endpoints
export const getProjects = () => API.get('/projects');
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (name, description) =>
  API.post('/projects', { name, description });
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Board endpoints
export const createBoard = (name, projectId) =>
  API.post('/boards', { name, projectId });
export const getBoard = (id) => API.get(`/boards/${id}`);

// List endpoints
export const createList = (name, boardId) =>
  API.post('/lists', { name, boardId });

// Card endpoints
export const createCard = (title, description, listId, priority) =>
  API.post('/cards', { title, description, listId, priority });
export const getCard = (id) => API.get(`/cards/${id}`);
export const updateCard = (id, data) => API.put(`/cards/${id}`, data);
export const deleteCard = (id) => API.delete(`/cards/${id}`);
export const deleteList = (id) => API.delete(`/lists/${id}`);
export const moveCard = (id, newListId, position) =>
  API.put(`/cards/${id}/move`, { newListId, position });
export const addComment = (cardId, text) =>
  API.post(`/cards/${cardId}/comments`, { text });
export const deleteBoard = (id) => API.delete(`/boards/${id}`);

export default API;
