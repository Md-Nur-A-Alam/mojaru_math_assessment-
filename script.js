/* =========================================================
   Mojaru – Class 3 Math Knowledge Assessment
   ---------------------------------------------------------
   1. Deploy code.gs as a Web App (see instructions there).
   2. Paste the Web App URL below.
   ========================================================= */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxiV2_IbeHlf4GPveUa-mgN0HASqXDWHILKzAtPOH0Iu_mucm2MHFw8myubV1f9ml4f/exec";

// Each question maps to a column header in the sheet (QS-1 ... QS-10).
const QUESTIONS = [
  { id: "QS-1", text: "33 + 77 = ?", type: "line" },
  { id: "QS-2", text: "91 − 17 = ?", type: "line" },
  { id: "QS-3", text: "7 × 8 = ?", type: "line" },
  { id: "QS-4", text: "একটি জোড় সংখ্যার (Even Number) সাথে আরেকটি জোড় সংখ্যা যোগ করলে যোগফল জোড় হয়। তাহলে একটি বিজোড় সংখ্যার সাথে আরেকটি বিজোড় সংখ্যা যোগ করলে যোগফল কেমন হবে? একটি উদাহরণ দাও।", type: "area" },
  { id: "QS-5", text: "মৌলিক সংখ্যা (Prime Number) ও যৌগিক সংখ্যা (Composite Number)-এর মধ্যে পার্থক্য কী? একটি করে উদাহরণ দাও।", type: "area" },
  { id: "QS-6", text: "কোনো সংখ্যা জোড় (Even) না বিজোড় (Odd), তা কীভাবে সহজে চিনবে?", type: "area" },
  { id: "QS-7", text: "রহিম ও করিম দুই ভাইয়ের বয়সের যোগফল ৩৫ বছর। ৫ বছর পর তাদের বয়সের যোগফল কত হবে?", type: "line" },
  { id: "QS-8", text: "একটি পিজ্জার ৪ ভাগের ১ ভাগ খাওয়া হলো। এটিকে ভগ্নাংশে কীভাবে প্রকাশ করবে? ভগ্নাংশটির লব ও হর কোনটি?", type: "area" },
  { id: "QS-9", text: "এক বছরে সাধারণত কত দিন থাকে? আর অধিবর্ষ (Leap Year)-এ কত দিন থাকে?", type: "line" },
  { id: "QS-10", text: "তোমার দৈনন্দিন জীবনে গণিত কোথায় কোথায় ব্যবহার হয়? অন্তত ৩টি উদাহরণ দাও।", type: "area" }
];

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toBn = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[d]);

const $ = (id) => document.getElementById(id);
const form = $("assessmentForm");
const submitBtn = $("submitBtn");
const errorBox = $("formError");
let startedAt = Date.now();

/* ---------- Render questions ---------- */
function renderQuestions() {
  const wrap = $("questions");
  wrap.innerHTML = "";
  QUESTIONS.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "q-card";
    card.dataset.qid = q.id;

    const text = document.createElement("div");
    text.className = "q-text";
    text.innerHTML = `<span class="q-num">${toBn(i + 1)}.</span><span></span>`;
    text.lastChild.textContent = q.text; // textContent = safe

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
    input.setAttribute("aria-label", `উত্তর ${toBn(i + 1)}`);
    input.addEventListener("input", () => card.classList.remove("missing"));

    card.append(text, input);
    wrap.appendChild(card);
  });
}

/* ---------- Helpers ---------- */
function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}
function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}
function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle("loading", on);
  submitBtn.querySelector(".btn-label").textContent = on
    ? "জমা হচ্ছে… / Submitting…"
    : "জমা দাও / Submit";
}

/* ---------- Submit ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const name = $("studentName").value.trim();
  const roll = $("roll").value.trim();
  const date = $("date").value || todayISO();

  if (!name || !roll) {
    showError("অনুগ্রহ করে নাম ও রোল লিখো। / Please enter name and roll.");
    (name ? $("roll") : $("studentName")).focus();
    return;
  }

  const answers = {};
  QUESTIONS.forEach((q) => (answers[q.id] = $(q.id).value.trim()));

  const blanks = QUESTIONS.filter((q) => !answers[q.id]);
  if (blanks.length === QUESTIONS.length) {
    showError("কোনো প্রশ্নের উত্তর দেওয়া হয়নি। / No answers entered.");
    return;
  }
  if (blanks.length) {
    const ok = confirm(
      `${toBn(blanks.length)}টি প্রশ্নের উত্তর ফাঁকা আছে। তবুও জমা দিতে চাও?\n` +
      `${blanks.length} question(s) are blank. Submit anyway?`
    );
    if (!ok) {
      blanks.forEach((q) => document.querySelector(`[data-qid="${q.id}"]`).classList.add("missing"));
      document.querySelector(`[data-qid="${blanks[0].id}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  }

  if (!WEB_APP_URL || WEB_APP_URL.startsWith("PASTE_")) {
    showError("Setup needed: set WEB_APP_URL in script.js to your Apps Script Web App URL.");
    return;
  }

  const payload = {
    name,
    roll,
    date,
    durationSec: Math.round((Date.now() - startedAt) / 1000),
    answers
  };

  setLoading(true);
  try {
    // text/plain avoids a CORS preflight, which Apps Script cannot answer.
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Unknown server error");
    showDone(name);
  } catch (err) {
    console.error(err);
    showError("জমা দেওয়া যায়নি, ইন্টারনেট চেক করে আবার চেষ্টা করো। / Could not submit. Check your connection and try again.");
  } finally {
    setLoading(false);
  }
});

function showDone(name) {
  $("doneMsg").textContent = `${name}, তোমার উত্তর সফলভাবে জমা হয়েছে।`;
  $("formView").hidden = true;
  $("doneView").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("againBtn").addEventListener("click", () => {
  form.reset();
  $("date").value = todayISO();
  renderQuestions();
  clearError();
  startedAt = Date.now();
  $("doneView").hidden = true;
  $("formView").hidden = false;
  $("studentName").focus();
});

/* ---------- Init ---------- */
$("date").value = todayISO();
renderQuestions();
