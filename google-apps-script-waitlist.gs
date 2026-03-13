// Vecta waitlist Google Apps Script endpoint
// 1) Open script.google.com and create a new project.
// 2) Paste this file into Code.gs.
// 3) Deploy > New deployment > Web app.
//    Execute as: Me
//    Who has access: Anyone
// 4) Copy the /exec URL and replace REPLACE_WITH_DEPLOYED_WEB_APP_ID
//    in waitlist.html and waitlist-de.html.

const SPREADSHEET_ID = "1_zFdAYY0OsFbKQSImMFhfgdQTx9ftfbOqmxSIvThhXU";
const SHEET_NAME = "Sheet1";

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Vecta waitlist endpoint is running.",
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim();
    const locale = String(payload.locale || "").trim();
    const source = String(payload.source || "").trim();
    const userAgent = String(payload.userAgent || "").trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !emailPattern.test(email)) {
      return jsonResponse({ ok: false, error: "Invalid name or email." });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];

    sheet.appendRow([new Date(), name, email, locale, source, userAgent]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
