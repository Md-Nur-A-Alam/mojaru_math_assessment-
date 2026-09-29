/**
 * Mojaru – Math Knowledge Assessment & Evaluation Backend (Google Apps Script)
 * ----------------------------------------------------------------------------
 * Sheet: https://docs.google.com/spreadsheets/d/11AmKQqW0TQMoGWgTgZU134g7N9OZMrB4RS5-sL-lUYc/edit
 * Tabs:
 *   - Sheet1: Student Assessment Responses
 *   - evaluation: Marks & Evaluations per Participant
 */

const SPREADSHEET_ID = '11AmKQqW0TQMoGWgTgZU134g7N9OZMrB4RS5-sL-lUYc';
const RESPONSES_SHEET_NAME = 'Sheet1';
const EVAL_SHEET_NAME = 'evaluation';

const QUESTION_HEADERS = ['QS-1','QS-2','QS-3','QS-4','QS-5','QS-6','QS-7','QS-8','QS-9','QS-10'];
const META_HEADERS = ['Timestamp', 'Student Name', 'Class', 'Phone', 'Date', 'Time Taken (sec)'];

const EVAL_META_HEADERS = ['Row ID', 'Timestamp', 'Student Name', 'Class', 'Phone', 'Total Mark (20)', 'Percentage', 'Status', 'Evaluated At'];
const EVAL_QUESTION_HEADERS = ['QS-1 Mark', 'QS-2 Mark', 'QS-3 Mark', 'QS-4 Mark', 'QS-5 Mark', 'QS-6 Mark', 'QS-7 Mark', 'QS-8 Mark', 'QS-9 Mark', 'QS-10 Mark'];
const EVAL_HEADERS = EVAL_META_HEADERS.concat(EVAL_QUESTION_HEADERS, ['Remarks']);

function getSpreadsheet_() {
  return SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function getResponsesSheet_() {
  const ss = getSpreadsheet_();
  return ss.getSheetByName(RESPONSES_SHEET_NAME) || ss.getSheets()[0];
}

function getEvaluationSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(EVAL_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(EVAL_SHEET_NAME);
  }
  return sheet;
}

/** Returns {header: columnIndex(1-based)}; appends any missing headers. */
function ensureHeaders_(sheet, needed) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const row = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  const map = {};
  row.forEach((h, i) => { if (h) map[h] = i + 1; });

  let next = row.length;
  while (next > 0 && !row[next - 1]) next--;
  needed.forEach(h => {
    if (!map[h]) {
      next++;
      sheet.getRange(1, next).setValue(h).setFontWeight('bold');
      map[h] = next;
    }
  });
  return map;
}

/** Stop spreadsheet formula injection from student input. */
function clean_(v) {
  let s = String(v == null ? '' : v).trim().slice(0, 3000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj, callback) {
  const txt = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + txt + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(txt)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET requests:
 * 1. Default / ?action=getResponses: Return list of all submissions with evaluation data.
 */
function doGet(e) {
  try {
    const callback = e && e.parameter && e.parameter.callback;
    const action = (e && e.parameter && e.parameter.action) || 'getResponses';

    if (action === 'getResponses') {
      const respSheet = getResponsesSheet_();
      const evalSheet = getEvaluationSheet_();

      const lastRow = respSheet.getLastRow();
      const lastCol = respSheet.getLastColumn();

      if (lastRow <= 1) {
        return json_({ ok: true, total: 0, submissions: [] }, callback);
      }

      // Read responses headers and rows
      const respValues = respSheet.getRange(1, 1, lastRow, lastCol).getValues();
      const respHeaders = respValues[0].map(h => String(h).trim());

      // Read evaluation sheet data
      const evalLastRow = evalSheet.getLastRow();
      const evalMap = {}; // key: rowId or timestamp+name+roll

      if (evalLastRow > 1) {
        ensureHeaders_(evalSheet, EVAL_HEADERS);
        const evalValues = evalSheet.getRange(1, 1, evalLastRow, evalSheet.getLastColumn()).getValues();
        const evalHeaders = evalValues[0].map(h => String(h).trim());

        for (let r = 1; r < evalValues.length; r++) {
          const evalRow = evalValues[r];
          const rowObj = {};
          evalHeaders.forEach((h, i) => { rowObj[h] = evalRow[i]; });

          const rowId = String(rowObj['Row ID'] || '');
          const key = rowId || (String(rowObj['Student Name']) + '_' + String(rowObj['Roll']));

          const marks = {};
          QUESTION_HEADERS.forEach((qh, i) => {
            const markHeader = qh + ' Mark';
            marks[qh] = rowObj[markHeader] !== '' && rowObj[markHeader] != null ? Number(rowObj[markHeader]) : null;
          });

          evalMap[key] = {
            totalMark: rowObj['Total Mark (20)'] !== '' ? Number(rowObj['Total Mark (20)']) : 0,
            percentage: rowObj['Percentage'] || '',
            status: rowObj['Status'] || 'Evaluated',
            evaluatedAt: rowObj['Evaluated At'] || '',
            remarks: rowObj['Remarks'] || '',
            marks: marks
          };
        }
      }

      const submissions = [];
      for (let r = 1; r < respValues.length; r++) {
        const row = respValues[r];
        const rowObj = {};
        respHeaders.forEach((h, i) => { rowObj[h] = row[i]; });

        const rowId = r + 1; // 1-based spreadsheet row number
        const answers = {};
        QUESTION_HEADERS.forEach(qh => {
          answers[qh] = rowObj[qh] != null ? String(rowObj[qh]) : '';
        });

        const keyWithId = String(rowId);
        const studentPhone = String(rowObj['Phone'] != null ? rowObj['Phone'] : (rowObj['Roll'] != null ? rowObj['Roll'] : ''));
        const keyWithStudent = String(rowObj['Student Name']) + '_' + studentPhone;
        const evalData = evalMap[keyWithId] || evalMap[keyWithStudent] || null;

        submissions.push({
          rowId: rowId,
          timestamp: rowObj['Timestamp'] ? Utilities.formatDate(new Date(rowObj['Timestamp']), Session.getScriptTimeZone() || 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss') : '',
          name: String(rowObj['Student Name'] != null ? rowObj['Student Name'] : ''),
          class: String(rowObj['Class'] != null ? rowObj['Class'] : 'Class 3'),
          phone: studentPhone,
          roll: studentPhone,
          date: String(rowObj['Date'] != null ? rowObj['Date'] : ''),
          durationSec: Number(rowObj['Time Taken (sec)']) || 0,
          answers: answers,
          evaluation: evalData
        });
      }

      return json_({
        ok: true,
        total: submissions.length,
        submissions: submissions
      }, callback);
    }

    return json_({ ok: true, service: 'Mojaru Math Assessment API' }, callback);
  } catch (err) {
    return json_({ ok: false, error: String(err) }, e && e.parameter && e.parameter.callback);
  }
}

/**
 * Handle POST requests:
 * 1. action === 'evaluate': Save/update marks for a participant in the 'evaluation' sheet.
 * 2. default: Save student assessment submission in 'Sheet1'.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const now = new Date();
    const timeZone = Session.getScriptTimeZone() || 'Asia/Dhaka';
    const nowStr = Utilities.formatDate(now, timeZone, 'yyyy-MM-dd HH:mm:ss');

    // -------------------------------------------------------------
    // Action 1: Save Evaluation from Admin
    // -------------------------------------------------------------
    if (body.action === 'evaluate') {
      const rowId = body.rowId;
      const name = clean_(body.name);
      const studentClass = clean_(body.class || 'Class 3');
      const phone = clean_(body.phone || body.roll);
      const studentTimestamp = clean_(body.timestamp || nowStr);
      const marks = body.marks || {};
      const remarks = clean_(body.remarks || '');

      let totalMark = 0;
      let evaluatedCount = 0;
      QUESTION_HEADERS.forEach(qh => {
        const val = marks[qh];
        if (val !== undefined && val !== null && val !== '') {
          totalMark += Number(val);
          evaluatedCount++;
        }
      });

      const percentage = (totalMark / 20 * 100).toFixed(1) + '%';
      const status = evaluatedCount === 10 ? 'সম্পন্ন (Completed)' : (evaluatedCount > 0 ? 'আংশিক (Partial)' : 'বাকি (Pending)');

      const evalSheet = getEvaluationSheet_();
      const cols = ensureHeaders_(evalSheet, EVAL_HEADERS);

      const lastRow = evalSheet.getLastRow();
      let targetRow = 0;

      // Look for existing evaluation for this student
      if (lastRow > 1) {
        const existingData = evalSheet.getRange(2, 1, lastRow - 1, evalSheet.getLastColumn()).getValues();
        const phoneColIdx = cols['Phone'] || cols['Roll'];
        for (let i = 0; i < existingData.length; i++) {
          const rId = existingData[i][cols['Row ID'] - 1];
          const rName = existingData[i][cols['Student Name'] - 1];
          const rPhone = phoneColIdx ? existingData[i][phoneColIdx - 1] : '';

          if (rowId && String(rId) === String(rowId)) {
            targetRow = i + 2;
            break;
          } else if (String(rName) === String(name) && String(rPhone) === String(phone)) {
            targetRow = i + 2;
            break;
          }
        }
      }

      const rowWidth = Math.max(evalSheet.getLastColumn(), Object.keys(cols).length);
      const rowData = new Array(rowWidth).fill('');

      rowData[cols['Row ID'] - 1] = rowId || '';
      rowData[cols['Timestamp'] - 1] = studentTimestamp;
      rowData[cols['Student Name'] - 1] = name;
      rowData[cols['Class'] - 1] = studentClass;
      const evalPhoneCol = cols['Phone'] || cols['Roll'];
      if (evalPhoneCol) rowData[evalPhoneCol - 1] = phone;
      rowData[cols['Total Mark (20)'] - 1] = totalMark;
      rowData[cols['Percentage'] - 1] = percentage;
      rowData[cols['Status'] - 1] = status;
      rowData[cols['Evaluated At'] - 1] = nowStr;

      QUESTION_HEADERS.forEach(qh => {
        const markCol = cols[qh + ' Mark'];
        if (markCol) {
          rowData[markCol - 1] = marks[qh] !== undefined && marks[qh] !== null ? Number(marks[qh]) : '';
        }
      });

      if (cols['Remarks']) {
        rowData[cols['Remarks'] - 1] = remarks;
      }

      if (targetRow > 0) {
        evalSheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        evalSheet.appendRow(rowData);
      }

      return json_({
        ok: true,
        message: 'Evaluation saved successfully',
        totalMark: totalMark,
        percentage: percentage,
        status: status,
        evaluatedAt: nowStr
      });
    }

    // -------------------------------------------------------------
    // Action 2: Student Assessment Submission
    // -------------------------------------------------------------
    const name = clean_(body.name);
    const phone = clean_(body.phone || body.roll);
    if (!name || !phone) return json_({ ok: false, error: 'Name and phone number are required' });

    const studentClass = clean_(body.class || body.studentClass || 'Class 3');
    const defaultDateStr = Utilities.formatDate(now, timeZone, 'yyyy-MM-dd HH:mm:ss');
    const date = clean_(body.date) || defaultDateStr;

    const answers = body.answers || {};
    const sheet = getResponsesSheet_();
    const cols = ensureHeaders_(sheet, META_HEADERS.concat(QUESTION_HEADERS));

    const width = Math.max(sheet.getLastColumn(), Object.keys(cols).length);
    const row = new Array(width).fill('');

    row[cols['Timestamp'] - 1] = now;
    row[cols['Student Name'] - 1] = name;
    row[cols['Class'] - 1] = studentClass;
    const phoneCol = cols['Phone'] || cols['Roll'];
    if (phoneCol) row[phoneCol - 1] = phone;
    row[cols['Date'] - 1] = date;
    row[cols['Time Taken (sec)'] - 1] = Number(body.durationSec) || '';

    QUESTION_HEADERS.forEach(h => {
      if (cols[h]) {
        row[cols[h] - 1] = clean_(answers[h]);
      }
    });

    sheet.appendRow(row);
    return json_({ ok: true, timestamp: defaultDateStr });

  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
