import type { MatriculaData } from '@/types/matricula';

const STORAGE_KEY = 'geodoc_matriculas';

export function getMatriculas(): MatriculaData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMatricula(data: MatriculaData): void {
  const list = getMatriculas();
  const idx = list.findIndex(m => m.id === data.id);
  if (idx >= 0) {
    list[idx] = data;
  } else {
    list.push(data);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function removeMatricula(id: string): void {
  const list = getMatriculas().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
