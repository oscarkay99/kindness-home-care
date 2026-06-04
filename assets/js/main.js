/* =============================================
   Kindness Home Care – Shared JavaScript
   ============================================= */

const formsConfig = window.KINDNESS_FORMS_CONFIG || {};
const googleSheetsEndpoint = formsConfig.googleSheetsEndpoint || '';
const minimumSubmissionTimeMs = 2500;
const honeypotFieldName = 'website_company';
const startedAtFieldName = 'form_started_at';
const maxResumeFileSizeBytes = 5 * 1024 * 1024;
const allowedResumeMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const requiredFieldsByForm = {
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
const fieldAliasesByForm = {
  'newsletter-form': {
    'your@email.com': 'Email'
  }
};
const enumFieldsByForm = {
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
const multiValueEnumFields = new Set([
  'Services Needed',
  'Available Days',
  'Available Shifts',
  'Certifications Held'
]);
const dateFieldRules = {
  "Client's Date of Birth": 'past-or-today',
  'Desired Care Start Date': 'future-or-today',
  'Date of Birth': 'past-or-today',
  'Earliest Available Start Date': 'future-or-today',
  'STNA License Expiration Date': 'future-or-today'
};
const multiLineFields = new Set([
  'Message',
  'Medical Conditions or Special Needs',
  'Anything else we should know?',
  'If yes, please explain',
  'Why do you want to work with Kindness Home Care Services?',
  'Describe your experience caring for elderly or disabled individuals.',
  "Is there anything else you'd like us to know?"
]);

const formTitles = {
  'newsletter-form': 'Newsletter Signup',
  'contact-form': 'Contact Form',
  'care-form': 'Care Request',
  'join-form': 'Job Application'
};

const successMessages = {
  'newsletter-form': "Thank you! You've been subscribed.",
  'contact-form': 'Thank you! Your message has been received.',
  'care-form': 'Thank you! Your request has been received.',
  'join-form': 'Application received, thank you!'
};

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initFormProtection();
  initNewsletterForms();
  initApplyTabs();
  initManagedForms();
  initFileUploads();
  initFaq();
  initSmoothScroll();
  initServiceNav();
  initCookieBanner();
});

function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) {
    return;
  }

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuToggle || !mobileMenu) {
    return;
  }

  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.querySelector('i').className = open
      ? 'fa-solid fa-xmark text-lg'
      : 'fa-solid fa-bars text-lg';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.querySelector('i').className = 'fa-solid fa-bars text-lg';
    });
  });
}

function initNewsletterForms() {
  document.querySelectorAll('#newsletter-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      const success = form.querySelector('#newsletter-success');
      const emailInput = form.querySelector('input[type="email"]');

      try {
        setSubmittingState(form, true);
        clearFormFeedback(form);
        await submitFormPayload(form, 'newsletter-form');

        if (success) {
          success.classList.remove('hidden');
          success.textContent = successMessages['newsletter-form'];
        }

        if (emailInput) {
          emailInput.value = '';
        }
      } catch (error) {
        showFormFeedback(form, error.message, 'error');
      } finally {
        setSubmittingState(form, false);
      }
    });
  });
}

function initApplyTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabButtons.length) {
    return;
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabPanels.forEach((panel) => panel.classList.remove('active'));

      button.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });

  if (window.location.hash === '#join-team') {
    const joinButton = document.querySelector('[data-tab="panel-join"]');
    if (joinButton) {
      joinButton.click();
    }
  }
}

function initManagedForms() {
  document.querySelectorAll('[data-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      const formId = form.dataset.form;

      try {
        setSubmittingState(form, true);
        clearFormFeedback(form);
        await submitFormPayload(form, formId);
        revealManagedFormSuccess(form, formId);
      } catch (error) {
        showFormFeedback(form, error.message, 'error');
      } finally {
        setSubmittingState(form, false);
      }
    });
  });
}

async function submitFormPayload(form, formId) {
  if (!googleSheetsEndpoint) {
    throw new Error('Google Sheets endpoint is not configured yet.');
  }

  const payload = await buildSubmissionPayload(form, formId);
  const requestBody = new URLSearchParams({
    payload: JSON.stringify(payload)
  });

  const response = await fetch(googleSheetsEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: requestBody.toString()
  });

  let result = null;
  try {
    result = await response.json();
  } catch (error) {
    throw new Error('We could not verify your submission. Please try again.');
  }

  if (!response.ok || !result || result.ok !== true) {
    throw new Error((result && result.error) || 'We could not submit your form right now.');
  }
}

async function buildSubmissionPayload(form, formId) {
  const antiSpam = readAntiSpamState(form);
  if (antiSpam.honeypotFilled) {
    throw new Error('Submission blocked.');
  }

  if (antiSpam.elapsedMs < minimumSubmissionTimeMs) {
    throw new Error('Please wait a moment and try again.');
  }

  const fields = sanitizeFields(collectFormFields(form));
  const fileUpload = await readFormFile(form);

  validateSubmissionPayload(formId, fields, fileUpload);

  return {
    formId,
    formTitle: formTitles[formId] || 'Website Submission',
    sourcePage: window.location.pathname.split('/').pop() || 'index.html',
    pageUrl: window.location.href,
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    antiSpam,
    fields,
    fileUpload
  };
}

function validateSubmissionPayload(formId, fields, fileUpload) {
  const fieldAliases = fieldAliasesByForm[formId] || {};
  const fieldMap = Object.fromEntries(fields.map((field) => [fieldAliases[field.label] || field.label, field.value]));
  const enumFields = enumFieldsByForm[formId] || {};

  (requiredFieldsByForm[formId] || []).forEach((label) => {
    if (!String(fieldMap[label] || '').trim()) {
      throw new Error(`Please complete the "${label}" field.`);
    }
  });

  ['Email', 'Your Email', 'Email Address'].forEach((label) => {
    const value = fieldMap[label];
    if (value && !isValidEmail(value)) {
      throw new Error(`Please enter a valid email for "${label}".`);
    }
  });

  ['Your Phone', 'Phone Number', 'Emergency Contact Phone', 'Physician Phone'].forEach((label) => {
    const value = fieldMap[label];
    if (value && !isValidPhone(value)) {
      throw new Error(`Please enter a valid phone number for "${label}".`);
    }
  });

  Object.entries(enumFields).forEach(([label, allowedValues]) => {
    const value = fieldMap[label];
    if (!value) {
      return;
    }

    const submittedValues = multiValueEnumFields.has(label)
      ? String(value).split(',').map((entry) => entry.trim()).filter(Boolean)
      : [String(value).trim()];

    const hasInvalidValue = submittedValues.some((submittedValue) => !allowedValues.includes(submittedValue));
    if (hasInvalidValue) {
      throw new Error(`Please choose a valid option for "${label}".`);
    }
  });

  Object.entries(dateFieldRules).forEach(([label, rule]) => {
    const value = fieldMap[label];
    if (!value) {
      return;
    }

    if (!isValidDateValue(value, rule)) {
      throw new Error(`Please enter a valid date for "${label}".`);
    }
  });

  if (formId === 'join-form') {
    if (!fileUpload) {
      throw new Error('Please upload your resume.');
    }

    if (fileUpload.size > maxResumeFileSizeBytes) {
      throw new Error('Resume must be 5 MB or smaller.');
    }

    if (!allowedResumeMimeTypes.has(fileUpload.mimeType)) {
      throw new Error('Resume must be a PDF, DOC, or DOCX file.');
    }
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function isValidDateValue(value, rule) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const normalized = date.toISOString().slice(0, 10);
  if (normalized !== value) {
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

function sanitizeFields(fields) {
  return fields.map((field) => ({
    label: sanitizeLabel(field.label),
    value: sanitizeValue(field.label, field.value)
  }));
}

function sanitizeLabel(label) {
  return String(label || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeValue(label, value) {
  const normalizedLabel = sanitizeLabel(label);
  const stringValue = String(value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const withoutControls = stringValue.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  const collapsedWhitespace = multiLineFields.has(normalizedLabel)
    ? withoutControls.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim()
    : withoutControls.replace(/\s+/g, ' ').trim();

  return neutralizeSpreadsheetFormula(collapsedWhitespace);
}

function neutralizeSpreadsheetFormula(value) {
  if (!value) {
    return '';
  }

  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function initFormProtection() {
  document.querySelectorAll('form').forEach((form) => {
    injectAntiSpamFields(form);
  });
}

function injectAntiSpamFields(form) {
  if (!form.querySelector(`input[name="${startedAtFieldName}"]`)) {
    const startedField = document.createElement('input');
    startedField.type = 'hidden';
    startedField.name = startedAtFieldName;
    startedField.value = String(Date.now());
    form.appendChild(startedField);
  }

  if (!form.querySelector(`input[name="${honeypotFieldName}"]`)) {
    const honeypotWrap = document.createElement('div');
    honeypotWrap.className = 'spam-trap';
    honeypotWrap.setAttribute('aria-hidden', 'true');

    const honeypotLabel = document.createElement('label');
    honeypotLabel.textContent = 'Company';

    const honeypotInput = document.createElement('input');
    honeypotInput.type = 'text';
    honeypotInput.name = honeypotFieldName;
    honeypotInput.tabIndex = -1;
    honeypotInput.autocomplete = 'off';

    honeypotLabel.appendChild(honeypotInput);
    honeypotWrap.appendChild(honeypotLabel);
    form.appendChild(honeypotWrap);
  }
}

function readAntiSpamState(form) {
  const startedField = form.querySelector(`input[name="${startedAtFieldName}"]`);
  const honeypotField = form.querySelector(`input[name="${honeypotFieldName}"]`);
  const startedAt = startedField ? Number(startedField.value || 0) : 0;

  return {
    startedAt,
    elapsedMs: startedAt ? Date.now() - startedAt : 0,
    honeypotFilled: Boolean(honeypotField && honeypotField.value.trim())
  };
}

function collectFormFields(form) {
  const fields = [];
  const processedGroups = new Set();
  const controls = Array.from(form.querySelectorAll('input, select, textarea'))
    .filter((control) => !control.disabled && !['submit', 'button', 'hidden', 'file'].includes(control.type));

  controls.forEach((control) => {
    const type = (control.type || '').toLowerCase();

    if (type === 'checkbox' || type === 'radio') {
      const groupLabel = deriveFieldLabel(control);
      const groupKey = `${groupLabel}::${control.name || groupLabel}::${type}`;
      if (processedGroups.has(groupKey)) {
        return;
      }

      processedGroups.add(groupKey);
      const scope = control.closest('.form-group') || form;
      const selectedLabels = Array.from(scope.querySelectorAll(`input[type="${type}"]`))
        .filter((input) => deriveFieldLabel(input) === groupLabel && input.checked)
        .map((input) => deriveChoiceLabel(input))
        .filter(Boolean);

      if (selectedLabels.length) {
        fields.push({
          label: groupLabel,
          value: type === 'radio' ? selectedLabels[0] : selectedLabels.join(', ')
        });
      }

      return;
    }

    let value = '';
    if (control.tagName === 'SELECT') {
      if (!control.value) {
        return;
      }
      const selectedOption = control.options[control.selectedIndex];
      value = selectedOption ? selectedOption.textContent.trim() : '';
    } else {
      value = control.value.trim();
    }

    if (!value) {
      return;
    }

    fields.push({
      label: deriveFieldLabel(control),
      value
    });
  });

  return fields;
}

function deriveFieldLabel(control) {
  if (control.dataset.sheetLabel) {
    return control.dataset.sheetLabel;
  }

  const formGroup = control.closest('.form-group');
  if (formGroup) {
    const formLabel = formGroup.querySelector('.form-label');
    if (formLabel) {
      return cleanLabelText(formLabel.textContent);
    }
  }

  const referenceStack = control.closest('.flex.flex-col.gap-3');
  if (referenceStack) {
    const referenceBlock = referenceStack.parentElement;
    const heading = referenceBlock ? referenceBlock.querySelector('p') : null;
    const placeholder = control.getAttribute('placeholder');
    if (heading && placeholder) {
      return `${cleanLabelText(heading.textContent)} - ${placeholder}`;
    }
  }

  const placeholder = control.getAttribute('placeholder');
  if (placeholder) {
    return placeholder;
  }

  const checkLabel = control.closest('.check-label');
  if (checkLabel) {
    return cleanLabelText(checkLabel.textContent);
  }

  return control.name || control.id || 'Field';
}

function deriveChoiceLabel(control) {
  const wrapper = control.closest('.check-label');
  return wrapper ? wrapper.textContent.replace(/\s+/g, ' ').trim() : control.value;
}

function cleanLabelText(text) {
  return text
    .replace(/\*/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readFormFile(form) {
  const fileInput = form.querySelector('input[type="file"]');
  if (!fileInput || !fileInput.files.length) {
    return null;
  }

  const [file] = fileInput.files;
  const base64 = await readFileAsBase64(file);

  return {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    base64
  };
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Unable to read the selected file.'));
    };

    reader.readAsDataURL(file);
  });
}

function revealManagedFormSuccess(form, formId) {
  const successElement = document.getElementById(`${formId}-success`);
  if (!successElement) {
    showFormFeedback(form, successMessages[formId] || 'Submitted successfully.', 'success');
    form.reset();
    return;
  }

  form.classList.add('hidden');
  successElement.classList.add('visible');
  successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setSubmittingState(form, isSubmitting) {
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) {
    return;
  }

  if (!submitButton.dataset.originalText) {
    submitButton.dataset.originalText = submitButton.innerHTML;
  }

  submitButton.disabled = isSubmitting;
  submitButton.classList.toggle('is-submitting', isSubmitting);
  submitButton.innerHTML = isSubmitting ? 'Sending...' : submitButton.dataset.originalText;
}

function showFormFeedback(form, message, type) {
  const feedback = getOrCreateFeedbackElement(form);
  feedback.textContent = message;
  feedback.className = `form-feedback ${type}`;
}

function clearFormFeedback(form) {
  const feedback = form.querySelector('[data-form-feedback]');
  if (feedback) {
    feedback.textContent = '';
    feedback.className = 'form-feedback';
  }
}

function getOrCreateFeedbackElement(form) {
  let feedback = form.querySelector('[data-form-feedback]');
  if (feedback) {
    return feedback;
  }

  feedback = document.createElement('p');
  feedback.className = 'form-feedback';
  feedback.setAttribute('data-form-feedback', 'true');
  form.appendChild(feedback);
  return feedback;
}

function initFileUploads() {
  document.querySelectorAll('.file-upload-area').forEach((area) => {
    const input = area.querySelector('input[type="file"]');

    ['dragenter', 'dragover'].forEach((eventName) => {
      area.addEventListener(eventName, (event) => {
        event.preventDefault();
        area.style.borderColor = '#C4A410';
        area.style.background = '#FDFCE8';
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      area.addEventListener(eventName, () => {
        area.style.borderColor = '';
        area.style.background = '';
      });
    });

    area.addEventListener('drop', (event) => {
      event.preventDefault();
      if (input && event.dataTransfer.files.length) {
        input.files = event.dataTransfer.files;
        updateUploadFilename(area, input);
      }
    });

    if (input) {
      input.addEventListener('change', () => {
        updateUploadFilename(area, input);
      });
    }
  });
}

function updateUploadFilename(area, input) {
  const label = area.querySelector('.upload-filename');
  if (label && input.files.length) {
    label.textContent = input.files[0].name;
  }
}

function initFaq() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    if (!trigger || !content) {
      return;
    }

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-content').style.maxHeight = '0';
        const icon = other.querySelector('.faq-icon');
        if (icon) {
          icon.style.transform = '';
        }
      });

      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = `${content.scrollHeight}px`;
        const icon = trigger.querySelector('.faq-icon');
        if (icon) {
          icon.style.transform = 'rotate(45deg)';
        }
      }
    });
  });
}

function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  if (!localStorage.getItem('cookie-consent')) {
    setTimeout(() => banner.classList.remove('hidden'), 800);
  }

  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    banner.classList.add('hiding');
    setTimeout(() => banner.classList.add('hidden'), 400);
  });

  document.getElementById('cookie-decline')?.addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'essential');
    banner.classList.add('hiding');
    setTimeout(() => banner.classList.add('hidden'), 400);
  });
}

function initServiceNav() {
  const nav = document.querySelector('nav .no-scrollbar, .no-scrollbar');
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  const activeClasses    = ['bg-primary-500', 'text-white'];
  const inactiveClasses  = ['bg-background-50', 'border', 'border-background-200', 'text-foreground-700', 'hover:border-primary-400', 'hover:text-primary-700'];

  function setActive(link) {
    links.forEach((l) => {
      l.classList.remove(...activeClasses);
      l.classList.add(...inactiveClasses);
    });
    link.classList.remove(...inactiveClasses);
    link.classList.add(...activeClasses);
    link.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  links.forEach((link) => {
    link.addEventListener('click', () => setActive(link));
  });

  const sections = links
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = links.find((l) => l.getAttribute('href') === `#${entry.target.id}`);
          if (match) setActive(match);
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
