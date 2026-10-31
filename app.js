const STORAGE_KEY = "todolist.tasks";

const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const dueInput = document.querySelector("#due-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const summary = document.querySelector("#summary");
const filters = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  const due = dueInput.value;
  if (!title || !due) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    due,
    done: false,
  });
  input.value = "";
  dueInput.value = "";
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

function compareByDue(a, b) {
  if (a.due === b.due) return 0;
  if (!a.due) return 1;
  if (!b.due) return -1;
  return a.due < b.due ? -1 : 1;
}

function visibleTasks() {
  const sorted = [...tasks].sort(compareByDue);
  if (currentFilter === "active") return sorted.filter((task) => !task.done);
  if (currentFilter === "done") return sorted.filter((task) => task.done);
  return sorted;
}

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function groupByMonth(sortedTasks) {
  const groups = new Map();

  sortedTasks.forEach((task) => {
    const key = task.due ? task.due.slice(0, 7) : "none";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(task);
  });

  return [...groups.entries()].map(([key, entries]) => ({
    key,
    label: key === "none" ? "No due date" : monthLabel(key),
    tasks: entries,
  }));
}

function formatDue(iso, done) {
  if (!iso) return "No due date";

  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((date - startOfToday) / 86400000);

  if (!done) {
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays === -1) return "Due yesterday";
  }

  const options = { weekday: "short", month: "short", day: "numeric" };
  if (year !== today.getFullYear()) options.year = "numeric";
  const label = date.toLocaleDateString(undefined, options);

  return !done && diffDays < 0 ? `Overdue · ${label}` : `Due ${label}`;
}

function createItem(task, today) {
  const item = document.createElement("li");
  item.className = `item${task.done ? " done" : ""}`;
  if (task.due) {
    item.classList.toggle("is-overdue", !task.done && task.due < today);
    item.classList.toggle("is-today", !task.done && task.due === today);
  }

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

  const body = document.createElement("div");
  body.className = "body";

  const title = document.createElement("p");
  title.className = "title";
  title.textContent = task.title;

  const due = document.createElement("time");
  due.className = "due";
  due.textContent = formatDue(task.due, task.done);
  if (task.due) {
    due.dateTime = task.due;
  }

  body.append(title, due);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => {
    tasks = tasks.filter((entry) => entry.id !== task.id);
    persist();
    render();
  });

  item.append(checkbox, body, remove);
  return item;
}

function render() {
  const remaining = tasks.filter((task) => !task.done).length;
  summary.textContent = `${remaining} task${remaining === 1 ? "" : "s"} remaining`;

  const today = todayIso();
  const thisMonth = currentMonthKey();
  const visible = visibleTasks();
  const groups = groupByMonth(visible);

  list.innerHTML = "";
  emptyState.classList.toggle("is-visible", visible.length === 0);
  emptyState.textContent = tasks.length === 0
    ? "Nothing here yet. Add a task to get started."
    : "No tasks in this filter.";

  groups.forEach((group) => {
    const section = document.createElement("li");
    section.className = "month";

    const heading = document.createElement("h2");
    heading.className = "month-heading";
    if (group.key === thisMonth) heading.classList.add("is-current");

    const name = document.createElement("span");
    name.className = "month-name";
    name.textContent = group.label;

    const count = document.createElement("span");
    count.className = "month-count";
    const total = group.tasks.length;
    count.textContent = `${total} task${total === 1 ? "" : "s"}`;

    heading.append(name, count);

    const groupList = document.createElement("ul");
    groupList.className = "month-list";
    group.tasks.forEach((task) => groupList.append(createItem(task, today)));

    section.append(heading, groupList);
    list.append(section);
  });
}

render();
