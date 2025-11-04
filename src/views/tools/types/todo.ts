// TODO 数据类型定义
export interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
}

