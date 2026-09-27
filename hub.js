// 1) กันเข้าตรง ๆ: ยังไม่ผ่านหน้า gate ให้เด้งกลับทันทีก่อนหน้าจะวาด
const visitorName = localStorage.getItem("visitorName");
if (!visitorName) {
  location.replace("index.html");
}

// 2) เติมชื่อผู้เข้าชมลงใน nav และคำทักทาย
//    ไฟล์นี้ใช้ร่วมกันหลายหน้า บางหน้าไม่มี element เหล่านี้ จึงต้องเช็กก่อนทุกตัว
document.addEventListener("DOMContentLoaded", () => {
  if (!visitorName) return;

  const who = document.getElementById("who");
  if (who) who.textContent = visitorName;

  const greeting = document.getElementById("greeting");
  if (greeting) greeting.textContent = "สวัสดี " + visitorName;

  // 3) ปุ่มออก: ลืมชื่อแล้วกลับไปหน้า gate
  const leave = document.getElementById("leave");
  if (leave) {
    leave.addEventListener("click", () => {
      localStorage.removeItem("visitorName");
      location.href = "index.html";
    });
  }
});
