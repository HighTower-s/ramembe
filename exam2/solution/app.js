const DATA_URL = "../branches.json";

const select = document.getElementById("branch-select");
const detail = document.getElementById("detail");
const tbody = document.getElementById("items");
const tfoot = document.getElementById("total");

let branches = [];

// จัดรูปแบบเงิน เช่น 1234 -> "1,234.00"
function money(n) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// สร้าง <td> ด้วย DOM (ไม่ใช้ innerHTML)
function makeCell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

// 1) สร้าง option จาก id ของทุกสาขา
function buildDropdown() {
  branches.forEach((branch) => {
    const option = document.createElement("option");
    option.value = branch.id;
    option.textContent = branch.id;
    select.appendChild(option);
  });
}

// 2) แสดงข้อมูลสาขา + ตารางสินค้า
function showBranch(branch) {
  document.getElementById("branchName").textContent = branch.branchName;
  document.getElementById("region").textContent = branch.region;
  document.getElementById("city").textContent = branch.city;
  document.getElementById("owner").textContent = branch.owner;

  // ล้างแถวเก่าออกก่อน
  tbody.replaceChildren();
  tfoot.replaceChildren();

  let grandTotal = 0;

  branch.items.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    grandTotal += lineTotal;

    const tr = document.createElement("tr");
    tr.appendChild(makeCell(index + 1));
    tr.appendChild(makeCell(item.type));
    tr.appendChild(makeCell(item.name));
    tr.appendChild(makeCell(money(item.price), "num"));
    tr.appendChild(makeCell(item.quantity, "num"));
    tr.appendChild(makeCell(money(lineTotal), "num"));
    tbody.appendChild(tr);
  });

  // แถวยอดรวม
  const totalRow = document.createElement("tr");
  const label = makeCell("ยอดรวมทั้งหมด");
  label.colSpan = 5;
  totalRow.appendChild(label);
  totalRow.appendChild(makeCell(money(grandTotal), "num"));
  tfoot.appendChild(totalRow);

  detail.hidden = false;
}

// 3) เลือกใน dropdown แล้วแสดงสาขาที่ตรงกับ id
select.addEventListener("change", () => {
  const branch = branches.find((b) => b.id === select.value);
  if (branch) {
    showBranch(branch);
  } else {
    detail.hidden = true; // เลือก "-- เลือกสาขา --"
  }
});

async function init() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    branches = data.branches; // ข้อมูลซ้อนอยู่ใน key branches
    buildDropdown();
  } catch (err) {
    document.getElementById("status").textContent =
      "โหลด branches.json ไม่ได้ ตรวจว่าเปิดผ่าน Live Server แล้ว (" + err.message + ")";
  }
}

init();
