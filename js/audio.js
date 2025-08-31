// audio.js — علامة الاستماع + بثّ حدث مخصص لتحديث البوابة
import { loadProgress, saveProgress, getWeek } from "./storage.js";

/**
 * ربط عنصر الصوت بالأسبوع:
 * - عند انتهاء التشغيل يوضع listening=true
 * - يبث حدثًا "listening-done" لتنبيه الصفحة لتحديث بوابة الفتح
 */
export function setupAudio(audioEl, weekNumber) {
  if (!audioEl) return;
  const progress = loadProgress();
  const wk = getWeek(progress, weekNumber);

  audioEl.addEventListener("ended", () => {
    wk.listening = true;
    saveProgress(progress);

    // علّم مربع الشرط إن وُجد
    const cb = document.querySelector('li[data-key="listeningDone"] input[type="checkbox"]');
    if (cb) cb.checked = true;

    // بث حدث عام لتحديث واجهة البوابة
    document.dispatchEvent(new CustomEvent("listening-done", { detail: { week: weekNumber } }));
  });
}
