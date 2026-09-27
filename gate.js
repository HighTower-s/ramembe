const form = document.getElementById("gate-form");
const input = document.getElementById("name");
const field = document.getElementById("field");

// 1) กด Enter ในช่องกรอก สั่ง submit ให้ชัดเจน ไม่พึ่ง implicit submission ของ browser
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    form.requestSubmit();
  }
});

// 2) รวมทุกทางเข้าไว้ที่ submit ที่เดียว (ทั้ง Enter และคีย์บอร์ดมือถือ)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = input.value.trim();

  // 3) ยังไม่พิมพ์ชื่อ: สั่นเตือนแล้วอยู่หน้าเดิม
  if (!name) {
    field.classList.remove("shake");
    void field.offsetWidth; // บังคับให้ browser เริ่ม animation ใหม่
    field.classList.add("shake");
    input.focus();
    return;
  }

  // 4) จำชื่อไว้ทักทายในหน้าถัดไป
  localStorage.setItem("visitorName", name);
  location.href = "exams.html";
});

// เอาคลาสสั่นออกเมื่อเล่นจบ กันค้าง
field.addEventListener("animationend", () => field.classList.remove("shake"));
