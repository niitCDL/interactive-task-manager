// 交互式任务管理器 v2.0 - 增强版

// 粒子系统类
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isActive = false;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 5,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01,
            size: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        };
    }

    celebrate(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        this.isActive = true;
        this.animate();
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3;
            particle.life -= particle.decay;
            
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            
            if (particle.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
            }
            
            this.ctx.restore();
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isActive = false;
        }
    }
}

// 图表类
class ProgressChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.progress = 0;
        this.targetProgress = 0;
    }

    setProgress(percentage) {
        this.targetProgress = percentage;
        this.animateProgress();
    }

    animateProgress() {
        const diff = this.targetProgress - this.progress;
        if (Math.abs(diff) > 0.5) {
            this.progress += diff * 0.1;
            this.draw();
            requestAnimationFrame(() => this.animateProgress());
        } else {
            this.progress = this.targetProgress;
            this.draw();
        }
    }

    draw() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 45;
        const lineWidth = 8;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (2 * Math.PI * this.progress / 100);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary');
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

// 主任务管理器类
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentEditingTask = null;
        this.selectedTags = [];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.initializeComponents();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.setupDragAndDrop();
        this.applyTheme();
    }

    initializeComponents() {
        const canvas = document.getElementById('celebrationCanvas');
        this.particleSystem = new ParticleSystem(canvas);

        const chartCanvas = document.getElementById('progressChart');
        this.progressChart = new ProgressChart(chartCanvas);
    }

    bindEvents() {
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('statsToggle').addEventListener('click', () => {
            this.toggleStatsPanel();
        });

        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterTasks();
        });

        document.getElementById('priorityFilter').addEventListener('change', () => {
            this.filterTasks();
        });

        document.getElementById('tagFilter').addEventListener('change', () => {
            this.filterTasks();
        });

        document.querySelectorAll('.tag-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTagSelection(btn);
            });
        });

        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeTaskModal();
            }
        });

        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeDeleteModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeDeleteModal();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openTaskModal();
            }
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        setTimeout(() => {
            this.updateProgressChart();
        }, 100);
    }

    toggleStatsPanel() {
        const panel = document.getElementById('statsPanel');
        panel.classList.toggle('active');
        this.updateProgressChart();
    }

    toggleTagSelection(button) {
        const tag = button.dataset.tag;
        button.classList.toggle('selected');
        
        if (this.selectedTags.includes(tag)) {
            this.selectedTags = this.selectedTags.filter(t => t !== tag);
        } else {
            this.selectedTags.push(tag);
        }
        
        this.updateSelectedTagsDisplay();
    }

    updateSelectedTagsDisplay() {
        const container = document.getElementById('selectedTags');
        container.innerHTML = '';
        
        this.selectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `task-tag ${tag}`;
            tagElement.textContent = this.getTagDisplayName(tag);
            container.appendChild(tagElement);
        });
    }

    getTagDisplayName(tag) {
        const tagNames = {
            work: '工作',
            study: '学习',
            life: '生活',
            urgent: '紧急'
        };
        return tagNames[tag] || tag;
    }

    setupDragAndDrop() {
        const taskLists = document.querySelectorAll('.task-list');
        
        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = list.dataset.status;
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        this.currentEditingTask = task;
        this.selectedTags = [];
        
        document.querySelectorAll('.tag-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        if (task) {
            modalTitle.textContent = '编辑任务';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            
            if (task.tags) {
                this.selectedTags = [...task.tags];
                task.tags.forEach(tag => {
                    const button = document.querySelector(`[data-tag="${tag}"]`);
                    if (button) button.classList.add('selected');
                });
                this.updateSelectedTagsDisplay();
            }
        } else {
            modalTitle.textContent = '添加新任务';
            form.reset();
            this.updateSelectedTagsDisplay();
        }
        
        modal.classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        this.currentEditingTask = null;
        this.selectedTags = [];
    }

    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) {
            this.showNotification('请输入任务标题', 'error');
            return;
        }

        const taskData = {
            title,
            description,
            priority,
            dueDate,
            tags: [...this.selectedTags],
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditingTask) {
            const taskIndex = this.tasks.findIndex(t => t.id === this.currentEditingTask.id);
            this.tasks[taskIndex] = { ...this.currentEditingTask, ...taskData };
            this.showNotification('任务已更新');
        } else {
            const newTask = {
                id: this.generateId(),
                status: 'todo',
                createdAt: new Date().toISOString(),
                ...taskData
            };
            this.tasks.push(newTask);
            this.showNotification('任务已添加');
        }

        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeTaskModal();
    }

    deleteTask(taskId) {
        this.taskToDelete = taskId;
        document.getElementById('deleteModal').classList.add('active');
    }

    confirmDelete() {
        if (this.taskToDelete) {
            this.tasks = this.tasks.filter(task => task.id !== this.taskToDelete);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('任务已删除');
            this.closeDeleteModal();
        }
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
        this.taskToDelete = null;
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            
            if (newStatus === 'completed') {
                task.completedAt = new Date().toISOString();
                this.showAchievement();
                this.triggerCelebration();
            }
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    showAchievement() {
        const achievement = document.getElementById('achievement');
        achievement.classList.add('show');
        
        setTimeout(() => {
            achievement.classList.remove('show');
        }, 3000);
    }

    triggerCelebration() {
        const completedColumn = document.getElementById('completedList');
        const rect = completedColumn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.particleSystem.celebrate(x, y);
    }

    renderTasks() {
        const todoList = document.getElementById('todoList');
        const inProgressList = document.getElementById('inProgressList');
        const completedList = document.getElementById('completedList');

        [todoList, inProgressList, completedList].forEach(list => {
            list.innerHTML = '';
        });

        const filteredTasks = this.getFilteredTasks();

        const tasksByStatus = {
            todo: filteredTasks.filter(task => task.status === 'todo'),
            'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
            completed: filteredTasks.filter(task => task.status === 'completed')
        };

        Object.entries(tasksByStatus).forEach(([status, tasks]) => {
            const listElement = document.getElementById(status === 'in-progress' ? 'inProgressList' : status + 'List');
            
            if (tasks.length === 0) {
                listElement.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>暂无任务</p>
                    </div>
                `;
            } else {
                tasks.forEach(task => {
                    listElement.appendChild(this.createTaskElement(task));
                });
            }
        });

        this.updateColumnCounts(tasksByStatus);
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item priority-${task.priority}`;
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN');
        };

        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

        const tagsHtml = task.tags && task.tags.length > 0 ? `
            <div class="task-tags">
                ${task.tags.map(tag => `<span class="task-tag ${tag}">${this.getTagDisplayName(tag)}</span>`).join('')}
            </div>
        ` : '';

        taskElement.innerHTML = `
            <div class="task-header">
                <div>
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    ${tagsHtml}
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" onclick="taskManager.openTaskModal(taskManager.getTask('${task.id}'))">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-priority priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
                ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(task.dueDate)}
                </span>` : ''}
            </div>
        `;

        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            taskElement.classList.add('dragging');
        });

        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });

        return taskElement;
    }

    getTask(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    getPriorityText(priority) {
        const priorityMap = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return priorityMap[priority] || priority;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getFilteredTasks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const priorityFilter = document.getElementById('priorityFilter').value;
        const tagFilter = document.getElementById('tagFilter').value;

        return this.tasks.filter(task => {
            const matchesSearch = !searchTerm || 
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm));
            
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;
            
            const matchesTag = !tagFilter || (task.tags && task.tags.includes(tagFilter));

            return matchesSearch && matchesPriority && matchesTag;
        });
    }

    filterTasks() {
        this.renderTasks();
    }

    updateStats() {
        const stats = {
            todo: this.tasks.filter(task => task.status === 'todo').length,
            inProgress: this.tasks.filter(task => task.status === 'in-progress').length,
            completed: this.tasks.filter(task => task.status === 'completed').length,
            total: this.tasks.length
        };

        document.getElementById('todoCount').textContent = stats.todo;
        document.getElementById('inProgressCount').textContent = stats.inProgress;
        document.getElementById('completedCount').textContent = stats.completed;

        document.getElementById('todoStat').textContent = stats.todo;
        document.getElementById('inProgressStat').textContent = stats.inProgress;
        document.getElementById('completedStat').textContent = stats.completed;
        document.getElementById('totalStat').textContent = stats.total;

        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        document.getElementById('completionRate').textContent = `${completionRate}%`;

        this.updateProgressChart();
    }

    updateProgressChart() {
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = this.tasks.length;
        const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        if (this.progressChart) {
            this.progressChart.setProgress(percentage);
        }
    }

    updateColumnCounts(tasksByStatus) {
        document.getElementById('todoColumnCount').textContent = tasksByStatus.todo.length;
        document.getElementById('inProgressColumnCount').textContent = tasksByStatus['in-progress'].length;
        document.getElementById('completedColumnCount').textContent = tasksByStatus.completed.length;
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    saveTasks() {
        localStorage.setItem('taskManager_tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('taskManager_tasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved tasks:', e);
                return [];
            }
        }
        return this.getDefaultTasks();
    }

    getDefaultTasks() {
        return [
            {
                id: 'demo-1',
                title: '欢迎使用任务管理器 v2.0',
                description: '体验全新的暗黑模式、任务标签和庆祝动画功能！',
                priority: 'high',
                status: 'todo',
                tags: ['work', 'urgent'],
                createdAt: new Date().toISOString(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 'demo-2',
                title: '尝试拖拽功能',
                description: '将任务拖拽到“已完成”列，观看精彩的庆祝动画！',
                priority: 'medium',
                status: 'in-progress',
                tags: ['study'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo-3',
                title: '探索新功能',
                description: '点击主题切换按钮体验暗黑模式，查看统计图表。',
                priority: 'low',
                status: 'completed',
                tags: ['life'],
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            }
        ];
    }
}

let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    console.log('🚀 任务管理器 v2.0 已启动！');
    console.log('✨ 新功能：');
    console.log('   🌙 暗黑模式切换 (Ctrl+D)');
    console.log('   🎉 任务完成庆祝动画');
    console.log('   📊 任务统计图表');
    console.log('   🏷️ 任务标签系统');
    console.log('💡 快捷键：');
    console.log('   Ctrl+N: 添加新任务');
    console.log('   Ctrl+D: 切换主题');
    console.log('   Esc: 关闭模态框');
});

window.addEventListener('beforeunload', (e) => {
    if (taskManager && taskManager.tasks.length > 0) {
        taskManager.saveTasks();
    }
});