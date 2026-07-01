# Health Self-Check Kiosk

A responsive walk-in "kiosk" web app for DLSU-D that computes a user's BMI, classifies it into a health category, shows a tailored recommendation, and logs every submission to a shared Google Sheet.

Built for Laboratory 5 — Building a Responsive Health Self-Check Web Application (IT Department, DLSU-D).

## The problem

Students and employees on campus don't have a quick, private way to check their BMI and get a basic wellness pointer without a clinic visit. This kiosk lets someone walk up, enter their name, age, sex, weight, and height, and immediately see their BMI, category, and a short recommendation — while the school nurse / HR office gets a running log of check-ins in a Google Sheet.

## How it works

- **`index.html`** — semantic page structure: header, main (form card + result card), a session history list, and a footer.
- **`style.css`** — card-based responsive layout using CSS Grid, with a media query that stacks the two-column form fields vertically on screens ≤600px, and another that stacks the two main cards on screens ≤900px.
- **`script.js`**
  - `validateFields()` — loops through every required field once and uses if-else to catch empty values and out-of-range numbers.
  - `classifyBmi()` — switch-case that maps the computed BMI to a category, message, and color.
  - `renderHistory()` — forEach loop that rebuilds the on-screen "Recent Check-ins" list from an in-memory array.
  - `recordSubmission()` — POSTs each validated record to a Google Apps Script Web App, which appends it as a row in a Google Sheet.

## Running it locally

1. Clone or download this repo.
2. Open `index.html` in a browser (or serve the folder with any static server).
3. Fill in the form and submit — the result card and gauge should animate in.

To enable Google Sheet logging, deploy the Apps Script Web App described in the lab handout and paste the resulting URL into the `WEB_APP_URL` constant near the top of `script.js`.

## Live demo

_Add your GitHub Pages link here once published, e.g._
`https://<your-username>.github.io/health-checker-kiosk/`

## Disclaimer

This tool is for screening purposes only and is not a medical diagnosis.
