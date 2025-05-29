// 交互式任务管理器 - 主要JavaScript逻辑

// 任务管理器应用类
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentEditingTask = null;
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.setupDragAndDrop();
    }

    // 绑定事件
    bindEvents() {
        // 添加任务按钮
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // 模态框关闭
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // 任务表单提交
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterTasks();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openTaskModal();
            }
        });
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 打开任务模态框
    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        modal.classList.add('active');
    }

    // 关闭任务模态框
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
    }

    // 保存任务到本地存储
    saveTasks() {
        localStorage.setItem('taskManager_tasks', JSON.stringify(this.tasks));
    }

    // 从本地存储加载任务
    loadTasks() {
        const saved = localStorage.getItem('taskManager_tasks');
        return saved ? JSON.parse(saved) : this.getDefaultTasks();
    }

    // 获取默认任务
    getDefaultTasks() {
        return [
            {
                id: 'demo-1',
                title: '欢迎使用任务管理器',
                description: '这是一个演示任务，您可以编辑或删除它。',
                priority: 'high',
                status: 'todo',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // 渲染任务（简化版本）
    renderTasks() {
        console.log('渲染任务列表...');
    }

    // 更新统计信息
    updateStats() {
        console.log('更新统计信息...');
    }

    // 设置拖拽功能
    setupDragAndDrop() {
        console.log('设置拖拽功能...');
    }

    // 过滤任务
    filterTasks() {
        this.renderTasks();
    }
}

// 初始化应用
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    console.log('🚀 任务管理器已启动！');
});

// 注意：这是简化版本，完整功能请查看本地文件