export type Task = {
  id: string;
  message: string;
  created: number;
  updated: number;
  done?: number | boolean;
  active?: number | boolean;
  activity?: TaskActivityLog[];
  archived?: number | boolean;
  tags?: string[];
  alerts?: TaskAlert[];
};

export interface TaskActivityLog {
  [key: string]: any;
}

export interface TaskAlert {
  date: string;
  time: string;
  unix: number;
  id?: Task['id'];
}

export type TaskFilters = {
  tags?: Task['tags'];
  keyword?: string;
  done?: boolean;
  active?: boolean;
  archived?: boolean;
};

export enum TaskFilterBooleans {
  done = 'done',
  active = 'active',
  archived = 'archived',
}

export type TaskSortType = 'due' | 'created' | 'done';

export type Note = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  id?: string;
  tasks?: Task[];
  isStarred?: boolean;
};

export type TaskToggleableBooleans = {
  label: string;
  value: keyof TaskFilterBooleans;
};
