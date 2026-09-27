const API = "http://localhost:3000/employees";
const DB_FILE = "../db.json"; // ใช้ตอนไม่มี json-server

// โหมดอ่านอย่างเดียว = ไม่มี json-server ให้ต่อ (เช่นตอนเอาขึ้นเว็บ static)
let readOnly = false;

// ลองต่อ json-server ก่อน ถ้าต่อไม่ได้ค่อยอ่านไฟล์ db.json ตรง ๆ
// (ส่วนนี้เพิ่มมาเพื่อให้เปิดดูบนเว็บได้ ไม่ใช่สิ่งที่โจทย์ต้องการ)
async function fetchEmployees() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch {
    const res = await fetch(DB_FILE);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    readOnly = true;
    return data.employees;
  }
}

// เลือกสีแถบตามค่า Progress
function levelOf(p) {
  if (p >= 80) return "high";
  if (p >= 50) return "mid";
  return "low";
}

// สร้าง td ที่ใส่ข้อความ (ใช้ textContent กันโค้ดแปลก ๆ ในข้อมูล)
function textCell(value) {
  const td = document.createElement("td");
  td.textContent = String(value ?? "").trim();
  return td;
}

// สร้าง td ที่มีแถบกราฟ + ตัวเลข %
function progressCell(value) {
  const p = Math.max(0, Math.min(100, Number(value) || 0));
  const td = document.createElement("td");
  td.innerHTML = `
    <div class="progress">
      <div class="bar"><div class="fill ${levelOf(p)}"></div></div>
      <span class="pct">${p}%</span>
    </div>`;
  td.querySelector(".fill").style.width = p + "%";
  return td;
}

async function loadEmployees() {
  const tbody = document.querySelector("#emp-table tbody");
  const status = document.getElementById("status");

  try {
    const employees = await fetchEmployees();

    if (readOnly) {
      status.className = "notice";
      status.textContent =
        "โหมดอ่านอย่างเดียว: อ่านจากไฟล์ db.json เพราะไม่ได้เปิด json-server ปุ่มแก้ไขจะบันทึกไม่ได้";
    }

    tbody.innerHTML = "";
    employees.forEach((emp) => {
      const tr = document.createElement("tr");
      tr.appendChild(textCell(emp.id));
      tr.appendChild(textCell(`${emp.FirstName.trim()} ${emp.LastName.trim()}`));
      tr.appendChild(textCell(emp.Gender));
      tr.appendChild(textCell(emp.Position));
      tr.appendChild(textCell(emp.Address));
      tr.appendChild(progressCell(emp.Progress));

      // ปุ่มแก้ไข: ส่ง id ของแถวนี้ไปทาง query string
      const action = document.createElement("td");
      const btn = document.createElement("a");
      btn.className = "btn";
      btn.textContent = "แก้ไข";
      btn.href = `edit.html?id=${encodeURIComponent(emp.id)}`;
      action.appendChild(btn);
      tr.appendChild(action);

      tbody.appendChild(tr);
    });

    // โบนัส: ค่าเฉลี่ย
    const total = employees.reduce((sum, e) => sum + Number(e.Progress || 0), 0);
    const avg = employees.length ? total / employees.length : 0;
    document.getElementById("avg").textContent = avg.toFixed(1) + "%";
  } catch (err) {
    status.className = "status";
    status.textContent =
      "โหลดข้อมูลไม่ได้ ตรวจว่าเปิด json-server ที่พอร์ต 3000 แล้วหรือยัง (" + err.message + ")";
  }
}

loadEmployees();
