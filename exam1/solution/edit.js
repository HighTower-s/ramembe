const API = "http://localhost:3000/employees";

// 1) อ่าน id จาก URL เช่น edit.html?id=3
const id = new URLSearchParams(location.search).get("id");
const form = document.getElementById("edit-form");
const status = document.getElementById("status");
const errorBox = document.getElementById("error");

// 2) ดึงข้อมูลของแถวที่กดมา แล้วเติมลงฟอร์ม
async function loadEmployee() {
  if (!id) {
    status.textContent = "ไม่พบ id ใน URL";
    return;
  }
  try {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const emp = await res.json();

    form.elements.empId.value = emp.id;
    form.elements.FirstName.value = emp.FirstName.trim();
    form.elements.LastName.value = emp.LastName.trim();
    form.elements.Gender.value = emp.Gender;
    form.elements.Position.value = emp.Position.trim();
    form.elements.Address.value = emp.Address.trim();
    form.elements.Progress.value = emp.Progress;
  } catch (err) {
    status.textContent = "โหลดข้อมูลพนักงาน id " + id + " ไม่ได้ (" + err.message + ")";
  }
}

// 3) กดบันทึก: ตรวจค่า แล้วส่ง PUT
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";

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
