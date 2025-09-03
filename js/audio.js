// audio.js — علامة الاستماع + إشعار البوابة
import { loadProgress, saveProgress, getWeek } from "./storage.js";

export function setupAudio(audioEl, weekNumber){
  if (!audioEl) return;
  const p = loadProgress();
  const w = getWeek(p, weekNumber);

  const markDone = () => {
    if (w.listening) return;               // لا تُكرّر
    w.listening = true; saveProgress(p);
    // حدّث خانة شرط الاستماع إن وُجدت
    const cb = document.querySelector('li[data-key="listeningDone"] input[type="checkbox"]');
    if (cb) cb.checked = true;
    // أبْلِغ صفحة الأسبوع لتعيد رسم البوابة
    document.dispatchEvent(new CustomEvent("listening-done", { detail: { week: weekNumber } }));
  };

  // النهاية الطبيعية
  audioEl.addEventListener("ended", markDone);

  // لو توقّف وكان بالفعل عند النهاية
  audioEl.addEventListener("pause", () => {
    if (audioEl.ended) markDone();
  });

  // لو سحب الطالب الشريط لنهاية الملف
  audioEl.addEventListener("timeupdate", () => {
    if (audioEl.duration && audioEl.currentTime >= audioEl.duration - 0.25) {
      // هامش 0.25 ثانية لالتقاط النهاية
      markDone();
    }
  });
}
