export interface ClassItem {
  id: string;
  name: string;
  code: string;
  color: string; // hex or tailwind color class
  instructor?: string;
}

export type StandardTag = 'easy' | 'video' | 'film' | 'photo' | 'reading' | 'writing' | 'project' | 'research' | 'exam' | 'code' | 'lab';

export interface AssignmentStep {
  id: string;
  title: string;
  dueDate?: string; // ISO string or YYYY-MM-DDTHH:mm
  completed: boolean;
  completedAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  classId: string;
  dueDate: string; // ISO string or YYYY-MM-DDTHH:mm
  notes: string;
  estimatedTime: string; // e.g. "45m", "2h", "1h 30m"
  tags: string[]; // e.g. ['writing', 'easy']
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  steps?: AssignmentStep[]; // Optional multi-part project steps
}

export type SortBy = 'dueDate' | 'class' | 'title' | 'estimatedTime' | 'created';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 'dashboard' | 'calendar';
