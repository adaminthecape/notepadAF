export type Task = {
  id: string;
  message: string;
  created: number;
  updated: number;
  done?: number;
  active?: number | boolean;
  deleted?: number | boolean;
  /** {Previous activity logs} */
  activity?: TaskActivityLog[];
  /** Subtasks */
  next?: TaskSubtask[];
  archived?: number | boolean;
  tags?: string[];
  alerts?: TaskAlert[];
  messageType?: 'textarea' | 'input' | 'text' | undefined;
  /** Not really part of the task, just used for some components. To be deprecated! */
  stories?: any[];
};

export interface TaskSubtask {
  note: string;
}

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
  id?: string;
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

export enum FilterTypes {
  keyword = 'keyword',
  tags = 'tags',
  active = 'active',
  archived = 'archived',
  done = 'done',
}

export type FilterType = 'keyword' | 'tags' | 'active' | 'archived' | 'done';
