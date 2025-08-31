// js/mock.js — صفحة اختبار مستقلة تعتمد على quiz.js فقط
import { renderQuestion, grade } from "./quiz.js";

const examBlock   = document.getElementById("examBlock");
const submitBtn   = document.getElementById("submitMock");
const showKeyBtn  = document.getElementById("showMockKey");
const resetBtn    = document.getElementById("resetMock");
const resultEl    = document.getElementById("examResult");
const readingEl   = document.getElementById("mockReading");

const dataFile = window.dataFile || "../data/mock1.json";

let DATA = null;

fetch(dataFile)
  .then(r => r.json())
  .then(d => {
    DATA = d;
    // عرض نص القراءة
    if (d.reading && d.reading.text) {
      readingEl.textContent = d.reading.text;
    }
    // رسم الأسئلة
    d.exam.items.forEach((q, i) => {
      examBlock.appendChild(renderQuestion(q, i));
    });
  });

submitBtn.addEventListener("click", () => {
  if (!DATA) return;
  const res = grade(DATA.exam.items, examBlock);
  const pass = (DATA.exam.passMark ?? Math.ceil(DATA.exam.items.length * 0.7));
  resultEl.textContent = `نتيجتك: ${res.score}/${res.total} — المطلوب ${pass}/${res.total}`;
});

showKeyBtn.addEventListener("click", () => {
  if (!DATA) return;
  const keyText = DATA.exam.items.map((q, i) => {
    if (q.type === "mcq")   return `${i+1}) ${q.choices[q.a]}`;
    if (q.type === "tf")    return `${i+1}) ${q.a ? "True" : "False"}`;
    if (q.type === "fill")  return `${i+1}) ${q.a}`;
    return `${i+1}) —`;
  }).join("\n");
  alert("المفاتيح:\n" + keyText);
});

resetBtn.addEventListener("click", () => {
  location.reload();
});
