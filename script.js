document.getElementById("recordForm").addEventListener("submit", async function (e) {
e.preventDefault();
const form = e.target;
const data = {
operator: form.operator.value,
machine: form.machine.value,
shift: form.shift.value,
date: form.date.value,
output: form.output.value,
remarks: form.remarks.value
};
try {
await submitRecord(data);
alert("Record submitted successfully!");
form.reset();
loadRecords();
} catch {
saveRecordOffline(data);
alert("Backend offline. Record saved locally.");
form.reset();
loadRecords();
}
});

async function submitRecord(data) {
const response = await fetch("http://localhost:5001/api/records", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data)
});
if (!response.ok) throw new Error("Failed to submit to backend");
}

function saveRecordOffline(record) {
let offlineRecords = JSON.parse(localStorage.getItem("offlineRecords")) || [];
offlineRecords.push(record);
localStorage.setItem("offlineRecords", JSON.stringify(offlineRecords));
}

async function syncOfflineRecords() {
let offlineRecords = JSON.parse(localStorage.getItem("offlineRecords")) || [];
for (const record of offlineRecords) {
try {
await submitRecord(record);
} catch {
return;
}
}
localStorage.removeItem("offlineRecords");
}

async function loadRecords() {
const tbody = document.querySelector("#recordTable tbody");
tbody.innerHTML = "";
try {
const res = await fetch("http://localhost:5001/api/records");
let records = await res.json();
records.reverse();
records.forEach(data => {
const row = document.createElement("tr");
row.innerHTML = `<td>${data.operator}</td><td>${data.machine}</td><td>${data.shift}</td><td>${new Date(data.date).toLocaleDateString()}</td><td>${data.output}</td><td>${data.remarks}</td>`;
tbody.appendChild(row);
});
} catch (err) {
console.error("Error loading records", err);
}
}

document.getElementById("exportBtn").addEventListener("click", () => {
const table = document.getElementById("recordTable");
const rows = Array.from(table.querySelectorAll("tr"));
let csv = Array.from(table.querySelectorAll("thead th"))
.map(th => th.innerText).join(",") + "\n";


rows.slice(1).forEach(row => {
const cols = row.querySelectorAll("td");
if (cols.length > 0) {
csv += Array.from(cols).map(cell => cell.innerText).join(",") + "\n";
}
});

const blob = new Blob([csv], { type: "text/csv" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "production_records.csv";
link.click();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
localStorage.removeItem("loggedIn");
localStorage.removeItem("userRole");
window.location.href = "login.html";
});

window.onload = async function () {
await syncOfflineRecords();
loadRecords();
const today = new Date().toISOString().split('T')[0];
document.getElementById("dateField").setAttribute("max", today);
const userRole = localStorage.getItem("userRole") || "Unknown";
document.getElementById("userInfo").innerText = "User: " + userRole;
};