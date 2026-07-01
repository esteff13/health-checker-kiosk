/* =========================================================
   Health Self-Check Kiosk — script.js
   Demonstrates:
     - LOOP + IF-ELSE  -> validateFields()
     - SWITCH-CASE     -> classifyBmi() inside the submit handler
     - LOOP (forEach)  -> renderHistory()
   ========================================================= */

// ---- Configuration: fields required before we compute anything ----
const requiredFields = [
  { id: "name", label: "Full Name", type: "text" },
  { id: "age", label: "Age", type: "number", min: 1, max: 120 },
  { id: "sex", label: "Sex", type: "text" },
  { id: "weight", label: "Weight", type: "number", min: 1 },
  { id: "height", label: "Height", type: "number", min: 1 },
];

// Session-only history (resets on page refresh, purely for the on-screen list)
const sessionHistory = [];

// Paste your deployed Google Apps Script Web App URL here (see Part E of the lab)
const WEB_APP_URL = "YOUR_WEB_APP_URL";

// ---- Element references ----
const form = document.getElementById("bmiForm");
const errorMsg = document.getElementById("errorMsg");
const resultCard = document.getElementById("resultCard");
const gaugeFill = document.getElementById("gaugeFill");
const bmiNumber = document.getElementById("bmiNumber");
const categoryBadge = document.getElementById("categoryBadge");
const recommendation = document.getElementById("recommendation");
const resultName = document.getElementById("resultName");
const historyList = document.getElementById("historyList");
const resetBtn = document.getElementById("resetBtn");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  errorMsg.textContent = "";

  const problems = validateFields();
  if (problems.length > 0) {
    errorMsg.textContent = problems[0];
    return;
  }

  // ---- Gather validated values ----
  const name = document.getElementById("name").value.trim();
  const age = parseFloat(document.getElementById("age").value);
  const sex = document.getElementById("sex").value;
  const weight = parseFloat(document.getElementById("weight").value);
  const heightCm = parseFloat(document.getElementById("height").value);

  const heightM = heightCm / 100;
  const bmi = +(weight / (heightM * heightM)).toFixed(1);

  const { category, message, colorVar } = classifyBmi(bmi);

  showResult(name, bmi, category, message, colorVar);
  addToHistory({ name, age, sex, weight, heightCm, bmi, category });
  recordSubmission({ name, age, sex, weight, heightCm, bmi, category });

  form.reset();
});

resetBtn.addEventListener("click", () => {
  resultCard.classList.add("hidden");
  form.reset();
  document.getElementById("name").focus();
});

/* ---------------------------------------------------------
   LOOP + IF-ELSE
   A single for-of loop walks every required field once.
   Inside it, if-else chains decide *why* a field failed:
   empty, not a number, or out of the allowed min/max range.
--------------------------------------------------------- */
function validateFields() {
  const problems = [];

  for (const field of requiredFields) {
    const input = document.getElementById(field.id);
    const rawValue = input.value.trim();

    if (rawValue === "") {
      problems.push(field.label + " is required.");
    } else if (field.type === "number") {
      const num = parseFloat(rawValue);

      if (isNaN(num) || num <= 0) {
        problems.push(field.label + " must be a valid positive number.");
      } else if (field.min !== undefined && num < field.min) {
        problems.push(field.label + " is below the allowed minimum (" + field.min + ").");
      } else if (field.max !== undefined && num > field.max) {
        problems.push(field.label + " is above the allowed maximum (" + field.max + ").");
      }
    }
  }

  return problems;
}

/* ---------------------------------------------------------
   SWITCH-CASE
   Maps the computed BMI number to a category, a plain-language
   recommendation, and a CSS color token.
--------------------------------------------------------- */
function classifyBmi(bmi) {
  let category, message, colorVar;

  switch (true) {
    case bmi < 18.5:
      category = "Underweight";
      colorVar = "under";
      message =
        "You are a bit below the healthy range. Consider a balanced, calorie-sufficient diet, and check in with a nutritionist if this persists.";
      break;

    case bmi < 25:
      category = "Normal";
      colorVar = "normal";
      message = "You are within the healthy range. Keep up your current habits — balanced meals and regular movement.";
      break;

    case bmi < 30:
      category = "Overweight";
      colorVar = "over";
      message = "You are slightly above the healthy range. More daily activity and mindful portions can help bring this down.";
      break;

    default:
      category = "Obese";
      colorVar = "obese";
      message = "Your BMI is significantly above the healthy range. We recommend consulting the campus clinic or a healthcare provider.";
  }

  return { category, message, colorVar };
}

/* ---------------------------------------------------------
   Render the result card and animate the gauge arc.
--------------------------------------------------------- */
function showResult(name, bmi, category, message, colorVar) {
  resultCard.classList.remove("hidden");

  bmiNumber.textContent = bmi;
  categoryBadge.textContent = category;
  categoryBadge.className = "category-badge cat-" + colorVar;
  recommendation.textContent = message;
  resultName.textContent = "Result for " + name;

  // Map BMI (12–42 assumed clinical range) to a 0–1 fill along the arc
  const minBmi = 12;
  const maxBmi = 42;
  const pct = Math.min(Math.max((bmi - minBmi) / (maxBmi - minBmi), 0), 1);

  const length = gaugeFill.getTotalLength();
  gaugeFill.style.stroke = "var(--" + colorVar + ")";
  gaugeFill.style.strokeDasharray = length;
  gaugeFill.style.strokeDashoffset = length;

  requestAnimationFrame(() => {
    gaugeFill.style.transition = "stroke-dashoffset 900ms ease-out";
    gaugeFill.style.strokeDashoffset = length * (1 - pct);
  });

  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function addToHistory(record) {
  sessionHistory.unshift(record);
  renderHistory();
}

/* ---------------------------------------------------------
   LOOP (forEach)
   Rebuilds the "Recent Check-ins" list from the in-memory
   array every time a new record is added.
--------------------------------------------------------- */
function renderHistory() {
  historyList.innerHTML = "";

  if (sessionHistory.length === 0) {
    historyList.innerHTML = '<li class="empty-state">No check-ins yet — results will appear here.</li>';
    return;
  }

  sessionHistory.forEach((record, index) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML =
      '<span class="history-name">' + (index + 1) + ". " + record.name + "</span>" +
      '<span class="history-bmi">' + record.bmi + " kg/m²</span>" +
      '<span class="history-cat cat-' + categoryToVar(record.category) + '">' + record.category + "</span>";
    historyList.appendChild(li);
  });
}

function categoryToVar(category) {
  switch (category) {
    case "Underweight":
      return "under";
    case "Normal":
      return "normal";
    case "Overweight":
      return "over";
    default:
      return "obese";
  }
}

/* ---------------------------------------------------------
   Send the record to the Google Apps Script Web App so it
   gets appended as a new row in the connected Google Sheet.
--------------------------------------------------------- */
function recordSubmission(record) {
  if (!WEB_APP_URL || WEB_APP_URL === "YOUR_WEB_APP_URL") {
    console.warn("WEB_APP_URL not set yet — skipping Google Sheet logging. See Part E of the lab.");
    return;
  }

  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(record),
  }).catch((err) => console.error("Could not record submission:", err));
}
