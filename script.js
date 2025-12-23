// ---------------- TAB SWITCH ----------------
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.add("hidden"));
  document.getElementById(tabId).classList.remove("hidden");
}

// ---------------- LOAD & NORMALIZE ----------------
let expenses = (JSON.parse(localStorage.getItem("expenses")) || []).map(e => {
  const d = e.timestamp ? new Date(e.timestamp) : new Date();
  return {
    timestamp: e.timestamp || d.getTime(),
    date: e.date || d.toLocaleDateString(),
    time: e.time || d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    category: e.category || "Other",
    desc: e.desc || "",
    amount: Number(e.amount) || 0
  };
});

let totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

// ---------------- ADD EXPENSE ----------------
function addExpense() {
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const amount = document.getElementById("amount").value;
  if (!desc || !amount) return;

  const now = new Date();

  expenses.push({
    timestamp: now.getTime(),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    category,
    desc,
    amount: Number(amount)
  });

  totalSpent += Number(amount);
  saveAndRender();

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
}

// ---------------- QUICK ADD ----------------
function quickAdd() {
  const amount = document.getElementById("quickAmount").value;
  if (!amount) return;

  const now = new Date();

  expenses.push({
    timestamp: now.getTime(),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    category: "Other",
    desc: "Quick add",
    amount: Number(amount)
  });

  totalSpent += Number(amount);
  saveAndRender();
  document.getElementById("quickAmount").value = "";
}

// ---------------- EDIT ----------------
function editExpense(i) {
  const e = expenses[i];
  const newDesc = prompt("Edit description:", e.desc);
  if (newDesc === null) return;

  const newAmount = prompt("Edit amount:", e.amount);
  if (newAmount === null || isNaN(newAmount)) return;

  totalSpent -= e.amount;
  e.desc = newDesc;
  e.amount = Number(newAmount);
  totalSpent += e.amount;

  saveAndRender();
}

// ---------------- DELETE + UNDO ----------------
let lastDeleted = null;

function deleteExpense(i) {
  lastDeleted = { item: expenses[i], index: i };

  totalSpent -= expenses[i].amount;
  expenses.splice(i, 1);

  document.getElementById("undoBar").style.display = "block";
  saveAndRender();
}

function undoDelete() {
  if (!lastDeleted) return;

  expenses.splice(lastDeleted.index, 0, lastDeleted.item);
  totalSpent += lastDeleted.item.amount;
  lastDeleted = null;

  document.getElementById("undoBar").style.display = "none";
  saveAndRender();
}

// ---------------- SAVE + RENDER ----------------
function saveAndRender() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("totalSpent", totalSpent);
  renderExpenses();
  updateSpendingContext();
}

function renderExpenses() {
  const table = document.getElementById("expenseTable");
  table.innerHTML = "";

  expenses.forEach((e, i) => {
    table.innerHTML += `
      <tr>
        <td>${e.date}</td>
        <td>${e.time}</td>
        <td>${e.category}</td>
        <td>${e.desc}</td>
        <td>${e.amount}</td>
        <td>
          <button onclick="editExpense(${i})">✏️</button>
          <button onclick="deleteExpense(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("totalSpent").innerText = totalSpent;
}

// ---------------- CONTEXT ----------------
function updateSpendingContext() {
  const el = document.getElementById("spendingContext");
  if (!el) return;

  const now = new Date();
  let today = 0, month = 0, lastMonth = 0;

  expenses.forEach(e => {
    const d = new Date(e.timestamp);

    if (d.toDateString() === now.toDateString()) today += e.amount;
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += e.amount;

    if (
      (now.getMonth() === 0 && d.getMonth() === 11 && d.getFullYear() === now.getFullYear() - 1) ||
      (d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear())
    ) {
      lastMonth += e.amount;
    }
  });

  let compare = "";
  if (lastMonth > 0) {
    compare = month > lastMonth
      ? "You’re spending more than last month ⚠️"
      : "You’re spending less than last month 👍";
  }

  el.innerHTML = `
    You’ve spent <strong>₹${today}</strong> today.<br>
    You’ve spent <strong>₹${month}</strong> this month.<br>
    ${compare}
  `;
}

// ---------------- INIT ----------------
renderExpenses();
updateSpendingContext();
