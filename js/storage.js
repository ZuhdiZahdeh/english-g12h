// storage.js — حفظ تقدّم الطالب محليًا (localStorage)
const KEY = "efp12_progress_v1";

/** حمّل التقدّم من التخزين */
export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { admin: false, weeks: {} };
  } catch {
    return { admin: false, weeks: {} };
  }
}

/** احفظ التقدّم في التخزين */
export function saveProgress(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

/** احصل/أنشئ سجل أسبوع */
export function getWeek(p, n) {
  if (!p.weeks[n]) {
    p.weeks[n] = {
      listening: false,
      reading: 0,
      grammar: 0,
      writing: false,
      exam: 0,
      unlocked: n === 1, // الأسبوع 1 مفتوح افتراضيًا
      done: false
    };
  }
  return p.weeks[n];
}

/** إعادة ضبط كل شيء */
export function resetAll() {
  localStorage.removeItem(KEY);
  location.reload();
}

/** تصدير ملف JSON للتقدّم */
export function exportProgress() {
  const data = localStorage.getItem(KEY) || "{}";
  const blob = new Blob([data], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `progress-efp12-${Date.now()}.json`
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
}
