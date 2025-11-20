const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const prioritySelect = document.getElementById("prioritySelect");
const categorySelect = document.getElementById("categorySelect");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const notif = document.getElementById("notif");
let filter = "all";

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", renderTasks);

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keyup", e => { if (e.key === "Enter") addTask(); });

searchInput.addEventListener("input", renderTasks);

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filter = btn.dataset.filter;
        renderTasks();
    });
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

/* --- Add Task --- */
function addTask() {
    if (!taskInput.value.trim()) return;

    tasks.push({
        text: taskInput.value,
        done: false,
        priority: prioritySelect.value,
        category: categorySelect.value
    });

    saveTasks();
    renderTasks();
    notify("Tâche ajoutée !");
    taskInput.value = "";
}

/* --- Render Tasks --- */
function renderTasks() {
    taskList.innerHTML = "";

    let filtered = tasks.filter(t =>
        t.text.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    if (filter === "active") filtered = filtered.filter(t => !t.done);
    if (filter === "done") filtered = filtered.filter(t => t.done);

    filtered.forEach((task, index) => {
        const li = document.createElement("li");
        li.classList.add(task.priority);
        if (task.done) li.classList.add("done");
        li.draggable = true;

        li.innerHTML = `
            <span>${task.text}</span>
            <span class="tag ${task.category}">${task.category}</span>
            <div class="action-btns">
                <i class="fa-solid fa-pen-to-square edit"></i>
                <i class="fa-solid fa-check done-icon"></i>
                <i class="fa-solid fa-trash delete"></i>
            </div>
        `;

        li.querySelector(".done-icon").onclick = () => toggleDone(index);
        li.querySelector(".delete").onclick = () => deleteTask(index);
        li.querySelector(".edit").onclick = () => editTask(index);

        /* Drag & drop */
        li.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", index));
        li.addEventListener("dragover", e => e.preventDefault());
        li.addEventListener("drop", e => {
            const from = e.dataTransfer.getData("text");
            reorder(from, index);
        });

        taskList.appendChild(li);
    });
}

/* --- Edit Task --- */
function editTask(i) {
    const newText = prompt("Modifier la tâche :", tasks[i].text);
    if (!newText) return;
    tasks[i].text = newText;
    saveTasks();
    renderTasks();
    notify("Tâche modifiée");
}

/* --- Done --- */
function toggleDone(i) {
    tasks[i].done = !tasks[i].done;
    saveTasks();
    renderTasks();
}

/* --- Delete --- */
function deleteTask(i) {
    tasks.splice(i, 1);
    saveTasks();
    renderTasks();
    notify("Tâche supprimée");
}

/* --- Reorder (drag & drop) --- */
function reorder(from, to) {
    const item = tasks.splice(from, 1)[0];
    tasks.splice(to, 0, item);
    saveTasks();
    renderTasks();
}

/* --- Save LocalStorage --- */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* --- Notifications --- */
function notify(text) {
    notif.textContent = text;
    notif.style.display = "block";
    setTimeout(() => notif.style.display = "none", 1500);
}
