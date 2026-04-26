let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ELEMENTS
const form = document.getElementById("taskForm");
const searchInput = document.getElementById("search");

const taskInput = document.getElementById("taskInput");
const taskDesc = document.getElementById("taskDesc");
const startDate = document.getElementById("startDate");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");

const totalEl = document.getElementById("total");
const activeEl = document.getElementById("active");
const completedEl = document.getElementById("completed");
const completionRateEl = document.getElementById("completionRate");

// HELPERS
function getTimeLeft(due) {
  if (!due) return "No due date";

  const diff = new Date(due) - new Date();
  if (diff <= 0) return "Overdue";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

function isOverdue(task) {
  return task.due && new Date(task.due) < new Date() && !task.completed;
}

// ADD
form.addEventListener("submit", (e) => {
  e.preventDefault();

  tasks.push({
    id: Date.now(),
    text: taskInput.value,
    description: taskDesc.value,
    start: startDate.value,
    due: dueDate.value,
    priority: priority.value,
    completed: false,
    editing: false
  });

  save();
  form.reset();
  showToast("Task added");
});

// SEARCH
searchInput.addEventListener("input", render);

// SAVE
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
}

// DELETE
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter(t => t.id !== id);
  save();
  showToast("Deleted");
}

// TOGGLE
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);

  if (!task.completed && !confirm("Mark complete?")) return;

  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );

  save();
}

// EDIT
function startEdit(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, editing: true } : t
  );
  render();
}

function saveEdit(id) {
  tasks = tasks.map(t =>
    t.id === id
      ? {
          ...t,
          text: document.getElementById(`edit-text-${id}`).value,
          description: document.getElementById(`edit-desc-${id}`).value,
          start: document.getElementById(`edit-start-${id}`).value,
          due: document.getElementById(`edit-due-${id}`).value,
          priority: document.getElementById(`edit-priority-${id}`).value,
          editing: false
        }
      : t
  );

  save();
  showToast("Updated");
}

function cancelEdit(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, editing: false } : t
  );
  render();
}

// TOAST
function showToast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// RENDER
function render() {
  const activeList = document.getElementById("activeList");
  const completedList = document.getElementById("completedList");

  const filtered = tasks.filter(t =>
    t.text.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  const active = filtered.filter(t => !t.completed);
  const done = filtered.filter(t => t.completed);

  totalEl.textContent = tasks.length;
  activeEl.textContent = active.length;
  completedEl.textContent = done.length;
  completionRateEl.textContent =
    tasks.length === 0 ? "0%" : Math.round((done.length / tasks.length) * 100) + "%";

  // ACTIVE
  activeList.innerHTML = active.map(t => {
    if (t.editing) {
      return `
        <li>
          <input class="edit-input" id="edit-text-${t.id}" value="${t.text}">
          <input class="edit-input" id="edit-desc-${t.id}" value="${t.description}">
          <input class="edit-input" type="datetime-local" id="edit-start-${t.id}" value="${t.start}">
          <input class="edit-input" type="datetime-local" id="edit-due-${t.id}" value="${t.due}">
          
          <select id="edit-priority-${t.id}">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button onclick="saveEdit(${t.id})">Save</button>
          <button onclick="cancelEdit(${t.id})">Cancel</button>
        </li>
      `;
    }

    return `
      <li class="${t.priority} ${isOverdue(t) ? "overdue" : ""}">
        <div class="task-title">
          ${t.text}
          ${isOverdue(t) ? '<span class="tag red">Overdue</span>' : ''}
        </div>

        <div class="task-desc">${t.description || ""}</div>

        <div class="task-meta">Start: ${t.start || "-"}</div>
        <div class="task-meta">Due: ${t.due || "-"}</div>

        <div class="countdown">⏳ ${getTimeLeft(t.due)}</div>

        <div class="actions">
          <button onclick="startEdit(${t.id})">Edit</button>
          <button onclick="toggleTask(${t.id})">Complete</button>
          <button onclick="deleteTask(${t.id})">Delete</button>
        </div>
      </li>
    `;
  }).join("");

  // COMPLETED
  completedList.innerHTML = done.map(t => `
    <li class="completed ${t.priority}">
      ${t.text}
      <div class="actions">
        <button onclick="toggleTask(${t.id})">Undo</button>
        <button onclick="deleteTask(${t.id})">Delete</button>
      </div>
    </li>
  `).join("");
}

render();

// LIVE COUNTDOWN
setInterval(render, 60000);