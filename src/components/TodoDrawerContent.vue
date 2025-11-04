<template>
  <div class="todo-drawer-content">
    <!-- 添加任务 -->
    <div class="add-section">
      <div class="add-input-wrapper">
        <el-input
          v-model="newTodo.title"
          placeholder="输入任务，按 Enter 添加..."
          @keyup.enter="addTodo"
          clearable
          class="task-input"
        >
          <template #prefix>
            <el-icon><Document /></el-icon>
          </template>
        </el-input>
        <el-select 
          v-model="newTodo.priority" 
          placeholder="优先级" 
          class="priority-select"
        >
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
        <el-button 
          type="primary" 
          @click="addTodo" 
          :disabled="!newTodo.title.trim()" 
          class="add-button"
        >
          添加
        </el-button>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-radio-group v-model="filterType" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="pending">待办</el-radio-button>
        <el-radio-button label="completed">已完成</el-radio-button>
      </el-radio-group>
      <div class="toolbar-actions">
        <el-button @click="exportTodos" link type="primary" size="small">
          <el-icon><DownloadIcon /></el-icon>
          导出
        </el-button>
        <el-button @click="clearCompleted" link type="danger" size="small" v-if="completedTodos > 0">
          清除已完成({{ completedTodos }})
        </el-button>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="todos-list">
      <el-empty
        v-if="groupedTodos.length === 0"
        description="还没有任务"
        :image-size="60"
      />

      <!-- 按日期分组显示 -->
      <div v-for="group in groupedTodos" :key="group.date" class="todo-group">
        <div class="group-header" @click="toggleGroup(group.date)">
          <div class="group-header-left">
            <el-icon class="group-icon" :class="{ 'collapsed': collapsedGroups.has(group.date) }">
              <ArrowDown />
            </el-icon>
            <span class="group-date">{{ group.dateLabel }}</span>
            <span class="group-count">{{ group.todos.length }} 项</span>
          </div>
        </div>
        <div class="group-todos" v-show="!collapsedGroups.has(group.date)">
          <div
            v-for="(todo, todoIndex) in group.todos"
            :key="todo.id"
            class="todo-item"
            :class="{
              'todo-completed': todo.completed,
              'priority-high': todo.priority === 'high',
              'priority-medium': todo.priority === 'medium',
              'priority-low': todo.priority === 'low',
              'dragging': draggedGroupIndex === group.date && draggedIndex === todoIndex
            }"
            draggable="true"
            @dragstart="handleDragStart($event, group.date, todoIndex)"
            @dragenter.prevent="handleDragEnter($event, group.date, todoIndex)"
            @dragover.prevent="handleDragOver($event)"
            @drop="handleDrop($event, group.date, todoIndex)"
            @dragend="handleDragEnd"
          >
            <div class="todo-drag-handle">
              <el-icon><Rank /></el-icon>
            </div>
            <el-checkbox
              v-model="todo.completed"
              @change="updateTodo(todo)"
              class="todo-checkbox"
              @click.stop
            />
            <div class="todo-content" @click.stop="editTodo(todo)">
              <div class="todo-title" :class="{ 'text-line-through': todo.completed }">
                {{ todo.title }}
              </div>
              <div v-if="todo.description" class="todo-description">
                {{ todo.description }}
              </div>
            </div>
            <div class="todo-actions" @click.stop>
              <el-button
                type="danger"
                link
                size="small"
                @click="deleteTodo(todo.id)"
                icon="Delete"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <div v-if="editDialogVisible" class="edit-dialog-overlay" @click.self="cancelEdit">
      <div class="edit-dialog-container">
        <div class="edit-dialog-header">
          <h3>编辑任务</h3>
          <el-button text @click="cancelEdit" class="close-btn">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="edit-dialog-body">
          <el-form v-if="editingTodo" :model="editingTodo" label-width="70px">
            <el-form-item label="任务标题">
              <el-input v-model="editingTodo.title" placeholder="输入任务标题" />
            </el-form-item>
            <el-form-item label="任务描述">
              <el-input
                v-model="editingTodo.description"
                type="textarea"
                :rows="3"
                placeholder="输入任务描述（可选）"
              />
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="editingTodo.priority" placeholder="选择优先级" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="edit-dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '@/views/tools/types/todo';
import { Document, Rank, ArrowDown, Download as DownloadIcon, Close } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const emit = defineEmits<{
  'update:count': [count: number];
}>();

// 状态管理
const todos = ref<TodoItem[]>([]);
const newTodo = ref({
  title: '',
  priority: 'medium' as 'high' | 'medium' | 'low'
});
const filterType = ref<'all' | 'pending' | 'completed'>('all');
const editDialogVisible = ref(false);
const editingTodo = ref<TodoItem | null>(null);

// 拖拽相关
const draggedIndex = ref<number | null>(null);
const draggedGroupIndex = ref<string | null>(null);
const dragOverIndex = ref<number | null>(null);

// 分组收缩状态
const collapsedGroups = ref<Set<string>>(new Set());

// 计算属性
const completedTodos = computed(() => todos.value.filter(t => t.completed).length);
const pendingTodos = computed(() => todos.value.filter(t => !t.completed).length);

// 按日期分组
interface TodoGroup {
  date: string;
  dateLabel: string;
  todos: TodoItem[];
}

const groupedTodos = computed(() => {
  let result = [...todos.value];

  // 筛选
  if (filterType.value === 'pending') {
    result = result.filter(t => !t.completed);
  } else if (filterType.value === 'completed') {
    result = result.filter(t => t.completed);
  }

  // 排序：未完成的优先，然后保持原始顺序（用户拖拽排序后的顺序）
  result.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 保持原始数组的顺序（通过索引判断）
    const indexA = todos.value.findIndex(t => t.id === a.id);
    const indexB = todos.value.findIndex(t => t.id === b.id);
    return indexA - indexB;
  });

  // 按日期分组
  const groups = new Map<string, TodoItem[]>();
  
  result.forEach(todo => {
    const dateKey = getDateKey(todo.createdAt);
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(todo);
  });

  // 转换为数组并排序
  const groupedArray: TodoGroup[] = Array.from(groups.entries()).map(([date, todos]) => ({
    date,
    dateLabel: getDateLabel(date),
    todos
  }));

  // 按日期倒序排列（最新的在前）
  groupedArray.sort((a, b) => {
    if (a.date === 'today') return -1;
    if (b.date === 'today') return 1;
    if (a.date === 'yesterday') return -1;
    if (b.date === 'yesterday') return 1;
    return b.date.localeCompare(a.date);
  });

  return groupedArray;
});

// 获取日期键
const getDateKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  if (todoDate.getTime() === today.getTime()) {
    return 'today';
  } else if (todoDate.getTime() === yesterday.getTime()) {
    return 'yesterday';
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// 获取日期标签
const getDateLabel = (dateKey: string): string => {
  if (dateKey === 'today') return '今天';
  if (dateKey === 'yesterday') return '昨天';
  return dateKey;
};

// 监听待办数量变化
watch(pendingTodos, (newCount) => {
  emit('update:count', newCount);
}, { immediate: true });

// ESC 键监听
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && editDialogVisible.value) {
    cancelEdit();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey);
});

// 方法
const addTodo = () => {
  if (!newTodo.value.title.trim()) {
    ElMessage.warning('请输入任务标题');
    return;
  }

  const todo: TodoItem = {
    id: Date.now().toString(),
    title: newTodo.value.title.trim(),
    description: '',
    priority: newTodo.value.priority,
    completed: false,
    createdAt: Date.now(),
    completedAt: null
  };

  todos.value.unshift(todo);
  saveToLocalStorage();
  newTodo.value.title = '';
  newTodo.value.priority = 'medium';
  ElMessage.success('任务添加成功');
};

const updateTodo = (todo: TodoItem) => {
  if (todo.completed) {
    todo.completedAt = Date.now();
  } else {
    todo.completedAt = null;
  }
  saveToLocalStorage();
};

const editTodo = (todo: TodoItem) => {
  editingTodo.value = JSON.parse(JSON.stringify(todo));
  editDialogVisible.value = true;
};

const saveEdit = () => {
  if (!editingTodo.value || !editingTodo.value.title.trim()) {
    ElMessage.warning('请输入任务标题');
    return;
  }

  const index = todos.value.findIndex(t => t.id === editingTodo.value!.id);
  if (index !== -1) {
    todos.value[index] = { ...editingTodo.value };
    saveToLocalStorage();
    ElMessage.success('任务更新成功');
    cancelEdit();
  }
};

const cancelEdit = () => {
  editingTodo.value = null;
  editDialogVisible.value = false;
};

const deleteTodo = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    todos.value = todos.value.filter(t => t.id !== id);
    saveToLocalStorage();
    ElMessage.success('任务已删除');
  } catch {
    // 用户取消
  }
};

const clearCompleted = async () => {
  const completedCount = completedTodos.value;
  if (completedCount === 0) {
    ElMessage.info('没有已完成的任务');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要清除 ${completedCount} 个已完成的任务吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    todos.value = todos.value.filter(t => !t.completed);
    saveToLocalStorage();
    ElMessage.success('已清除所有已完成的任务');
  } catch {
    // 用户取消
  }
};

// 拖拽处理函数
const handleDragStart = (event: DragEvent, groupDate: string, index: number) => {
  draggedIndex.value = index;
  draggedGroupIndex.value = groupDate;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', '');
  }
};

const handleDragEnter = (_event: DragEvent, groupDate: string, index: number) => {
  if (draggedIndex.value !== null && draggedGroupIndex.value === groupDate && draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDrop = (event: DragEvent, dropGroupDate: string, dropIndex: number) => {
  event.preventDefault();
  
  if (draggedIndex.value === null || draggedGroupIndex.value === null) {
    return;
  }

  // 只在同一分组内拖拽排序
  if (draggedGroupIndex.value !== dropGroupDate) {
    return;
  }

  if (draggedIndex.value === dropIndex) {
    return;
  }

  // 找到对应的分组
  const group = groupedTodos.value.find(g => g.date === dropGroupDate);
  if (!group) return;

  const draggedItem = group.todos[draggedIndex.value];
  
  // 从分组列表中移除并重新插入
  group.todos.splice(draggedIndex.value, 1);
  group.todos.splice(dropIndex, 0, draggedItem);
  
  // 更新原始 todos 数组的顺序
  const allFilteredIds = groupedTodos.value.flatMap(g => g.todos.map(t => t.id));
  
  // 重新构建 todos 数组：先按分组顺序，再放未筛选的项
  const newTodos: TodoItem[] = [];
  
  // 按分组顺序添加
  groupedTodos.value.forEach(g => {
    g.todos.forEach(todo => {
      const item = todos.value.find(t => t.id === todo.id);
      if (item) newTodos.push(item);
    });
  });
  
  // 添加未筛选的项（保持原顺序）
  todos.value.forEach(item => {
    if (!allFilteredIds.includes(item.id)) {
      newTodos.push(item);
    }
  });
  
  todos.value = newTodos;
  
  // 保存到本地存储
  saveToLocalStorage();
  
  // 重置状态
  draggedIndex.value = null;
  draggedGroupIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  draggedGroupIndex.value = null;
  dragOverIndex.value = null;
};

// 分组收缩/展开
const toggleGroup = (groupDate: string) => {
  if (collapsedGroups.value.has(groupDate)) {
    collapsedGroups.value.delete(groupDate);
  } else {
    collapsedGroups.value.add(groupDate);
  }
};

// 导出功能
const exportTodos = () => {
  if (todos.value.length === 0) {
    ElMessage.info('没有任务可以导出');
    return;
  }

  try {
    // 导出为 JSON 格式
    const exportData = {
      exportDate: new Date().toISOString(),
      total: todos.value.length,
      completed: completedTodos.value,
      pending: pendingTodos.value,
      todos: todos.value.map(todo => ({
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        completed: todo.completed,
        createdAt: new Date(todo.createdAt).toLocaleString('zh-CN'),
        completedAt: todo.completedAt ? new Date(todo.completedAt).toLocaleString('zh-CN') : null
      }))
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
    
    // 导出后不清除数据，保留所有任务
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};


// 本地存储
const STORAGE_KEY = 'daily-todos';

const saveToLocalStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value));
  } catch (error) {
    console.error('保存失败:', error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      todos.value = JSON.parse(saved);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      todos.value = todos.value.filter(todo => todo.createdAt > sevenDaysAgo || todo.completed);
      saveToLocalStorage();
    }
  } catch (error) {
    console.error('加载失败:', error);
    todos.value = [];
  }
};

onMounted(() => {
  loadFromLocalStorage();
});
</script>

<style scoped lang="scss">
.todo-drawer-content {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.add-section {
  .add-input-wrapper {
    display: flex;
    gap: 0;
    align-items: stretch;
    
    .task-input {
      flex: 1;
      
      :deep(.el-input__wrapper) {
        border-radius: 4px 0 0 4px;
      }
    }
    
    .priority-select {
      width: 90px;
      flex-shrink: 0;
      
      :deep(.el-input__wrapper) {
        border-radius: 0;
        border-left: none;
      }
    }
    
    .add-button {
      border-radius: 0 4px 4px 0;
      flex-shrink: 0;
      padding: 0 20px;
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;

  .toolbar-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.todos-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}

.todo-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(249, 250, 251, 0.95);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(243, 244, 246, 0.95);
  }

  .group-header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .group-icon {
    font-size: 0.75rem;
    color: #6b7280;
    transition: transform 0.3s ease;

    &.collapsed {
      transform: rotate(-90deg);
    }
  }

  .group-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .group-count {
    font-size: 0.75rem;
    font-weight: normal;
    color: #6b7280;
  }
}

.group-todos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
  user-select: none;

  &:hover:not(.dragging) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.dragging {
    opacity: 0.6;
    cursor: grabbing;
  }

  .todo-drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: #9ca3af;
    cursor: grab;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  &.priority-high {
    border-left-color: #ef4444;
  }

  &.priority-medium {
    border-left-color: #f59e0b;
  }

  &.priority-low {
    border-left-color: #10b981;
  }

  &.todo-completed {
    opacity: 0.6;
  }
}

.todo-checkbox {
  margin-top: 0.125rem;
}

.todo-content {
  flex: 1;
  min-width: 0;

  .todo-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: #111827;
    margin-bottom: 0.25rem;
    word-break: break-word;

    &.text-line-through {
      text-decoration: line-through;
      color: #9ca3af;
    }
  }

  .todo-description {
    font-size: 0.8rem;
    color: #6b7280;
    line-height: 1.4;
    margin-top: 0.25rem;
    word-break: break-word;
  }

  .todo-date {
    font-size: 0.7rem;
    color: #9ca3af;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}

.todo-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .todo-actions {
    opacity: 1;
  }
}

// 自定义编辑对话框样式
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.edit-dialog-container {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.edit-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .close-btn {
    padding: 0.25rem;
    color: #6b7280;

    &:hover {
      color: #374151;
    }
  }
}

.edit-dialog-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.edit-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
}
</style>