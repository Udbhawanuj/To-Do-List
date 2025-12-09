const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const themeToggle = document.getElementById("themeToggle");

let tasks = [];
let searchQuery = "";

function loadTheme() {
    const savedTheme = localStorage.getItem("todo_theme");
    if (savedTheme === "light") {
        document.body.classList.add("light");
        themeToggle.textContent = "☀️";
    }
}

function toggleTheme() {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("todo_theme", isLight ? "light" : "dark");
}

themeToggle.addEventListener("click", toggleTheme);
loadTheme();

function loadTasks() {
    const saved = localStorage.getItem("todo_tasks");
    if (saved) {
        tasks = JSON.parse(saved);
    }
    renderTasks();
}

function saveTasks() {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    const priority = priorityInput.value;
    const dueDate = dateInput.value || null;
    const task = {
        id: Date.now(),
        text,
        priority,
        dueDate,
        completed: false
    };
    tasks.unshift(task);
    taskInput.value = "";
    dateInput.value = "";
    saveTasks();
    renderTasks();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", e => {
    if (e.key === "Enter") addTask();
});

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

function createPriorityBadge(priority) {
    const span = document.createElement("span");
    span.classList.add("priority-badge");
    if (priority === "high") {
        span.classList.add("priority-high");
        span.textContent = "High";
    } else if (priority === "low") {
        span.classList.add("priority-low");
        span.textContent = "Low";
    } else {
        span.classList.add("priority-medium");
        span.textContent = "Medium";
    }
    return span;
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    const options = { day: "2-digit", month: "short" };
    return d.toLocaleDateString(undefined, options);
}

function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    const d = new Date(task.dueDate + "T23:59:59");
    return d < today;
}

function renderTasks() {
    taskList.innerHTML = "";
    const filtered = tasks.filter(t =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        const left = document.createElement("div");
        left.className = "left-side";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.className = "task-checkbox";
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const textSpan = document.createElement("span");
        textSpan.className = "task-text";
        textSpan.textContent = task.text;
        if (task.completed) textSpan.classList.add("completed");

        const metaRow = document.createElement("div");
        metaRow.className = "meta-row";

        const badge = createPriorityBadge(task.priority);
        metaRow.appendChild(badge);

        if (task.dueDate) {
            const dateSpan = document.createElement("span");
            dateSpan.className = "due-date";
            dateSpan.textContent = "Due " + formatDate(task.dueDate);
            if (isOverdue(task)) dateSpan.classList.add("overdue");
            metaRow.appendChild(dateSpan);
        }

        content.appendChild(textSpan);
        content.appendChild(metaRow);

        left.appendChild(checkbox);
        left.appendChild(content);

        const actions = document.createElement("div");
        actions.className = "actions";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "action-btn edit-btn";
        editBtn.addEventListener("click", () => {
            const newText = prompt("Update task:", task.text);
            if (newText && newText.trim()) {
                task.text = newText.trim();
                saveTasks();
                renderTasks();
            }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "action-btn delete-btn";
        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(left);
        li.appendChild(actions);
        taskList.appendChild(li);
    });
    updateStats();
}

searchInput.addEventListener("input", e => {
    searchQuery = e.target.value;
    renderTasks();
});

clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
});

loadTasks();
