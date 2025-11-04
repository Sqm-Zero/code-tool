<template>
  <div class="todo-tool">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header">
        <h1 class="title">每日 TODO</h1>
        <p class="subtitle">管理你的每日任务，提高工作效率</p>
      </div>

      <!-- 统计面板 -->
      <el-card class="stats-panel">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalTodos }}</div>
            <div class="stat-label">总任务</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ completedTodos }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ pendingTodos }}</div>
            <div class="stat-label">待完成</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>
      </el-card>

      <!-- 添加任务面板 -->
      <el-card class="add-panel">
        <template #header>
          <div class="card-header">
            <span>添加新任务</span>
          </div>
        </template>
        <div class="add-form">
          <el-input
            v-model="newTodo.title"
            placeholder="输入任务标题..."
            class="todo-input"
            @keyup.enter="addTodo"
            clearable
          >
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
          <el-input
            v-model="newTodo.description"
            placeholder="任务描述（可选）..."
            class="todo-input"
            @keyup.enter="addTodo"
            clearable
          >
            <template #prefix>
              <el-icon><EditPen /></el-icon>
            </template>
          </el-input>
          <div class="form-actions">
            <el-select v-model="newTodo.priority" placeholder="优先级" style="width: 120px">
              <el-option label="高" value="high">
                <el-icon><ArrowUp /></el-icon>
                <span>高</span>
              </el-option>
              <el-option label="中" value="medium">
                <el-icon><Minus /></el-icon>
                <span>中</span>
              </el-option>
              <el-option label="低" value="low">
                <el-icon><ArrowDown /></el-icon>
                <span>低</span>
              </el-option>
            </el-select>
            <el-button type="primary" @click="addTodo" icon="Plus" :disabled="!newTodo.title.trim()">
              添加任务
            </el-button>
            <el-button @click="clearNewTodo" icon="RefreshLeft" plain>
              重置
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 过滤和排序 -->
      <el-card class="filter-panel">
        <div class="filter-controls">
          <div class="filter-group">
            <span class="filter-label">筛选：</span>
            <el-radio-group v-model="filterType" size="default">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="pending">待完成</el-radio-button>
              <el-radio-button label="completed">已完成</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-group">
            <span class="filter-label">排序：</span>
            <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px">
              <el-option label="创建时间" value="created" />
              <el-option label="优先级" value="priority" />
              <el-option label="完成时间" value="completed" />
            </el-select>
          </div>
          <div class="filter-group">
            <el-button @click="clearCompleted" icon="Delete" plain type="danger">
              清除已完成
            </el-button>
            <el-button @click="clearAll" icon="Delete" plain type="danger">
              清空全部
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 任务列表 -->
      <el-card class="todos-panel">
        <template #header>
          <div class="card-header">
            <span>任务列表</span>
            <span class="todo-count">{{ filteredTodos.length }} 项任务</span>
          </div>
        </template>

        <!-- 空状态 -->
        <el-empty
          v-if="filteredTodos.length === 0"
          description="还没有任务，快来添加一个吧！"
          :image-size="100"
        />

        <!-- 任务项 -->
        <div v-else class="todos-list">
          <transition-group name="todo-list" tag="div">
            <div
              v-for="todo in filteredTodos"
              :key="todo.id"
              class="todo-item"
              :class="{
                'todo-completed': todo.completed,
                'priority-high': todo.priority === 'high',
                'priority-medium': todo.priority === 'medium',
                'priority-low': todo.priority === 'low'
              }"
            >
              <div class="todo-content">
                <el-checkbox
                  v-model="todo.completed"
                  @change="updateTodo(todo)"
                  class="todo-checkbox"
                >
                </el-checkbox>
                <div class="todo-text">
                  <div class="todo-title" :class="{ 'text-line-through': todo.completed }">
                    {{ todo.title }}
                  </div>
                  <div v-if="todo.description" class="todo-description">
                    {{ todo.description }}
                  </div>
                  <div class="todo-meta">
                    <el-tag
                      :type="getPriorityType(todo.priority)"
                      size="small"
                      effect="plain"
                    >
                      <el-icon v-if="todo.priority === 'high'"><ArrowUp /></el-icon>
                      <el-icon v-else-if="todo.priority === 'low'"><ArrowDown /></el-icon>
                      <el-icon v-else><Minus /></el-icon>
                      {{ getPriorityLabel(todo.priority) }}
                    </el-tag>
                    <span class="todo-time">
                      创建于 {{ formatTime(todo.createdAt) }}
                    </span>
                    <span v-if="todo.completed && todo.completedAt" class="todo-time">
                      完成于 {{ formatTime(todo.completedAt) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="todo-actions">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="editTodo(todo)"
                  icon="Edit"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="deleteTodo(todo.id)"
                  icon="Delete"
                >
                  删除
                </el-button>
              </div>
            </div>
          </transition-group>
        </div>
      </el-card>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑任务"
      width="500px"
      @close="cancelEdit"
    >
      <el-form :model="editingTodo" label-width="80px">
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
          <el-select v-model="editingTodo.priority" placeholder="选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Document,
  EditPen,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue';
import type { TodoItem } from './types/todo';

// 状态管理
const todos = ref<TodoItem[]>([]);
const newTodo = ref({
  title: '',
  description: '',
  priority: 'medium' as 'high' | 'medium' | 'low'
});
const filterType = ref<'all' | 'pending' | 'completed'>('all');
const sortBy = ref<'created' | 'priority' | 'completed'>('created');
const editDialogVisible = ref(false);
const editingTodo = ref<TodoItem | null>(null);

// 计算属性
const totalTodos = computed(() => todos.value.length);
const completedTodos = computed(() => todos.value.filter(t => t.completed).length);
const pendingTodos = computed(() => todos.value.filter(t => !t.completed).length);
const completionRate = computed(() => {
  if (totalTodos.value === 0) return 0;
  return Math.round((completedTodos.value / totalTodos.value) * 100);
});

const filteredTodos = computed(() => {
  let result = [...todos.value];

  // 筛选
  if (filterType.value === 'pending') {
    result = result.filter(t => !t.completed);
  } else if (filterType.value === 'completed') {
    result = result.filter(t => t.completed);
  }

  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy.value === 'completed') {
      if (a.completed && b.completed) {
        return (b.completedAt || 0) - (a.completedAt || 0);
      }
      return Number(b.completed) - Number(a.completed);
    } else {
      // 创建时间排序
      return b.createdAt - a.createdAt;
    }
  });

  return result;
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
    description: newTodo.value.description.trim(),
    priority: newTodo.value.priority,
    completed: false,
    createdAt: Date.now(),
    completedAt: null
  };

  todos.value.unshift(todo);
  saveToLocalStorage();
  clearNewTodo();
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
  editingTodo.value = { ...todo };
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
  editDialogVisible.value = false;
  editingTodo.value = null;
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

const clearAll = async () => {
  if (todos.value.length === 0) {
    ElMessage.info('任务列表为空');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要清空所有任务吗？此操作不可恢复！', '危险操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false
    });
    todos.value = [];
    saveToLocalStorage();
    ElMessage.success('已清空所有任务');
  } catch {
    // 用户取消
  }
};

const clearNewTodo = () => {
  newTodo.value = {
    title: '',
    description: '',
    priority: 'medium'
  };
};

// 工具方法
const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  };
  return map[priority] || '中';
};

const getPriorityType = (priority: string): '' | 'success' | 'warning' | 'danger' => {
  const map: Record<string, '' | 'success' | 'warning' | 'danger'> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  };
  return map[priority] || 'warning';
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todoDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (todoDate.getTime() === today.getTime()) {
    // 今天
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (todoDate.getTime() === today.getTime() - 86400000) {
    // 昨天
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    // 其他日期
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
};

// 本地存储
const STORAGE_KEY = 'daily-todos';

const saveToLocalStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      todos.value = JSON.parse(saved);
      // 清理过旧的任务（可选：保留最近7天的任务）
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      todos.value = todos.value.filter(todo => todo.createdAt > sevenDaysAgo || todo.completed);
      saveToLocalStorage();
    }
  } catch (error) {
    console.error('从本地存储加载失败:', error);
    todos.value = [];
  }
};

// 生命周期
onMounted(() => {
  loadFromLocalStorage();
});
</script>

<style scoped lang="scss">
.todo-tool {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;

  .title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1rem;
    color: #6b7280;
  }
}

.stats-panel {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    padding: 1rem;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        font-size: 0.9rem;
        color: #6b7280;
      }
    }
  }
}

.add-panel,
.filter-panel,
.todos-panel {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .todo-input {
    margin-bottom: 0.5rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .filter-label {
      font-weight: 500;
      color: #374151;
    }
  }
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
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
    opacity: 0.7;
    background: #f9fafb;
  }
}

.todo-content {
  display: flex;
  gap: 1rem;
  flex: 1;
  align-items: flex-start;

  .todo-checkbox {
    margin-top: 0.25rem;
  }

  .todo-text {
    flex: 1;

    .todo-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;

      &.text-line-through {
        text-decoration: line-through;
        color: #9ca3af;
      }
    }

    .todo-description {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }

    .todo-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      font-size: 0.85rem;
      color: #9ca3af;

      .todo-time {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }
  }
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

// 过渡动画
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.3s ease;
}

.todo-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.todo-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.todo-list-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .todo-tool {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 1rem !important;
  }

  .filter-controls {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .todo-item {
    flex-direction: column;
    gap: 1rem;
  }

  .todo-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
