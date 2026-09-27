// 1) อ่านว่าจะเปิดโจทย์ข้อไหน เช่น problem.html?id=1
const examId = new URLSearchParams(location.search).get("id");
const doc = document.getElementById("doc");
const valid = ["1", "2", "3"];

// 2) โหลดไฟล์ README ของข้อนั้นมาแปลงเป็นหน้าเว็บ
async function load() {
  if (!valid.includes(examId)) {
    doc.replaceChildren(message("ไม่พบโจทย์ข้อนี้ กลับไปเลือกใหม่ที่หน้ารวมข้อสอบ"));
    return;
  }

  document.getElementById("solution-link").href = `exam${examId}/solution/index.html`;

  try {
    // no-store: แก้ไฟล์โจทย์แล้วรีเฟรชต้องเห็นของใหม่ทันที ไม่ติด cache ของ browser
    const res = await fetch(`exam${examId}/README.md`, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();

    doc.replaceChildren(renderMarkdown(text, `exam${examId}/`));
    document.title = `โจทย์ข้อ ${examId} · Remembe`;
    await attachDataFile();
  } catch (err) {
    doc.replaceChildren(message("โหลดโจทย์ไม่สำเร็จ (" + err.message + ") ต้องเปิดผ่าน Live Server ไม่ใช่เปิดไฟล์ตรง ๆ"));
  }
}

// 3) แปะไฟล์ JSON ของข้อนั้นไว้ท้ายหน้า อ่านจากไฟล์จริงทุกครั้ง ข้อมูลจึงตรงกันเสมอ
const DATA_FILE = {
  "1": "exam1/db.json",
  "2": "exam2/branches.json",
};

async function attachDataFile() {
  const path = DATA_FILE[examId];
  if (!path) return;

  const heading = document.createElement("h2");
  heading.textContent = "ไฟล์ข้อมูลที่ให้มา";

  const name = document.createElement("p");
  const code = document.createElement("code");
  code.textContent = path.split("/").pop();
  name.appendChild(code);
  name.appendChild(document.createTextNode(" "));
  const open = document.createElement("a");
  open.href = path;
  open.textContent = "เปิดไฟล์จริง";
  name.appendChild(open);

  const pre = document.createElement("pre");
  const body = document.createElement("code");
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    body.textContent = await res.text();
  } catch (err) {
    body.textContent = "อ่านไฟล์ไม่ได้ (" + err.message + ")";
  }
  pre.appendChild(body);

  doc.appendChild(heading);
  doc.appendChild(name);
  doc.appendChild(pre);
}

function message(text) {
  const p = document.createElement("p");
  p.className = "loading";
  p.textContent = text;
  return p;
}

load();
