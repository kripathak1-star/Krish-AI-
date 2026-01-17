import { Project } from '../types';

const STORAGE_KEY = 'krish_ai_projects';

export const saveProjects = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects', error);
  }
};

export const loadProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load projects', error);
    return [];
  }
};

export const createNewProject = (): Project => {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Project',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    currentCode: '',
    history: []
  };
};