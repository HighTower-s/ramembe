const grid = document.getElementById("grid");
const TOTAL = 10; // การ์ดหมายเลข 0 ถึง 9

// 1) สร้างการ์ด 1 ใบด้วยวิธี DOM ห้ามใช้ innerHTML
function makeCard(n) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = "หมายเลข " + n;

  // กล่องรูป (ถ้ามีไฟล์รูปจริงก็เปลี่ยนเป็น <img> ตรงนี้ได้)
  const thumb = document.createElement("div");
  thumb.className = "thumb";
  thumb.textContent = n;

  card.appendChild(title);
  card.appendChild(thumb);
  return card;
}

// 2) วนสร้างทั้ง 10 ใบ แล้วใส่ลง grid ทีเดียว
function render() {
  const frag = document.createDocumentFragment();
  for (let n = 0; n < TOTAL; n++) {
    frag.appendChild(makeCard(n));
  }
  grid.replaceChildren(frag);
}

// 3) จำนวนคอลัมน์ควบคุมด้วย media query ใน style.css ไม่ต้องเช็กความกว้างใน JS
render();
