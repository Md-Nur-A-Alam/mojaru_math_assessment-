/* ==========================================================================
   Mojaru Admin Dashboard JavaScript
   Class 3 Math Assessment Evaluation
   ========================================================================== */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxiV2_IbeHlf4GPveUa-mgN0HASqXDWHILKzAtPOH0Iu_mucm2MHFw8myubV1f9ml4f/exec";

const QUESTIONS_DATA = [
  { id: "QS-1", text: "33 + 77 = ?", category: "যোগ", modelAns: "১১০ (110)" },
  { id: "QS-2", text: "91 − 17 = ?", category: "বিয়োগ", modelAns: "৭৪ (74)" },
  { id: "QS-3", text: "7 × 8 = ?", category: "গুণ", modelAns: "৫৬ (56)" },
  { id: "QS-4", text: "একটি জোড় সংখ্যার (Even Number) সাথে আরেকটি জোড় সংখ্যা যোগ করলে যোগফল জোড় হয়। তাহলে একটি বিজোড় সংখ্যার সাথে আরেকটি বিজোড় সংখ্যা যোগ করলে যোগফল কেমন হবে? একটি উদাহরণ দাও।", category: "যুক্তি ও ধারণা", modelAns: "যোগফল জোড় (Even) হবে। উদাহরণ: ৩ + ৫ = ৮ (বা অন্য যেকোনো বিজোড় সংখ্যার সঠিক যোগফল)" },
  { id: "QS-5", text: "মৌলিক সংখ্যা (Prime Number) ও যৌগিক সংখ্যা (Composite Number)-এর মধ্যে পার্থক্য কী? একটি করে উদাহরণ দাও।", category: "মৌলিক ও যৌগিক", modelAns: "মৌলিক সংখ্যার মাত্র ২টি গুণনীয়ক (১ ও ঐ সংখ্যা), যেমন: ২ বা ৩। যৌগিক সংখ্যার ২টির বেশি গুণনীয়ক থাকে, যেমন: ৪ বা ৬।" },
  { id: "QS-6", text: "কোনো সংখ্যা জোড় (Even) না বিজোড় (Odd), তা কীভাবে সহজে চিনবে?", category: "সহজ কৌশল", modelAns: "সংখ্যার শেষের অঙ্কটি (এককের ঘরের অঙ্ক) ০, ২, ৪, ৬, ৮ হলে সংখ্যাটি জোড়; আর ১, ৩, ৫, ৭, ৯ হলে সংখ্যাটি বিজোড়।" },
  { id: "QS-7", text: "রহিম ও করিম দুই ভাইয়ের বয়সের যোগফল ৩৫ বছর। ৫ বছর পর তাদের বয়সের যোগফল কত হবে?", category: "বয়স সমস্যা", modelAns: "৩৫ + ৫ + ৫ = ৪৫ বছর (উভয়ের ব্যবধান ৫ বছর করে বৃদ্ধি পাবে)।" },
  { id: "QS-8", text: "একটি পিজ্জার ৪ ভাগের ১ ভাগ খাওয়া হলো। এটিকে ভগ্নাংশে কীভাবে প্রকাশ করবে? ভগ্নাংশটির লব ও হর কোনটি?", category: "ভগ্নাংশ", modelAns: "ভগ্নাংশ: ১/৪। লব: ১, হর: ৪।" },
  { id: "QS-9", text: "এক বছরে সাধারণত কত দিন থাকে? আর অধিবর্ষ (Leap Year)-এ কত দিন থাকে?", category: "সময় ও ক্যালেন্ডার", modelAns: "সাধারণ বছর: ৩৬৫ দিন। অধিবর্ষ (Leap Year): ৩৬৬ দিন।" },
  { id: "QS-10", text: "তোমার দৈনন্দিন জীবনে গণিত কোথায় কোথায় ব্যবহার হয়? অন্তত ৩টি উদাহরণ দাও।", category: "বাস্তব প্রয়োগ", modelAns: "যেকোনো ৩টি যৌক্তিক বাস্তব উদাহরণ (যেমন: দোকানে কেনাকাটা, ঘড়ি দেখে সময় জানা, রান্নার পরিমাপ, খেলনা গোনা ইত্যাদি)।" }
];

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toBn = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[d]);

const ADMIN_CREDENTIALS = {
  email: "mdnuralam@gmail.com",
  pass: "Mojaru.Nur@1"
};

let submissionsList = [];
let currentStudentIndex = -1;
let currentFilter = "all";

// Elements
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("adminLoginForm");
const adminEmailInput = document.getElementById("adminEmail");
const adminPassInput = document.getElementById("adminPassword");
const btnTogglePass = document.getElementById("btnTogglePass");
const eyeIcon = document.getElementById("eyeIcon");
const loginError = document.getElementById("loginError");
const loginErrorMsg = document.getElementById("loginErrorMsg");

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const totalCountEl = document.getElementById("totalCount");
const evaluatedCountEl = document.getElementById("evaluatedCount");
const pendingCountEl = document.getElementById("pendingCount");
const avgScoreEl = document.getElementById("avgScore");
const modalOverlay = document.getElementById("evalModal");
const toastEl = document.getElementById("toastMsg");

/* ---------- Data Fetching ---------- */
async function loadSubmissions() {
  setTableLoading(true);
  try {
    let data;
    try {
      // First try standard fetch
      const res = await fetch(`${WEB_APP_URL}?action=getResponses`, {
        method: "GET",
        mode: "cors"
      });
      data = await res.json();
    } catch (fetchErr) {
      // Fallback to JSONP if CORS blocks direct fetch
      console.warn("Standard fetch failed, attempting JSONP fallback...", fetchErr);
      data = await fetchJsonp(`${WEB_APP_URL}?action=getResponses`);
    }

    if (data && data.ok) {
      submissionsList = data.submissions || [];
      updateDashboardStats();
      renderTable();
    } else {
      throw new Error(data ? data.error : "Unknown response");
    }
  } catch (err) {
    console.error("Failed to load submissions:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <p style="color: var(--mojaru-red); font-weight: 700; margin-bottom: 8px;">❌ ডেটা লোড করা সম্ভব হয়নি</p>
          <p style="font-size: 13.5px;">Google Apps Script এ Deploy করার সময় "Who has access" অবশ্যই <strong>Anyone</strong> করা থাকতে হবে।</p>
          <button onclick="loadSubmissions()" class="btn-evaluate" style="margin-top: 14px;">🔄 আবার চেষ্টা করুন</button>
        </td>
      </tr>
    `;
  }
}

// JSONP Helper for CORS-resilient read
function fetchJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonp_cb_" + Math.round(100000 * Math.random());
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("JSONP request timed out"));
    }, 15000);

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    function cleanup() {
      clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    }

    script.src = `${url}&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP script load error"));
    };
    document.body.appendChild(script);
  });
}

function setTableLoading(loading) {
  if (loading) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-state">
          <div class="spinner-lg"></div>
          <p>শিক্ষার্থীদের উত্তরপত্র লোড হচ্ছে...</p>
        </td>
      </tr>
    `;
  }
}

/* ---------- Dashboard Stats ---------- */
function updateDashboardStats() {
  const total = submissionsList.length;
  let evaluated = 0;
  let totalScoreSum = 0;
  let evaluatedScoresCount = 0;

  submissionsList.forEach((s) => {
    if (s.evaluation && s.evaluation.status && s.evaluation.status.includes("সম্পন্ন")) {
      evaluated++;
      if (typeof s.evaluation.totalMark === "number") {
        totalScoreSum += s.evaluation.totalMark;
        evaluatedScoresCount++;
      }
    } else if (s.evaluation && s.evaluation.totalMark > 0) {
      evaluated++;
      totalScoreSum += s.evaluation.totalMark;
      evaluatedScoresCount++;
    }
  });

  const pending = total - evaluated;
  const avg = evaluatedScoresCount > 0 ? (totalScoreSum / evaluatedScoresCount).toFixed(1) : "০";

  if (totalCountEl) totalCountEl.textContent = toBn(total);
  if (evaluatedCountEl) evaluatedCountEl.textContent = toBn(evaluated);
  if (pendingCountEl) pendingCountEl.textContent = toBn(pending);
  if (avgScoreEl) avgScoreEl.textContent = `${toBn(avg)} / ২০`;
}

/* ---------- Table Rendering ---------- */
function renderTable() {
  const query = (searchInput ? searchInput.value : "").trim().toLowerCase();

  const filtered = submissionsList.filter((s, idx) => {
    s._originalIndex = idx;
    const nameStr = String(s.name != null ? s.name : "").toLowerCase();
    const phoneStr = String(s.phone != null ? s.phone : (s.roll != null ? s.roll : "")).toLowerCase();
    const classStr = String(s.class != null ? s.class : "").toLowerCase();
    const matchesQuery = !query || nameStr.includes(query) || phoneStr.includes(query) || classStr.includes(query);

    const isEval = Boolean(s.evaluation && (s.evaluation.status?.includes("সম্পন্ন") || s.evaluation.totalMark != null));
    if (currentFilter === "evaluated") return matchesQuery && isEval;
    if (currentFilter === "pending") return matchesQuery && !isEval;
    return matchesQuery;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <p>কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered
    .map((s, i) => {
      const isEval = Boolean(s.evaluation && s.evaluation.totalMark != null);
      const totalMark = isEval ? s.evaluation.totalMark : 0;
      const statusBadge = isEval
        ? `<span class="badge badge-evaluated">✓ মূল্যায়ন সম্পন্ন (${toBn(totalMark)}/২০)</span>`
        : `<span class="badge badge-pending">⏳ মূল্যায়ন বাকি</span>`;

      const displayPhone = s.phone || s.roll || "-";

      return `
        <tr>
          <td>${toBn(i + 1)}</td>
          <td class="student-col">${escapeHtml(s.name || "অজ্ঞাত")}</td>
          <td><span class="badge" style="background:#eef2ff;color:#4f46e5;">${escapeHtml(s.class || "Class 3")}</span></td>
          <td><strong>${toBn(displayPhone)}</strong></td>
          <td>${s.timestamp || s.date || "-"}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn-evaluate" onclick="openEvaluationModal(${s._originalIndex})">
              <span>✍️ মূল্যায়ন করুন</span>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* ---------- Evaluation Modal ---------- */
function openEvaluationModal(index) {
  if (index < 0 || index >= submissionsList.length) return;
  currentStudentIndex = index;
  const s = submissionsList[index];

  document.getElementById("evalStudentName").textContent = s.name || "শিক্ষার্থী";
  document.getElementById("evalStudentClass").textContent = s.class || "Class 3";
  const phoneEl = document.getElementById("evalStudentPhone") || document.getElementById("evalStudentRoll");
  if (phoneEl) phoneEl.textContent = toBn(s.phone || s.roll || "-");
  document.getElementById("evalStudentTime").textContent = s.timestamp || s.date || "-";

  const existingMarks = (s.evaluation && s.evaluation.marks) || {};
  const remarks = (s.evaluation && s.evaluation.remarks) || "";
  document.getElementById("evalRemarks").value = remarks;

  const container = document.getElementById("evalQuestionsList");
  container.innerHTML = QUESTIONS_DATA.map((q, i) => {
    const studentAns = s.answers && s.answers[q.id] ? s.answers[q.id].trim() : "";
    const currentMark = existingMarks[q.id];

    return `
      <div class="eval-q-card" data-qid="${q.id}">
        <div class="eval-q-head">
          <div class="eval-q-title">
            <span>প্রশ্ন ${toBn(i + 1)}:</span> ${escapeHtml(q.text)}
          </div>
          <span class="badge" style="background:var(--mojaru-purple-tint);color:var(--mojaru-purple-dark);">${q.category}</span>
        </div>

        <div class="eval-ans-box">
          <div class="ans-label">শিক্ষার্থীর উত্তর:</div>
          <div class="student-answer-text ${!studentAns ? 'ans-empty' : ''}">
            ${studentAns ? escapeHtml(studentAns) : "(কোনো উত্তর লেখা হয়নি)"}
          </div>
        </div>

        <div class="model-answer-note">
          💡 <strong>আদর্শ উত্তর:</strong> ${q.modelAns}
        </div>

        <div class="eval-marking-row">
          <div class="marking-label">নম্বর নির্ধারণ (পূর্ণমান: ২):</div>
          <div class="marking-controls-group">
            <select class="mark-select" id="mark-${q.id}" onchange="recalculateModalTotal()">
              <option value="" ${currentMark == null ? 'selected' : ''}>- নম্বর দিন -</option>
              <option value="2" ${currentMark === 2 ? 'selected' : ''}>২ - সঠিক (Correct)</option>
              <option value="1" ${currentMark === 1 ? 'selected' : ''}>১ - আংশিক সঠিক (Partial)</option>
              <option value="0" ${currentMark === 0 ? 'selected' : ''}>০ - ভুল (Wrong)</option>
            </select>

            <button type="button" class="quick-mark-btn btn-mark-2" onclick="setQuestionMark('${q.id}', 2)" title="২ নম্বর (সঠিক)">✓ ২</button>
            <button type="button" class="quick-mark-btn btn-mark-1" onclick="setQuestionMark('${q.id}', 1)" title="১ নম্বর (আংশিক)">½ ১</button>
            <button type="button" class="quick-mark-btn btn-mark-0" onclick="setQuestionMark('${q.id}', 0)" title="০ নম্বর (ভুল)">✗ ০</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  recalculateModalTotal();
  updateNavButtons();
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeEvaluationModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function setQuestionMark(qid, val) {
  const sel = document.getElementById(`mark-${qid}`);
  if (sel) {
    sel.value = String(val);
    recalculateModalTotal();
  }
}

function recalculateModalTotal() {
  let total = 0;
  let evaluatedCount = 0;

  QUESTIONS_DATA.forEach((q) => {
    const sel = document.getElementById(`mark-${q.id}`);
    if (sel && sel.value !== "") {
      total += Number(sel.value);
      evaluatedCount++;
    }
  });

  const badge = document.getElementById("modalTotalScore");
  if (badge) {
    badge.textContent = `মোট নম্বর: ${toBn(total)} / ২০ (${toBn(Math.round(total / 20 * 100))}%)`;
  }
}

function updateNavButtons() {
  const prevBtn = document.getElementById("btnPrevStudent");
  const nextBtn = document.getElementById("btnNextStudent");
  if (prevBtn) prevBtn.disabled = currentStudentIndex <= 0;
  if (nextBtn) nextBtn.disabled = currentStudentIndex >= submissionsList.length - 1;
}

function prevStudent() {
  if (currentStudentIndex > 0) {
    openEvaluationModal(currentStudentIndex - 1);
  }
}

function nextStudent() {
  if (currentStudentIndex < submissionsList.length - 1) {
    openEvaluationModal(currentStudentIndex + 1);
  }
}

/* ---------- Save Evaluation ---------- */
async function saveEvaluation() {
  if (currentStudentIndex < 0 || currentStudentIndex >= submissionsList.length) return;
  const s = submissionsList[currentStudentIndex];
  const saveBtn = document.getElementById("btnSaveEval");

  const marks = {};
  let totalMark = 0;
  QUESTIONS_DATA.forEach((q) => {
    const sel = document.getElementById(`mark-${q.id}`);
    if (sel && sel.value !== "") {
      const val = Number(sel.value);
      marks[q.id] = val;
      totalMark += val;
    } else {
      marks[q.id] = "";
    }
  });

  const remarks = (document.getElementById("evalRemarks").value || "").trim();

  const payload = {
    action: "evaluate",
    rowId: s.rowId,
    name: s.name,
    class: s.class,
    phone: s.phone || s.roll,
    roll: s.phone || s.roll,
    timestamp: s.timestamp,
    marks: marks,
    remarks: remarks
  };

  saveBtn.disabled = true;
  saveBtn.textContent = "সংরক্ষণ হচ্ছে...";

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Save failed");

    // Update local data
    s.evaluation = {
      totalMark: totalMark,
      percentage: (totalMark / 20 * 100).toFixed(1) + "%",
      status: "সম্পন্ন (Completed)",
      evaluatedAt: new Date().toLocaleString("bn-BD"),
      remarks: remarks,
      marks: marks
    };

    updateDashboardStats();
    renderTable();
    showToast(`✅ ${s.name}-এর মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে (${toBn(totalMark)}/২০)!`);
    closeEvaluationModal();
  } catch (err) {
    console.error("Save evaluation error:", err);
    showToast("❌ সংরক্ষণ করা যায়নি। দয়া করে ইন্টারনেট ও স্ক্রিপ্ট চেক করুন।");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "💾 মূল্যায়ন সংরক্ষণ করুন";
  }
}

/* ---------- Helpers ---------- */
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3500);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTable();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", () => renderTable());
}

// Close modal on ESC or outside click
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay && modalOverlay.classList.contains("active")) {
    closeEvaluationModal();
  }
});

if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeEvaluationModal();
  });
}

/* ==========================================================================
   Admin Authentication Handlers
   ========================================================================== */

// Toggle Password Visibility
if (btnTogglePass && adminPassInput) {
  btnTogglePass.addEventListener("click", () => {
    const isPass = adminPassInput.type === "password";
    adminPassInput.type = isPass ? "text" : "password";
    if (eyeIcon) {
      eyeIcon.innerHTML = isPass
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
  });
}

// Login Form Submit
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideLoginError();

    const inputEmail = (adminEmailInput ? adminEmailInput.value : "").trim().toLowerCase();
    const inputPass = (adminPassInput ? adminPassInput.value : "").trim();

    if (!inputEmail || !inputPass) {
      showLoginError("অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড উভয়ই দিন।");
      return;
    }

    if (
      inputEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      inputPass === ADMIN_CREDENTIALS.pass
    ) {
      // Success: Save session
      sessionStorage.setItem("mojaru_admin_auth", "true");
      sessionStorage.setItem("mojaru_admin_user", ADMIN_CREDENTIALS.email);
      showDashboardView();
      loadSubmissions();
    } else {
      showLoginError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে! অনুগ্রহ করে সঠিক তথ্য দিন।");
      if (adminPassInput) {
        adminPassInput.value = "";
        adminPassInput.focus();
      }
    }
  });
}

function showLoginError(msg) {
  if (loginErrorMsg) loginErrorMsg.textContent = msg;
  if (loginError) loginError.hidden = false;
}

function hideLoginError() {
  if (loginError) loginError.hidden = true;
  if (loginErrorMsg) loginErrorMsg.textContent = "";
}

function showDashboardView() {
  if (loginView) loginView.hidden = true;
  if (dashboardView) dashboardView.hidden = false;
  const badge = document.getElementById("userEmailBadge");
  if (badge) badge.textContent = ADMIN_CREDENTIALS.email;
}

function showLoginView() {
  if (dashboardView) dashboardView.hidden = true;
  if (loginView) loginView.hidden = false;
  if (adminEmailInput) {
    adminEmailInput.value = ADMIN_CREDENTIALS.email;
    if (adminPassInput) {
      adminPassInput.value = "";
      adminPassInput.focus();
    }
  }
}

// Admin Logout
function adminLogout() {
  sessionStorage.removeItem("mojaru_admin_auth");
  sessionStorage.removeItem("mojaru_admin_user");
  showLoginView();
  showToast("সফলভাবে লগআউট করা হয়েছে।");
}

// Check session on load
(function initAdmin() {
  const isAuth = sessionStorage.getItem("mojaru_admin_auth") === "true";
  if (isAuth) {
    showDashboardView();
    loadSubmissions();
  } else {
    showLoginView();
  }
})();
