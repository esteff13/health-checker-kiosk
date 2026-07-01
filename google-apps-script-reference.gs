/**
 * Reference only — this file is NOT used by GitHub Pages or the website itself.
 * Paste the function below into the Apps Script editor attached to your
 * "BMI Kiosk Records" Google Sheet (Extensions > Apps Script).
 *
 * Sheet header row (row 1) should be:
 * Timestamp | Name | Age | Sex | Weight | Height | BMI | Category
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name,
    data.age,
    data.sex,
    data.weight,
    data.heightCm,
    data.bmi,
    data.category,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
