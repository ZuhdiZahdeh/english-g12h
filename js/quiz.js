// quiz.js — محرّك الأسئلة: MCQ / True-False / Fill

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
  } else if (q.type === "tf") {
    el.innerHTML = `
      <p>${idx + 1}) ${q.q}</p>
      <label><input type="radio" name="q${idx}" value="true"  ${lock ? "disabled" : ""}> True</label>
      <label><input type="radio" name="q${idx}" value="false" ${lock ? "disabled" : ""}> False</label>
    `;
  } else if (q.type === "fill") {
    el.innerHTML = `
      <p>${idx + 1}) ${q.q}</p>
      <input type="text" ${lock ? "disabled" : ""} placeholder="اكتب الإجابة">
    `;
  }
  return el;
}

/** تصحيح مجموعة أسئلة داخل حاوية */
export function grade(questions, container) {
  let score = 0;
  const total = questions.length;

  [...container.querySelectorAll(".question")].forEach((qel, idx) => {
    const q = questions[idx];

    if (q.type === "mcq") {
      const val = container.querySelector(`input[name="q${idx}"]:checked`);
      if (val && Number(val.value) === q.a) score++;
    } else if (q.type === "tf") {
      const val = container.querySelector(`input[name="q${idx}"]:checked`);
      if (val && String(q.a) === val.value) score++;
    } else if (q.type === "fill") {
      const inp = qel.querySelector("input");
      const val = (inp?.value || "").trim().toLowerCase();
      // دعم بدائل مفصولة بـ ; إن لزم
      const answers = String(q.a).toLowerCase().split(";").map(s => s.trim());
      if (answers.includes(val)) score++;
    }
  });

  return { score, total };
}
