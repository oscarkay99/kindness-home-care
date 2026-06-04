/* =============================================
   Kindness Home Care – Shared JavaScript
   ============================================= */

const formsConfig = window.KINDNESS_FORMS_CONFIG || {};
const googleSheetsEndpoint = formsConfig.googleSheetsEndpoint || '';

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
  initNewsletterForms();
  initApplyTabs();
  initManagedForms();
  initFileUploads();
  initFaq();
  initSmoothScroll();
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

  await fetch(googleSheetsEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: requestBody.toString()
  });
}

async function buildSubmissionPayload(form, formId) {
  return {
    formId,
    formTitle: formTitles[formId] || 'Website Submission',
    sourcePage: window.location.pathname.split('/').pop() || 'index.html',
    pageUrl: window.location.href,
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    fields: collectFormFields(form),
    fileUpload: await readFormFile(form)
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
  return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
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
