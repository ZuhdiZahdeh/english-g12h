// quiz.js — محرّك الأسئلة: MCQ / True-False / Fill / Match

/** رسم سؤال واحد */
export function renderQuestion(q, idx, lock = false) {
  const el = document.createElement("div");
  el.className = "question";
  el.dataset.index = String(idx);

  if (q.type === "mcq") {
    el.innerHTML =
      `<p>${idx + 1}) ${q.q}</p>` +
      q.choices.map((c, i) =>
        `<label><input type="radio" name="q${idx}" value="${i}" ${lock ? "disabled" : ""}> ${c}</label>`
      ).join("<br>");
    return el;
  }

  if (q.type === "tf") {
    el.innerHTML = `
      <p>${idx + 1}) ${q.q}</p>
      <label><input type="radio" name="q${idx}" value="true"  ${lock ? "disabled" : ""}> True</label>
      <label><input type="radio" name="q${idx}" value="false" ${lock ? "disabled" : ""}> False</label>
    `;
    return el;
  }

  if (q.type === "fill") {
    el.innerHTML = `
      <p>${idx + 1}) ${q.q}</p>
      <input type="text" ${lock ? "disabled" : ""} placeholder="اكتب الإجابة">
    `;
    return el;
  }

  // === جديد: نشاط المطابقة (Word ⇄ المعنى) ===
  if (q.type === "match") {
    // q.pairs = [ [leftWord, rightArabic], ... ]
    const right = q.pairs.map(p => p[1]);
    const shuffled = [...right].sort(() => Math.random() - 0.5);
    const labels = shuffled.map((_, i) => String.fromCharCode(65 + i)); // A,B,C...
    const labelOf = new Map(shuffled.map((ar, i) => [ar, labels[i]]));

    const mapList = shuffled.map((ar, i) => `<li><b>${labels[i]}</b> — ${ar}</li>`).join("");
    el.innerHTML = `
      <p><b>طابق الكلمة بالمعنى:</b> اختر الحرف الصحيح لكل كلمة.</p>
      <ul style="margin:.25rem 0 .5rem; padding-inline-start:1.1rem">${mapList}</ul>
      <div class="table zebra" style="border-radius:10px; overflow:hidden">
        <div style="display:grid;grid-template-columns:1fr 180px">
          <div style="padding:.5rem;background:#f4faf8;font-weight:700">Word</div>
          <div style="padding:.5rem;background:#f4faf8;font-weight:700">الحرف (A,B,...)</div>
        </div>
        <div data-rows></div>
      </div>
    `;

    const rows = el.querySelector("[data-rows]");
    q.pairs.forEach(pair => {
      const [left, ar] = pair;
      const correctLetter = labelOf.get(ar);
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "1fr 180px";
      row.innerHTML = `
        <div style="padding:.5rem;border-top:1px solid #e9eef2">${left}</div>
        <div style="padding:.5rem;border-top:1px solid #e9eef2">
          <select data-answer="${correctLetter}">
            <option value="">اختر...</option>
            ${labels.map(L => `<option value="${L}">${L}</option>`).join("")}
          </select>
        </div>
      `;
      rows.appendChild(row);
    });

    return el;
  }

  return el;
}

/** تصحيح مجموعة أسئلة داخل حاوية */
export function grade(questions, container) {
  let score = 0;
  let total = 0;

  const nodes = [...container.querySelectorAll(".question")];

  questions.forEach((q, idx) => {
    const qel = nodes[idx];

    if (q.type === "mcq") {
      total++;
      const val = container.querySelector(`input[name="q${idx}"]:checked`);
      if (val && Number(val.value) === q.a) score++;
      return;
    }

    if (q.type === "tf") {
      total++;
      const val = container.querySelector(`input[name="q${idx}"]:checked`);
      if (val && String(q.a) === val.value) score++;
      return;
    }

    if (q.type === "fill") {
      total++;
      const inp = qel.querySelector("input");
      const val = (inp?.value || "").trim().toLowerCase();
      const answers = String(q.a).toLowerCase().split(";").map(s => s.trim());
      if (answers.includes(val)) score++;
      return;
    }

    if (q.type === "match") {
      const selects = qel.querySelectorAll("select[data-answer]");
      selects.forEach(sel => {
        total++;
        const ok = (sel.value || "").toUpperCase() === sel.dataset.answer;
        if (ok) {
          score++;
          sel.style.border = "1px solid var(--ok)";
        } else {
          sel.style.border = "1px solid var(--err)";
        }
      });
      return;
    }
  });

  return { score, total };
}
