// app.js — منطق المنصّة (الصفحة الرئيسية + صفحات الأسابيع)
import { loadProgress, saveProgress, getWeek, exportProgress, resetAll } from "./storage.js";
import { renderVocab, renderGrammar } from "./renderers.js";
import { renderQuestion, grade } from "./quiz.js";
import { setupAudio } from "./audio.js";

// هل نحن في الصفحة الرئيسية؟
const onHome =
  location.pathname.endsWith("/") ||
  location.pathname.endsWith("/index.html") ||
  /\/english-g12h\/?$/i.test(location.pathname);

// =====================
// الصفحة الرئيسية
// =====================
if (onHome) {
  const weeksGrid = document.getElementById("weeksGrid");
  const admin = document.getElementById("adminMode");
  const btnExport = document.getElementById("exportProgress");
  const btnReset = document.getElementById("resetProgress");

  const p = loadProgress();

  function drawHome() {
    if (!weeksGrid) return;
    weeksGrid.innerHTML = "";
    for (let n = 1; n <= 12; n++) {
      const w = getWeek(p, n);
      const locked = !w.unlocked && !p.admin;
      const status = w.done ? "done" : (locked ? "locked" : "open");

      const a = document.createElement("a");
      a.className = `card week-card ${status}`;
      a.href = locked ? "#" : `weeks/week${String(n).padStart(2, "0")}.html`;
      a.innerHTML = `
        <h3>الأسبوع ${n}</h3>
        <p class="muted">حالة:
          <span class="badge ${status}">${locked ? "مغلق" : (w.done ? "منجَز" : "مفتوح")}</span>
        </p>
        <p>استماع: ${w.listening ? "✔" : "✖"} | امتحان: ${w.exam}/10 | كتابة: ${w.writing ? "✔" : "✖"}</p>
      `;

      if (locked) {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          alert("هذا الأسبوع مغلق. أكمِل متطلبات الأسبوع السابق لفتحه.");
        });
      }

      weeksGrid.appendChild(a);
    }
  }

  if (admin) {
    admin.checked = !!p.admin;
    admin.addEventListener("change", () => {
      p.admin = admin.checked;
      saveProgress(p);
      drawHome();
    });
  }
  btnExport?.addEventListener("click", exportProgress);
  btnReset?.addEventListener("click", resetAll);

  drawHome();
}

// =====================
// صفحات الأسابيع
// =====================
if (!onHome) {
  // عناصر DOM
  const n = window.weekNumber;
  const dataFile = window.dataFile;

  const targets = document.getElementById("weekTargets");
  const vocabList = document.getElementById("vocabList");
  const grammarBlocks = document.getElementById("grammarBlocks");
  const grammarPractice = document.getElementById("grammarPractice");

  const preReading = document.getElementById("preReading");
  const readingText = document.getElementById("readingText");
  const readingTasks = document.getElementById("readingTasks");

  const listenAudio = document.getElementById("listenAudio");
  const listeningTasks = document.getElementById("listeningTasks");

  const writingInput = document.getElementById("writingInput");
  const saveWritingBtn = document.getElementById("saveWriting");
  const markWritingBtn = document.getElementById("markWriting");

  const examBlock = document.getElementById("examBlock");
  const submitExamBtn = document.getElementById("submitExam");
  const showKeyBtn = document.getElementById("showExamKey");
  const examResult = document.getElementById("examResult");

  const unlockUl = document.getElementById("unlockChecklist");
  const unlockBtn = document.getElementById("unlockWeek");

  const p = loadProgress();
  const w = getWeek(p, n);

  // تحميل بيانات الأسبوع
  fetch(dataFile)
    .then(r => r.json())
    .then(d => initWeek(d))
    .catch(() => {
      alert("تعذّر تحميل بيانات الأسبوع. تحقّق من المسار: " + dataFile);
    });

  function initWeek(d) {
    // الأهداف
    if (targets) targets.innerHTML = `<ul>${(d.targets || []).map(t => `<li>${t}</li>`).join("")}</ul>`;

    // مفردات
    renderVocab(d.vocabulary || [], vocabList);

    // قواعد + تدريب
    renderGrammar(d.grammar || [], grammarBlocks);

    const gWrap = document.createElement("div");
    (d.grammarPractice || []).forEach((q, i) => gWrap.appendChild(renderQuestion(q, i)));
    grammarPractice?.appendChild(gWrap);

    const btnG = document.createElement("button");
    btnG.textContent = "تصحيح القواعد";
    btnG.addEventListener("click", () => {
      const res = grade(d.grammarPractice || [], gWrap);
      w.grammar = res.score;
      saveProgress(p);
      drawUnlock(d);
    });
    grammarPractice?.appendChild(btnG);

    // قراءة
    if (preReading) preReading.textContent = d.reading?.pre || "";
    if (readingText) readingText.textContent = d.reading?.text || "";

    const rWrap = document.createElement("div");
    (d.reading?.tasks || []).forEach((q, i) => rWrap.appendChild(renderQuestion(q, i)));
    readingTasks?.appendChild(rWrap);

    const btnR = document.createElement("button");
    btnR.textContent = "تصحيح القراءة";
    btnR.addEventListener("click", () => {
      const res = grade(d.reading?.tasks || [], rWrap);
      w.reading = res.score;
      saveProgress(p);
      drawUnlock(d);
    });
    readingTasks?.appendChild(btnR);

    // استماع
    if (listenAudio) {
      listenAudio.src = d.listening?.src || "";
      setupAudio(listenAudio, n);
    }

    const lWrap = document.createElement("div");
    (d.listening?.tasks || []).forEach((q, i) => lWrap.appendChild(renderQuestion(q, i)));
    listeningTasks?.appendChild(lWrap);

    // عندما ينتهي الاستماع: أعِد تقييم بوابة الفتح
    document.addEventListener("listening-done", (ev) => {
      if (ev.detail?.week === n) drawUnlock(d);
    });

    // كتابة
    saveWritingBtn?.addEventListener("click", () => {
      const key = `wk${n}_writing`;
      localStorage.setItem(key, (writingInput?.value || ""));
      alert("تم حفظ المسودة محليًا.");
    });

    markWritingBtn?.addEventListener("click", () => {
      const len = (writingInput?.value || "").trim().length;
      w.writing = len >= 60; // تقريبًا 6–8 جمل
      saveProgress(p);
      drawUnlock(d);
    });

    // امتحان
    (d.exam?.items || []).forEach((q, i) => examBlock?.appendChild(renderQuestion(q, i)));

    submitExamBtn?.addEventListener("click", () => {
      const res = grade(d.exam?.items || [], examBlock);
      w.exam = res.score;
      saveProgress(p);
      const pass = d.exam?.passMark ?? 7;
      if (examResult) examResult.textContent = `نتيجتك: ${res.score}/${res.total} — المطلوب ${pass}/10`;
      drawUnlock(d);
    });

    showKeyBtn?.addEventListener("click", () => {
      const keyText = (d.exam?.items || []).map((q, i) => {
        if (q.type === "mcq") return `${i + 1}) ${q.choices[q.a]}`;
        if (q.type === "tf") return `${i + 1}) ${q.a ? "True" : "False"}`;
        if (q.type === "fill") return `${i + 1}) ${q.a}`;
        return `${i + 1}) —`;
      }).join("\n");
      alert("المفاتيح:\n" + keyText);
    });

    // بوابة الانتقال
    function drawUnlock(dd) {
      if (!unlockUl) return;
      unlockUl.innerHTML = "";

      const checks = {
        "listeningDone": w.listening,
        "readingScore>=2": (w.reading || 0) >= 2,
        "grammarScore>=3": (w.grammar || 0) >= 3,
        "writingSubmitted": !!w.writing,
        "examScore>=7": (w.exam || 0) >= (dd.exam?.passMark ?? 7)
      };

      // لا تُظهر شرط الاستماع إذا لم يكن مطلوبًا في JSON
      const reqs = Array.isArray(dd.unlock?.requirements) ? dd.unlock.requirements : Object.keys(checks);
      Object.entries(checks).forEach(([k, val]) => {
        if (!reqs.includes(k)) return; // تجاهل شروط ليست مطلوبة
        const li = document.createElement("li");
        li.dataset.key = (k === "listeningDone" ? "listeningDone" : k);
        li.innerHTML = `<input type="checkbox" ${val ? "checked" : ""} disabled> ${k}`;
        unlockUl.appendChild(li);
      });

      const allOK = reqs.every(k => {
        if (k in checks) return !!checks[k];
        return false;
      });

      if (unlockBtn) {
        unlockBtn.disabled = !allOK;
        const next = dd.unlock?.nextWeek ?? (n + 1);
        unlockBtn.textContent = allOK ? `فتح الأسبوع ${next}` : "تحقّق من الشروط أعلاه";
      }
    }

    drawUnlock(d);

    unlockBtn?.addEventListener("click", () => {
      const next = d.unlock?.nextWeek ?? (n + 1);
      const nw = getWeek(p, next);
      nw.unlocked = true;
      w.done = true;
      saveProgress(p);
      alert("أحسنت! فُتح الأسبوع التالي.");
      location.href = `week${String(next).padStart(2, "0")}.html`;
    });
  }
}
