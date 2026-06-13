# Google Sheets Intake Setup

This site can send website form submissions into Google Sheets through a Google Apps Script web app.

## What gets sent

- Newsletter signup
- Contact form
- Care request form
- Join our team form
- Resume upload from the job application form

Each submission is written into its own sheet tab with a JSON copy of the full form payload.

## 1. Create the spreadsheet

1. Create a new Google Sheet.
2. Copy the spreadsheet ID from the URL.

Example:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

## 2. Create the Apps Script project

1. Open [script.new](https://script.new).
2. Replace the default files with:
   - `google-apps-script/Code.gs`
   - `google-apps-script/appsscript.json`
3. Open `Project Settings` -> `Script properties`.
4. Add:
   - `SPREADSHEET_ID` = your Google Sheet ID
   - `RESUME_FOLDER_ID` = optional Google Drive folder ID for uploaded resumes

If `RESUME_FOLDER_ID` is omitted, uploaded resumes are stored in the Drive root of the Google account running the script.

## 3. Deploy the web app

1. Click `Deploy` -> `New deployment`.
2. Choose `Web app`.
3. Set:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
4. Deploy and authorize access.
5. Copy the web app URL.

## 4. Add the endpoint to the site

Open [assets/js/forms-config.js](/Users/Ox/Desktop/Projects/kindness%20home%20care/assets/js/forms-config.js:1) and paste the URL:

```js
window.KINDNESS_FORMS_CONFIG = {
  googleSheetsEndpoint: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

## 5. Publish through your normal branch flow

1. Local `development`
2. Push to GitHub `development`
3. Promote GitHub `development` to GitHub `testing`
4. QA on the live testing site
5. Promote GitHub `testing` to GitHub `main`

## Notes

- The site sends data directly from the browser to Apps Script.
- Because this is a static site, no secret key is stored in the frontend.
- Resume uploads are sent as base64 and saved into Google Drive by Apps Script.
- If you expect protected health information, confirm your Google Workspace compliance requirements before using Sheets for sensitive medical details.
