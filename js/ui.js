/* 全球高考 · 页内 UI 小件：提示条 / 系统弹层 / HTML 转义
 * 全部画在页面内，不使用 alert / confirm / prompt。 */
(() => {
  const $ = (s) => document.querySelector(s);
  const SND = window.QQAUDIO || { ui() {} };
  let toastTimer = null;

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    SND.ui("notice");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
  }
  function modal(msg, buttons) {
    const m = $("#modal");
    $("#modal-msg").textContent = msg;
    const box = $("#modal-btns");
    box.innerHTML = "";
    buttons.forEach((b, i) => {
      const el = document.createElement("button");
      el.className = "btn" + (b.ghost ? " ghost" : "");
      el.textContent = b.text;
      el.onclick = () => { closeModal(); b.act && b.act(); };
      box.appendChild(el);
      if (i === 0) setTimeout(() => el.focus(), 0);
    });
    m.classList.remove("hidden");
  }
  function closeModal() { $("#modal").classList.add("hidden"); }
  const modalOpen = () => !$("#modal").classList.contains("hidden");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  window.GKUI = { toast, modal, closeModal, modalOpen, esc };
})();
