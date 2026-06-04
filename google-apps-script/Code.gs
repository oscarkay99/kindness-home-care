const SPREADSHEET_ID = '1iBDwjpMpb_Ju9MBT-B_tz7tmWXafEOrqhdBkraYxRYI';
const MINIMUM_SUBMISSION_TIME_MS = 2500;

const FORM_SHEETS = {
  'newsletter-form': {
    name: 'Newsletter',
    headers: [
      'Submitted At',
      'Email'
    ]
  },
  'contact-form': {
    name: 'Contact Inquiries',
    headers: [
      'Submitted At',
      'Your Name',
      'Your Phone',
      'Your Email',
      'Subject',
      'Message',
      'Best way to reach you'
    ]
  },
  'care-form': {
    name: 'Care Requests',
    headers: [
      'Submitted At',
      "Client's Full Name",
      "Client's Date of Birth",
      "Client's Home Address",
      'City',
      'ZIP Code',
      "Client's Living Situation",
      'Primary Language',
      'Services Needed',
      'Estimated Hours of Care Per Week',
      'Desired Care Start Date',
      'Medical Conditions or Special Needs',
      'Primary Physician / Doctor',
      'Physician Phone',
      'Your Full Name',
      'Your Relationship to Client',
      'Your Phone',
      'Your Email',
      'Best Time to Reach You',
      'How did you hear about us?',
      'Anything else we should know?'
    ]
  },
  'join-form': {
    name: 'Job Applications',
    headers: [
      'Submitted At',
      'First Name',
      'Last Name',
      'Date of Birth',
      'Phone Number',
      'Email Address',
      'Street Address',
      'City',
      'ZIP Code',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Position of Interest',
      'Employment Type',
      'Desired Weekly Hours',
      'Earliest Available Start Date',
      'Available Days',
      'Available Shifts',
      'Highest Education Level',
      'Years of Caregiving / Healthcare Experience',
      'Certifications Held',
      'STNA License Number',
      'STNA License Expiration Date',
      "Valid Driver's License?",
      'Reliable Transportation?',
      'Legally authorized to work in the US?',
      'Languages Spoken',
      'Have you ever been convicted of a felony or misdemeanor?',
      'If yes, please explain',
      'I consent to a background check as part of the hiring process.',
      'Professional Reference 1 - Full name',
      'Professional Reference 1 - Relationship / Title',
      'Professional Reference 1 - Phone number',
      'Professional Reference 1 - Email address',
      'Professional Reference 2 - Full name',
      'Professional Reference 2 - Relationship / Title',
      'Professional Reference 2 - Phone number',
      'Professional Reference 2 - Email address',
      'Why do you want to work with Kindness Home Care Services?',
      'Describe your experience caring for elderly or disabled individuals.',
      "Is there anything else you'd like us to know?",
      'Resume File Name',
      'Resume File URL'
    ]
  }
};

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
      sheetName: result.sheetName
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message
    });
  }
}

function saveSubmission_(payload) {
  const formId = payload.formId || '';
  const formConfig = FORM_SHEETS[formId];

  if (!formConfig) {
    throw new Error('Unknown form ID: ' + formId);
  }

  validateSubmission_(payload);

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet_(spreadsheet, formConfig.name);
  const fields = normalizeFields_(payload.fields);
  const uploadedFile = saveFileIfPresent_(payload.fileUpload);

  ensureHeaders_(sheet, formConfig.headers);

  const row = buildRow_(formId, formConfig.headers, fields, uploadedFile);
  sheet.appendRow(row);

  return { sheetName: formConfig.name };
}

function buildRow_(formId, headers, fields, uploadedFile) {
  return headers.map(function(header) {
    if (header === 'Submitted At') {
      return new Date();
    }

    if (formId === 'newsletter-form' && header === 'Email') {
      return firstNonEmpty_([
        getField_(fields, 'Email'),
        getField_(fields, 'your@email.com')
      ]);
    }

    if (header === 'Resume File Name') {
      return uploadedFile.name || '';
    }

    if (header === 'Resume File URL') {
      return uploadedFile.url || '';
    }

    return getField_(fields, header);
  });
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function ensureHeaders_(sheet, headers) {
  const lastRow = sheet.getLastRow();

  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const matches = headers.every(function(header, index) {
    return existingHeaders[index] === header;
  });

  if (!matches) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
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

function getField_(fields, key) {
  return fields[key] || '';
}

function firstNonEmpty_(values) {
  for (var i = 0; i < values.length; i += 1) {
    if (values[i]) {
      return values[i];
    }
  }
  return '';
}

function saveFileIfPresent_(fileUpload) {
  if (!fileUpload || !fileUpload.base64 || !fileUpload.name) {
    return {};
  }

  const bytes = Utilities.base64Decode(fileUpload.base64);
  const blob = Utilities.newBlob(
    bytes,
    fileUpload.mimeType || 'application/octet-stream',
    fileUpload.name
  );
  const file = DriveApp.getRootFolder().createFile(blob);

  return {
    name: file.getName(),
    url: file.getUrl()
  };
}

function validateSubmission_(payload) {
  const antiSpam = payload.antiSpam || {};

  if (antiSpam.honeypotFilled) {
    throw new Error('Spam check failed.');
  }

  if (antiSpam.elapsedMs && Number(antiSpam.elapsedMs) < MINIMUM_SUBMISSION_TIME_MS) {
    throw new Error('Submission was sent too quickly.');
  }
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
