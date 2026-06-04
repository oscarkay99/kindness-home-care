const SHEET_NAMES = {
  'newsletter-form': 'Newsletter',
  'contact-form': 'Contact Inquiries',
  'care-form': 'Care Requests',
  'join-form': 'Job Applications'
};

const DEFAULT_HEADERS = [
  'Submitted At',
  'Form ID',
  'Form Title',
  'Source Page',
  'Page URL',
  'Primary Name',
  'Primary Email',
  'Primary Phone',
  'Subject',
  'Message',
  'Details JSON',
  'File Name',
  'File URL',
  'File ID',
  'User Agent'
];

function doGet() {
  return jsonResponse_({
    ok: true,
    message: 'Kindness Home Care Google Sheets endpoint is running.'
  });
}

function doPost(e) {
  try {
    const payloadString = (e && e.parameter && e.parameter.payload) || '{}';
    const payload = JSON.parse(payloadString);
    const result = saveSubmission_(payload);

    return jsonResponse_({
      ok: true,
      sheetName: result.sheetName,
      fileUrl: result.fileUrl || ''
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message
    });
  }
}

function saveSubmission_(payload) {
  const spreadsheet = getSpreadsheet_();
  const sheetName = SHEET_NAMES[payload.formId] || 'Website Submissions';
  const sheet = getOrCreateSheet_(spreadsheet, sheetName);
  ensureHeaders_(sheet, DEFAULT_HEADERS);

  const normalizedFields = normalizeFields_(payload.fields);
  const summary = summarizeFields_(normalizedFields);
  const uploadedFile = saveFileIfPresent_(payload.fileUpload);

  sheet.appendRow([
    new Date(),
    payload.formId || '',
    payload.formTitle || '',
    payload.sourcePage || '',
    payload.pageUrl || '',
    summary.name || '',
    summary.email || '',
    summary.phone || '',
    summary.subject || '',
    summary.message || '',
    JSON.stringify(normalizedFields),
    uploadedFile.name || '',
    uploadedFile.url || '',
    uploadedFile.id || '',
    payload.userAgent || ''
  ]);

  return {
    sheetName: sheetName,
    fileUrl: uploadedFile.url || ''
  };
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('Missing SPREADSHEET_ID in Apps Script properties.');
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function normalizeFields_(fields) {
  if (!Array.isArray(fields)) {
    return {};
  }

  const normalized = {};

  fields.forEach(function(field, index) {
    const rawLabel = field && field.label ? String(field.label) : 'Field ' + (index + 1);
    const label = dedupeLabel_(normalized, rawLabel);
    normalized[label] = field && field.value ? String(field.value) : '';
  });

  return normalized;
}

function dedupeLabel_(existingFields, label) {
  if (!Object.prototype.hasOwnProperty.call(existingFields, label)) {
    return label;
  }

  let counter = 2;
  let candidate = label + ' (' + counter + ')';

  while (Object.prototype.hasOwnProperty.call(existingFields, candidate)) {
    counter += 1;
    candidate = label + ' (' + counter + ')';
  }

  return candidate;
}

function summarizeFields_(fields) {
  const entries = Object.keys(fields).map(function(key) {
    return {
      label: key,
      value: fields[key]
    };
  });

  return {
    name: findFieldValue_(entries, [/your full name/i, /your name/i, /first name/i, /client's full name/i, /full name/i]),
    email: findFieldValue_(entries, [/email/i]),
    phone: findFieldValue_(entries, [/your phone/i, /phone number/i, /phone/i]),
    subject: findFieldValue_(entries, [/subject/i, /position of interest/i, /services needed/i]),
    message: findFieldValue_(entries, [/message/i, /anything else we should know/i, /why do you want to work/i])
  };
}

function findFieldValue_(entries, patterns) {
  for (var i = 0; i < patterns.length; i += 1) {
    var pattern = patterns[i];
    for (var j = 0; j < entries.length; j += 1) {
      if (pattern.test(entries[j].label) && entries[j].value) {
        return entries[j].value;
      }
    }
  }

  return '';
}

function saveFileIfPresent_(fileUpload) {
  if (!fileUpload || !fileUpload.base64 || !fileUpload.name) {
    return {};
  }

  const bytes = Utilities.base64Decode(fileUpload.base64);
  const blob = Utilities.newBlob(bytes, fileUpload.mimeType || 'application/octet-stream', fileUpload.name);
  const folderId = PropertiesService.getScriptProperties().getProperty('RESUME_FOLDER_ID');
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  const file = folder.createFile(blob);

  return {
    id: file.getId(),
    name: file.getName(),
    url: file.getUrl()
  };
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
