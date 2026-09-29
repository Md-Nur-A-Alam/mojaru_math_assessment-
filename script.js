/* =========================================================
   Mojaru (মজারু) – Class 3 Math Knowledge Assessment
   ---------------------------------------------------------
   Backend: Google Apps Script Web App
   Matches the official Mojaru brand style: https://mojaru.com/bn
   ========================================================= */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxiV2_IbeHlf4GPveUa-mgN0HASqXDWHILKzAtPOH0Iu_mucm2MHFw8myubV1f9ml4f/exec";

// Each question maps to a column header in the sheet (QS-1 ... QS-10).
const QUESTIONS = [
  {
    id: "QS-1",
    text: "33 + 77 = ?",
    type: "line",
    category: "যোগ (Addition)"
  },
  {
    id: "QS-2",
    text: "91 − 17 = ?",
    type: "line",
    category: "বিয়োগ (Subtraction)"
  },
  {
    id: "QS-3",
    text: "7 × 8 = ?",
    type: "line",
    category: "গুণ (Multiplication)"
  },
  {
    id: "QS-4",
    text: "একটি জোড় সংখ্যার (Even Number) সাথে আরেকটি জোড় সংখ্যা যোগ করলে যোগফল জোড় হয়। তাহলে একটি বিজোড় সংখ্যার সাথে আরেকটি বিজোড় সংখ্যা যোগ করলে যোগফল কেমন হবে? একটি উদাহরণ দাও।",
    type: "area",
    category: "যুক্তি ও সংখ্যার ধারণা"
  },
  {
    id: "QS-5",
    text: "মৌলিক সংখ্যা (Prime Number) ও যৌগিক সংখ্যা (Composite Number)-এর মধ্যে পার্থক্য কী? একটি করে উদাহরণ দাও।",
    type: "area",
    category: "মৌলিক ও যৌগিক সংখ্যা"
  },
  {
    id: "QS-6",
    text: "কোনো সংখ্যা জোড় (Even) না বিজোড় (Odd), তা কীভাবে সহজে চিনবে?",
    type: "area",
    category: "সহজ কৌশল (Short Trick)"
  },
  {
    id: "QS-7",
    text: "রহিম ও করিম দুই ভাইয়ের বয়সের যোগফল ৩৫ বছর। ৫ বছর পর তাদের বয়সের যোগফল কত হবে?",
    type: "line",
    category: "বয়স ও গাণিতিক সমস্যা"
  },
  {
    id: "QS-8",
    text: "একটি পিজ্জার ৪ ভাগের ১ ভাগ খাওয়া হলো। এটিকে ভগ্নাংশে কীভাবে প্রকাশ করবে? ভগ্নাংশটির লব ও হর কোনটি?",
    type: "area",
    category: "ভগ্নাংশ (Fractions)"
  },
  {
    id: "QS-9",
    text: "এক বছরে সাধারণত কত দিন থাকে? আর অধিবর্ষ (Leap Year)-এ কত দিন থাকে?",
    type: "line",
    category: "সময় ও ক্যালেন্ডার"
  },
  {
    id: "QS-10",
    text: "তোমার দৈনন্দিন জীবনে গণিত কোথায় কোথায় ব্যবহার হয়? অন্তত ৩টি উদাহরণ দাও।",
    type: "area",
    category: "বাস্তব জীবনে গণিত"
  }
];

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toBn = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[d]);

const $ = (id) => document.getElementById(id);
const form = $("assessmentForm");
const submitBtn = $("submitBtn");
const errorBanner = $("formError");
const errorMsg = $("formErrorMsg");
let startedAt = Date.now();

/* ---------- Render questions ---------- */
function renderQuestions() {
  const wrap = $("questions");
  wrap.innerHTML = "";

  QUESTIONS.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "q-card";
    card.dataset.qid = q.id;

    // Header with question number badge, category & status
    const head = document.createElement("div");
    head.className = "q-header";

    const leftBadges = document.createElement("div");
    leftBadges.className = "q-left-badges";

    const numBadge = document.createElement("span");
    numBadge.className = "q-num-pill";
    numBadge.textContent = toBn(i + 1);

    const categoryTag = document.createElement("span");
    categoryTag.className = "q-category-tag";
    categoryTag.textContent = q.category;

    leftBadges.append(numBadge, categoryTag);

    const statusBadge = document.createElement("span");
    statusBadge.className = "q-status-badge";
    statusBadge.id = `status-${q.id}`;
    statusBadge.textContent = "বাকি আছে";

    head.append(leftBadges, statusBadge);

    // Body with question text
    const body = document.createElement("div");
    body.className = "q-body";

    const text = document.createElement("p");
    text.className = "q-text";
    text.textContent = q.text;
    body.appendChild(text);

    // Input container
    const inputWrap = document.createElement("div");
    inputWrap.className = "q-input-wrap";

    let input;
    if (q.type === "area") {
      input = document.createElement("textarea");
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.type = "text";
    }

    input.name = q.id;
    input.id = q.id;
    input.setAttribute("aria-label", `প্রশ্ন ${toBn(i + 1)} এর উত্তর`);

    // Event listener for live interaction
    input.addEventListener("input", () => {
      card.classList.remove("missing");
      const isFilled = input.value.trim().length > 0;
      card.classList.toggle("answered", isFilled);
      statusBadge.textContent = isFilled ? "সম্পন্ন ✓" : "বাকি আছে";
      updateProgress();
    });

    inputWrap.appendChild(input);

    card.append(head, body, inputWrap);
    wrap.appendChild(card);
  });

  updateProgress();
}

/* ---------- Progress Tracker ---------- */
function updateProgress() {
  const answeredCount = QUESTIONS.filter((q) => {
    const el = $(q.id);
    return el && el.value.trim().length > 0;
  }).length;

  const total = QUESTIONS.length;
  const pct = Math.round((answeredCount / total) * 100);

  const bar = $("progressBar");
  const summary = $("progressSummary");
  const badge = $("progressStatus");

  if (bar) bar.style.width = `${pct}%`;
  if (summary) {
    summary.textContent = `${toBn(answeredCount)}/${toBn(total)} সম্পন্ন (${toBn(pct)}%)`;
  }
  if (badge) {
    if (answeredCount === 0) {
      badge.textContent = "শুরু করো";
      badge.style.background = "var(--mojaru-purple-tint)";
      badge.style.color = "var(--mojaru-purple-vibrant)";
    } else if (answeredCount === total) {
      badge.textContent = "সব সম্পন্ন 🎉";
      badge.style.background = "var(--mojaru-green-tint)";
      badge.style.color = "var(--mojaru-green)";
    } else {
      badge.textContent = "চলছে...";
      badge.style.background = "#fff9e6";
      badge.style.color = "#b45309";
    }
  }
}

/* ---------- Helpers ---------- */
function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}

function showError(msg) {
  if (errorMsg) errorMsg.textContent = msg;
  if (errorBanner) {
    errorBanner.hidden = false;
    errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function clearError() {
  if (errorBanner) errorBanner.hidden = true;
  if (errorMsg) errorMsg.textContent = "";
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle("loading", on);
  const label = submitBtn.querySelector(".btn-label");
  if (label) {
    label.textContent = on
      ? "জমা হচ্ছে… / Submitting…"
      : "পরীক্ষা জমা দাও / Submit Assessment";
  }
}

/* ---------- Submit Handling ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const nameInput = $("studentName");
  const rollInput = $("roll");
  const classInput = $("studentClass");
  const name = nameInput.value.trim();
  const roll = rollInput.value.trim();
  const studentClass = classInput ? classInput.value.trim() : "Class 3";
  const dateInputVal = $("date").value;
  const date = dateInputVal || todayISO();

  if (!name || !roll) {
    showError("অনুগ্রহ করে শিক্ষার্থীর নাম ও রোল নাম্বার সঠিকভাবে লিখো।");
    (name ? rollInput : nameInput).focus();
    return;
  }

  const answers = {};
  QUESTIONS.forEach((q) => {
    const input = $(q.id);
    answers[q.id] = input ? input.value.trim() : "";
  });

  const blanks = QUESTIONS.filter((q) => !answers[q.id]);

  if (blanks.length === QUESTIONS.length) {
    showError("তুমি এখনো কোনো প্রশ্নের উত্তর লেখোনি। অনুগ্রহ করে উত্তর লিখে পরীক্ষা জমা দাও।");
    return;
  }

  if (blanks.length > 0) {
    const ok = confirm(
      `তোমার ${toBn(blanks.length)}টি প্রশ্নের উত্তর এখনো বাকি রয়েছে।\n\nতবুও কি জমা দিতে চাও?`
    );
    if (!ok) {
      blanks.forEach((q) => {
        const card = document.querySelector(`[data-qid="${q.id}"]`);
        if (card) card.classList.add("missing");
      });
      const firstMissing = document.querySelector(`[data-qid="${blanks[0].id}"]`);
      if (firstMissing) {
        firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
        const missingInput = $(blanks[0].id);
        if (missingInput) missingInput.focus();
      }
      return;
    }
  }

  if (!WEB_APP_URL || WEB_APP_URL.startsWith("PASTE_")) {
    showError("Setup error: Google Apps Script Web App URL is missing in script.js.");
    return;
  }

  const payload = {
    name,
    roll,
    class: studentClass,
    studentClass: studentClass,
    date: date,
    timestamp: new Date().toISOString(),
    durationSec: Math.round((Date.now() - startedAt) / 1000),
    answers
  };

  setLoading(true);
  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Unknown server error");
    showDone(name, roll, studentClass, date, QUESTIONS.length - blanks.length);
  } catch (err) {
    console.error("Submission error:", err);
    showError("উত্তরপত্র জমা দেওয়া সম্ভব হয়নি। (Apps Script Deploy-এ 'Who has access' কে 'Anyone' দিয়ে নতুন Version Deploy করুন)");
  } finally {
    setLoading(false);
  }
});

function showDone(name, roll, studentClass, dateVal, answeredCount) {
  $("doneMsg").textContent = `${name}, তোমার গণিত মূল্যায়ন উত্তরপত্র সফলভাবে মজারু সার্ভারে জমা হয়েছে।`;
  $("statName").textContent = name;
  if ($("statClass")) $("statClass").textContent = studentClass;
  $("statRoll").textContent = toBn(roll);
  if ($("statDate")) $("statDate").textContent = dateVal;
  $("statCount").textContent = `${toBn(answeredCount)}/${toBn(QUESTIONS.length)}`;

  $("formView").hidden = true;
  $("doneView").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("againBtn").addEventListener("click", () => {
  form.reset();
  if ($("studentClass")) $("studentClass").value = "Class 3";
  $("date").value = todayISO();
  renderQuestions();
  clearError();
  startedAt = Date.now();
  $("doneView").hidden = true;
  $("formView").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  $("studentName").focus();
});

/* ---------- Initialization ---------- */
$("date").value = todayISO();
renderQuestions();
