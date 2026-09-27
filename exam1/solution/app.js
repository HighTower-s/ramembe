const API = "http://localhost:3000/employees";

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
    const res = await fetch(API);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const employees = await res.json();

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
    status.textContent =
      "โหลดข้อมูลไม่ได้ ตรวจว่าเปิด json-server ที่พอร์ต 3000 แล้วหรือยัง (" + err.message + ")";
  }
}

loadEmployees();
