const STORAGE_KEY = "todolist.tasks";

const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const summary = document.querySelector("#summary");
const filters = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    done: false,
  });
  input.value = "";
  persist();
  render();
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.done);
  if (currentFilter === "done") return tasks.filter((task) => task.done);
  return tasks;
}

function render() {
  const remaining = tasks.filter((task) => !task.done).length;
  summary.textContent = `${remaining} task${remaining === 1 ? "" : "s"} remaining`;

  const visible = visibleTasks();
  list.innerHTML = "";
  emptyState.classList.toggle("is-visible", visible.length === 0);
  emptyState.textContent = tasks.length === 0
    ? "Nothing here yet. Add a task to get started."
    : "No tasks in this filter.";

  visible.forEach((task) => {
    const item = document.createElement("li");
    item.className = `item${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.title} complete`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      persist();
      render();
    });

    const title = document.createElement("p");
    title.className = "title";
    title.textContent = task.title;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      persist();
      render();
    });

    item.append(checkbox, title, remove);
    list.append(item);
  });
}

render();
