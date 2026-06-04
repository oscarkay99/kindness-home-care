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

const ENUM_FIELDS = {
  'contact-form': {
    'Subject': [
      'Requesting care for a loved one',
      'Caregiver job application',
      'Pricing and payment question',
      'Insurance / Certificate of Insurance',
      'Service agreement question',
      'General inquiry',
      'Feedback or complaint',
      'Other'
    ],
    'Best way to reach you': ['Email', 'Phone call', 'Text message']
  },
  'care-form': {
    "Client's Living Situation": [
      'Lives alone',
      'Lives with family member(s)',
      'Lives with spouse/partner',
      'Other'
    ],
    'Services Needed': [
      '24-Hour Live-In Care',
      'Companionship',
      'Errands & Transportation',
      'Meal Preparation',
      'Grooming & Personal Care',
      'Light Housekeeping',
      'Medication Reminders',
      'Respite Care for Families',
      'Home Health Aide (HHA)',
      'STNA Care Support',
      'Personal Care'
    ],
    'Estimated Hours of Care Per Week': [
      'Less than 10 hours',
      '10–20 hours',
      '20–40 hours',
      'Full-time (40+ hours)',
      '24/7 Live-In'
    ],
    'Your Relationship to Client': [
      'Son / Daughter',
      'Spouse / Partner',
      'Sibling',
      'Parent',
      'Friend',
      'Legal Guardian',
      'The client (self)',
      'Other'
    ],
    'Best Time to Reach You': [
      'Morning (8 AM – 12 PM)',
      'Afternoon (12 PM – 5 PM)',
      'Evening (5 PM – 8 PM)',
      'Any time'
    ],
    'How did you hear about us?': [
      'Google / Internet search',
      'Referred by a friend or family',
      'Hospital / Healthcare provider',
      'Social media',
      'Flyer / Mailer',
      'Other'
    ]
  },
  'join-form': {
    'Position of Interest': [
      'Caregiver / Home Health Aide',
      'STNA (State Tested Nursing Assistant)',
      'Companion Care Aide',
      'Live-In Caregiver',
      'Administrative / Office Support'
    ],
    'Employment Type': [
      'Full-time (40 hrs/week)',
      'Part-time (under 30 hrs/week)',
      'Per Diem / As Needed',
      'Live-In'
    ],
    'Desired Weekly Hours': [
      'Under 10 hours',
      '10–20 hours',
      '20–30 hours',
      '30–40 hours',
      '40+ hours'
    ],
    'Available Days': [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    'Available Shifts': [
      'Morning (6 AM – 2 PM)',
      'Afternoon (2 PM – 10 PM)',
      'Overnight (10 PM – 6 AM)',
      'Flexible / Open'
    ],
    'Highest Education Level': [
      'High School Diploma / GED',
      'Some College',
      "Associate's Degree",
      "Bachelor's Degree",
      'Graduate Degree'
    ],
    'Years of Caregiving / Healthcare Experience': [
      'Less than 1 year',
      '1–2 years',
      '3–5 years',
      '5–10 years',
      '10+ years'
    ],
    'Certifications Held': [
      'STNA (Ohio)',
      'CPR / First Aid',
      'CNA',
      'Home Health Aide (HHA)',
      "Alzheimer's / Dementia Care",
      'Other'
    ],
    "Valid Driver's License?": ['Yes', 'No'],
    'Reliable Transportation?': ['Yes', 'No'],
    'Legally authorized to work in the US?': ['Yes', 'No'],
    'Have you ever been convicted of a felony or misdemeanor?': ['Yes', 'No']
  }
};

const MULTI_VALUE_ENUM_FIELDS = {
  'Services Needed': true,
  'Available Days': true,
  'Available Shifts': true,
  'Certifications Held': true
};

const DATE_FIELD_RULES = {
  "Client's Date of Birth": 'past-or-today',
  'Desired Care Start Date': 'future-or-today',
  'Date of Birth': 'past-or-today',
  'Earliest Available Start Date': 'future-or-today',
  'STNA License Expiration Date': 'future-or-today'
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
  const enumFields = ENUM_FIELDS[payload.formId] || {};
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

  Object.keys(enumFields).forEach(function(label) {
    const value = getField_(fields, label);
    if (!value) {
      return;
    }

    const submittedValues = MULTI_VALUE_ENUM_FIELDS[label]
      ? String(value).split(',').map(function(entry) { return entry.trim(); }).filter(Boolean)
      : [String(value).trim()];

    const hasInvalidValue = submittedValues.some(function(submittedValue) {
      return enumFields[label].indexOf(submittedValue) === -1;
    });

    if (hasInvalidValue) {
      throw new Error('Invalid option submitted for ' + label + '.');
    }
  });

  Object.keys(DATE_FIELD_RULES).forEach(function(label) {
    const value = getField_(fields, label);
    if (value && !isValidDateValue_(value, DATE_FIELD_RULES[label])) {
      throw new Error('Invalid date submitted for ' + label + '.');
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

function isValidDateValue_(value, rule) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) {
    return false;
  }

  const date = new Date(value + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return false;
  }

  if (date.toISOString().slice(0, 10) !== value) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (rule === 'past-or-today') {
    return date <= today;
  }

  if (rule === 'future-or-today') {
    return date >= today;
  }

  return true;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
