// ตัวแปลง Markdown เล็ก ๆ เขียนเอง รองรับเท่าที่ไฟล์โจทย์ใช้จริง
// หัวข้อ, ตาราง, code block, inline code, ตัวหนา, quote, เส้นคั่น, รายการ, ย่อหน้า
// สร้างด้วย DOM ล้วน ไม่ใช้ innerHTML จึงไม่ต้องกังวลเรื่อง HTML ที่ปนมาในไฟล์

// โฟลเดอร์ของไฟล์ .md ที่กำลังแสดง ใช้เทียบ path ของรูปและลิงก์
// เพราะหน้าเว็บที่แสดงอยู่ที่ root แต่ไฟล์โจทย์อยู่ในโฟลเดอร์ examN
// เขียน images/1.png ในไฟล์โจทย์จึงใช้ได้ทั้งบนเว็บและตอน preview ใน editor
let mdBase = "";

function resolvePath(p) {
  // path เต็ม เริ่มด้วย / หรือ data: ปล่อยไว้อย่างนั้น
  if (/^[a-z][a-z0-9+.-]*:/i.test(p) || p.startsWith("/") || p.startsWith("#")) return p;
  return mdBase + p;
}

// 1) จัดรูปแบบภายในบรรทัด: `code`, **bold**, ![รูป](path) และ [ลิงก์](path)
function inline(text, parent) {
  const re = /(`[^`]+`|\*\*[^*]+\*\*|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parent.appendChild(document.createTextNode(text.slice(last, m.index)));
    }
    const token = m[0];

    if (token.startsWith("`")) {
      const code = document.createElement("code");
      code.textContent = token.slice(1, -1);
      parent.appendChild(code);

    } else if (token.startsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = token.slice(2, -2);
      parent.appendChild(strong);

    } else if (token.startsWith("![")) {
      const cut = token.indexOf("](");
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      const src = resolvePath(token.slice(cut + 2, -1));
      img.alt = token.slice(2, cut);

      // ผูก error ก่อนตั้ง src เสมอ ไม่งั้นถ้าโหลดพังเร็วจะจับ event ไม่ทัน
      // ยังไม่ได้ใส่ไฟล์รูป ให้ขึ้นข้อความบอกแทนที่จะเป็นรูปแตก
      img.addEventListener("error", () => {
        const miss = document.createElement("div");
        miss.className = "img-missing";
        miss.textContent = "(ยังไม่มีไฟล์รูป: " + src + ")";
        figure.replaceChildren(miss);
      });
      img.src = src;
      figure.appendChild(img);

      if (img.alt) {
        const cap = document.createElement("figcaption");
        cap.textContent = img.alt;
        figure.appendChild(cap);
      }
      parent.appendChild(figure);

    } else {
      const cut = token.indexOf("](");
      const a = document.createElement("a");
      a.href = resolvePath(token.slice(cut + 2, -1));
      a.textContent = token.slice(1, cut);
      parent.appendChild(a);
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    parent.appendChild(document.createTextNode(text.slice(last)));
  }
  return parent;
}

// 2) แยกช่องของแถวตาราง: | a | b | c |
function cellsOf(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((s) => s.trim());
}

function isTableSeparator(line) {
  return /^\s*\|?[\s:-]*-[\s|:-]*\|?\s*$/.test(line) && line.includes("-");
}

// 3) แปลงข้อความ markdown ทั้งก้อนเป็น element
//    base คือโฟลเดอร์ของไฟล์ .md เช่น "exam1/" ใช้เทียบ path ของรูปและลิงก์
function renderMarkdown(src, base = "") {
  mdBase = base;
  const root = document.createDocumentFragment();
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // บรรทัดว่าง
    if (!line.trim()) { i++; continue; }

    // code block แบบ ```
    if (line.trim().startsWith("```")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // ข้ามบรรทัดปิด
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = buf.join("\n");
      pre.appendChild(code);
      root.appendChild(pre);
      continue;
    }

    // ตาราง: บรรทัดนี้ขึ้นด้วย | และบรรทัดถัดไปเป็นเส้นคั่น
    if (line.trim().startsWith("|") && isTableSeparator(lines[i + 1] || "")) {
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      for (const c of cellsOf(line)) {
        const th = document.createElement("th");
        inline(c, th);
        headRow.appendChild(th);
      }
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const tr = document.createElement("tr");
        for (const c of cellsOf(lines[i])) {
          const td = document.createElement("td");
          inline(c, td);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
        i++;
      }
      table.appendChild(tbody);

      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      wrap.appendChild(table);
      root.appendChild(wrap);
      continue;
    }

    // หัวข้อ # ## ###
    const head = line.match(/^(#{1,6})\s+(.*)$/);
    if (head) {
      const h = document.createElement("h" + head[1].length);
      inline(head[2], h);
      root.appendChild(h);
      i++;
      continue;
    }

    // เส้นคั่น
    if (/^\s*---+\s*$/.test(line)) {
      root.appendChild(document.createElement("hr"));
      i++;
      continue;
    }

    // blockquote
    if (line.trim().startsWith(">")) {
      const quote = document.createElement("blockquote");
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        const p = document.createElement("p");
        inline(lines[i].trim().replace(/^>\s?/, ""), p);
        quote.appendChild(p);
        i++;
      }
      root.appendChild(quote);
      continue;
    }

    // รายการแบบมีลำดับ / ไม่มีลำดับ
    const ordered = /^\s*\d+\.\s+/.test(line);
    const bulleted = /^\s*[-*]\s+/.test(line);
    if (ordered || bulleted) {
      const list = document.createElement(ordered ? "ol" : "ul");
      const marker = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      while (i < lines.length && marker.test(lines[i])) {
        const li = document.createElement("li");
        inline(lines[i].replace(marker, ""), li);
        list.appendChild(li);
        i++;
      }
      root.appendChild(list);
      continue;
    }

    // ย่อหน้าธรรมดา รวมบรรทัดที่ติดกันเป็นย่อหน้าเดียว
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|>|\s*---+\s*$|```)/.test(lines[i]) &&
      !lines[i].trim().startsWith("|") &&
      !/^\s*(\d+\.|[-*])\s+/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    const p = document.createElement("p");
    inline(buf.join(" "), p);
    root.appendChild(p);
  }

  return root;
}
