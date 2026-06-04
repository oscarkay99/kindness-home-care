const SPREADSHEET_ID = '1iBDwjpMpb_Ju9MBT-B_tz7tmWXafEOrqhdBkraYxRYI';
const MINIMUM_SUBMISSION_TIME_MS = 2500;
const MAX_FIELDS_PER_FORM = 50;
const MAX_LABEL_LENGTH = 120;
const MAX_VALUE_LENGTH = 5000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

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

const REQUIRED_FIELDS = {
  'newsletter-form': ['Email'],
  'contact-form': ['Your Name', 'Your Email', 'Subject', 'Message'],
  'care-form': [
    "Client's Full Name",
    "Client's Home Address",
    'City',
    'ZIP Code',
    'Services Needed',
    'Your Full Name',
    'Your Phone',
    'Your Email'
  ],
  'join-form': [
    'First Name',
    'Last Name',
    'Phone Number',
    'Email Address',
    'Street Address',
    'City',
    'ZIP Code',
    'Position of Interest',
    'Employment Type',
    'Earliest Available Start Date',
    'I consent to a background check as part of the hiring process.'
  ]
};

const EMAIL_FIELDS = [
  'Email',
  'Your Email',
  'Email Address',
  'Professional Reference 1 - Email address',
  'Professional Reference 2 - Email address'
];

const PHONE_FIELDS = [
  'Your Phone',
  'Phone Number',
  'Emergency Contact Phone',
  'Professional Reference 1 - Phone number',
  'Professional Reference 2 - Phone number',
  'Physician Phone'
];

const FIELD_ALIASES = {
  'newsletter-form': {
    'your@email.com': 'Email'
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

  validateSubmission_(payload, formConfig);

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet_(spreadsheet, formConfig.name);
  const fields = canonicalizeFields_(payload.formId, normalizeFields_(payload.fields));
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

function canonicalizeFields_(formId, fields) {
  const aliases = FIELD_ALIASES[formId] || {};
  const canonical = {};

  Object.keys(fields).forEach(function(label) {
    const normalizedLabel = aliases[label] || label;
    canonical[normalizedLabel] = fields[label];
  });

  return canonical;
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

function validateSubmission_(payload, formConfig) {
  const antiSpam = payload.antiSpam || {};
  const fields = canonicalizeFields_(payload.formId, normalizeFields_(payload.fields));
  const allowedFields = new Set(formConfig.headers.filter(function(header) {
    return header !== 'Submitted At' &&
      header !== 'Resume File Name' &&
      header !== 'Resume File URL';
  }));

  if (antiSpam.honeypotFilled) {
    throw new Error('Spam check failed.');
  }

  if (antiSpam.elapsedMs && Number(antiSpam.elapsedMs) < MINIMUM_SUBMISSION_TIME_MS) {
    throw new Error('Submission was sent too quickly.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid submission payload.');
  }

  if (!Array.isArray(payload.fields)) {
    throw new Error('Submission fields are missing.');
  }

  if (payload.fields.length > MAX_FIELDS_PER_FORM) {
    throw new Error('Too many submitted fields.');
  }

  Object.keys(fields).forEach(function(label) {
    if (!allowedFields.has(label)) {
      throw new Error('Unexpected field submitted: ' + label);
    }

    if (label.length > MAX_LABEL_LENGTH) {
      throw new Error('A field label is too long.');
    }

    if (String(fields[label]).length > MAX_VALUE_LENGTH) {
      throw new Error('A submitted value is too long.');
    }
  });

  (REQUIRED_FIELDS[payload.formId] || []).forEach(function(label) {
    if (!getField_(fields, label)) {
      throw new Error('Missing required field: ' + label);
    }
  });

  EMAIL_FIELDS.forEach(function(label) {
    const value = getField_(fields, label);
    if (value && !isValidEmail_(value)) {
      throw new Error('Invalid email address in ' + label + '.');
    }
  });

  PHONE_FIELDS.forEach(function(label) {
    const value = getField_(fields, label);
    if (value && !isValidPhone_(value)) {
      throw new Error('Invalid phone number in ' + label + '.');
    }
  });

  if (payload.formId === 'join-form' && !payload.fileUpload) {
    throw new Error('Resume upload is required.');
  }

  if (payload.fileUpload) {
    validateFileUpload_(payload.fileUpload, payload.formId);
  }
}

function validateFileUpload_(fileUpload, formId) {
  if (!fileUpload.name || !fileUpload.base64) {
    throw new Error('Uploaded file is incomplete.');
  }

  if (fileUpload.size && Number(fileUpload.size) > MAX_FILE_SIZE_BYTES) {
    throw new Error('Uploaded file is too large.');
  }

  if (formId === 'join-form' && ALLOWED_RESUME_TYPES.indexOf(fileUpload.mimeType || '') === -1) {
    throw new Error('Resume must be a PDF, DOC, or DOCX file.');
  }
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPhone_(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
