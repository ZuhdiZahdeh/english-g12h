// renderers.js — دوال العرض من بيانات JSON

/** جدول مفردات (Word | AR | Example) */
export function renderVocab(list, mount) {
  if (!Array.isArray(list) || !mount) return;
  const t = document.createElement("table");
  t.className = "vocab-table";
  t.innerHTML = `
    <thead>
      <tr><th>Word</th><th>العربي</th><th>Example</th></tr>
    </thead>
    <tbody></tbody>
  `;
  const tb = t.querySelector("tbody");
  list.forEach(v => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><strong>${v.w}</strong></td><td>${v.ar}</td><td>${v.ex}</td>`;
    tb.appendChild(tr);
  });
  mount.appendChild(t);
}

/** كتل القواعد مع (متى/التركيب/الإشارات) */
export function renderGrammar(blocks, mount) {
  if (!Array.isArray(blocks) || !mount) return;
  blocks.forEach(b => {
    const d = document.createElement("div");
    d.className = "question";
    d.innerHTML = `
      <h4>${b.title}</h4>
      <p><strong>متى؟</strong> ${b.when}</p>
      <p><strong>التركيب:</strong> ${b.form}</p>
      <p><strong>إشارات:</strong> ${(b.signals || []).join(", ")}</p>
    `;
    mount.appendChild(d);
  });
}
