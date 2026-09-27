const API = "http://localhost:3000/employees";
const DB_FILE = "../db.json"; // ใช้ตอนไม่มี json-server

// โหมดอ่านอย่างเดียว = ไม่มี json-server ให้ต่อ (เช่นตอนเอาขึ้นเว็บ static)
let readOnly = false;

// 1) อ่าน id จาก URL เช่น edit.html?id=3
const id = new URLSearchParams(location.search).get("id");
const form = document.getElementById("edit-form");
const status = document.getElementById("status");
const errorBox = document.getElementById("error");

// ลองต่อ json-server ก่อน ถ้าต่อไม่ได้ค่อยหาในไฟล์ db.json แทน
// (ส่วนนี้เพิ่มมาเพื่อให้เปิดดูบนเว็บได้ ไม่ใช่สิ่งที่โจทย์ต้องการ)
async function fetchEmployee(empId) {
  try {
    const res = await fetch(`${API}/${encodeURIComponent(empId)}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch {
    const res = await fetch(DB_FILE);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    readOnly = true;

    const found = data.employees.find((e) => String(e.id) === String(empId));
    if (!found) throw new Error("ไม่พบพนักงาน id " + empId);
    return found;
  }
}

// 2) ดึงข้อมูลของแถวที่กดมา แล้วเติมลงฟอร์ม
async function loadEmployee() {
  if (!id) {
    status.textContent = "ไม่พบ id ใน URL";
    return;
  }
  try {
    const emp = await fetchEmployee(id);

    form.elements.empId.value = emp.id;
    form.elements.FirstName.value = emp.FirstName.trim();
    form.elements.LastName.value = emp.LastName.trim();
    form.elements.Gender.value = emp.Gender;
    form.elements.Position.value = emp.Position.trim();
    form.elements.Address.value = emp.Address.trim();
    form.elements.Progress.value = emp.Progress;

    // ไม่มี json-server ก็บันทึกไม่ได้ ปิดปุ่มไว้เลยจะได้ไม่งง
    if (readOnly) {
      status.className = "notice";
      status.textContent =
        "โหมดอ่านอย่างเดียว: อ่านจากไฟล์ db.json เพราะไม่ได้เปิด json-server จึงบันทึกไม่ได้";
      form.querySelector("button[type=submit]").disabled = true;
    }
  } catch (err) {
    status.textContent = "โหลดข้อมูลพนักงาน id " + id + " ไม่ได้ (" + err.message + ")";
  }
}

// 3) กดบันทึก: ตรวจค่า แล้วส่ง PUT
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";

  if (readOnly) {
    errorBox.textContent = "บันทึกไม่ได้ ต้องเปิด json-server ที่พอร์ต 3000 ก่อน";
    return;
  }

  const data = {
    id: id,
    FirstName: form.elements.FirstName.value.trim(),
    LastName: form.elements.LastName.value.trim(),
    Gender: form.elements.Gender.value,
    Position: form.elements.Position.value.trim(),
    Address: form.elements.Address.value.trim(),
    Progress: Number(form.elements.Progress.value),
  };

  if (!data.FirstName || !data.LastName || !data.Position || !data.Address) {
    errorBox.textContent = "กรอกข้อมูลให้ครบทุกช่อง";
    return;
  }
  const raw = form.elements.Progress.value;
  if (raw === "" || !Number.isInteger(data.Progress) || data.Progress < 0 || data.Progress > 100) {
    errorBox.textContent = "ความสำเร็จของงานต้องเป็นจำนวนเต็ม 0 ถึง 100";
    return;
  }

  try {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    location.href = "index.html"; // กลับหน้าตาราง ตารางจะโหลดข้อมูลใหม่เอง
  } catch (err) {
    errorBox.textContent = "บันทึกไม่สำเร็จ (" + err.message + ")";
  }
});

loadEmployee();
