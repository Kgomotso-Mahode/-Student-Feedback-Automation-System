# Student Feedback Automation System

An automated student feedback collection and processing system built with React and n8n. Students submit feedback through a web form, and the system automatically stores responses in Google Sheets and sends conditional email replies based on the rating.

## Project Scenario

A training company wants to automate the way they collect and manage student feedback. This system provides:
- A front-end feedback form (React)
- An n8n workflow that processes submissions
- Automated email notifications based on feedback ratings

## n8n Workflow

```
                           ┌──────────────────────┐
                           │   Receive Feedback    │
                           │   (POST /webhook/     │
                           │    feedback)           │
                           └──────────┬───────────┘
                                      │
                           ┌──────────▼───────────┐
                           │     Validate Data     │
                           │  (Check all fields    │
                           │   are present)        │
                           └──┬────────────────┬──┘
                    (valid)   │                │  (invalid)
                              │                │
                 ┌────────────▼──┐     ┌───────▼──────────┐
                 │ Set Server    │     │ Invalid - 400     │
                 │ Data          │     │ Response           │
                 │ (timestamp +  │     │ { success: false } │
                 │  status tag)  │     └───────────────────┘
                 └────────┬──────┘
                          │
              ┌───────────▼───────────┐
              │  Store in Google      │
              │  Sheets               │
              │  (Append feedback     │
              │   row to spreadsheet) │
              └───────────┬───────────┘
                          │
              ┌───────────▼───────────┐
              │    Rating <= 2?       │
              │  (Conditional check)  │
              └───┬───────────────┬───┘
           (Yes)  │               │  (No)
                  │               │
     ┌────────────▼──┐   ┌───────▼────────────┐
     │ Email -       │   │ Email -             │
     │ Needs         │   │ Positive            │
     │ Attention     │   │ Response            │
     │ (Concern      │   │ (Thank-you          │
     │  response)    │   │  email)             │
     └───────┬───────┘   └───────┬─────────────┘
             │                   │
             └───────┬───────────┘
                     │
          ┌──────────▼──────────┐
          │  Success - 200      │
          │  Response            │
          │ { success: true }    │
          └─────────────────────┘
```

### Workflow Nodes

| # | Node | Type | Description |
|---|------|------|-------------|
| 1 | Receive Feedback | Webhook | POST endpoint at `/webhook/feedback` that receives student data |
| 2 | Validate Data | If | Checks all 5 required fields are present and valid |
| 3 | Invalid - 400 Response | Respond to Webhook | Returns error JSON with HTTP 400 for bad submissions |
| 4 | Set Server Data | Set | Generates server-side `submittedAt` timestamp and `status` tag |
| 5 | Store in Google Sheets | Google Sheets | Appends feedback row with all fields + timestamp + status |
| 6 | Rating <= 2? | If | Branches email response based on rating value |
| 7 | Email - Needs Attention | SMTP Email | Sends empathetic response for low ratings (1-2) |
| 8 | Email - Positive Response | SMTP Email | Sends thank-you email for high ratings (3-5) |
| 9 | Success - 200 Response | Respond to Webhook | Returns success JSON with HTTP 200 |

### Conditional Logic

| Rating | Status Tag | Email Sent |
|--------|-----------|------------|
| 1-2 | Needs Attention | Concern response - team will follow up |
| 3-5 | Positive | Thank-you message celebrating feedback |

## Front-End Application

### Required Fields
- Student Name (text)
- Email Address (email, regex validated)
- Course Name (text)
- Rating (1-5 star selector)
- Feedback Message (textarea, min 10 characters)
- Submit Button (with loading state)

### Features
- Clean glassmorphism dark-theme design
- Responsive layout (desktop + mobile)
- Client-side validation with per-field error messages
- Fetch API submission to n8n webhook
- Success and error status banners

## Prerequisites

- Node.js 18+
- n8n (`npm install -g n8n`)
- Google Cloud project with Sheets API enabled
- SMTP server credentials (Gmail, SendGrid, etc.)

## Setup

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies webhook requests to n8n.

### 2. n8n Backend

```bash
n8n start
```

n8n runs on `http://localhost:5678`.

### 3. Import Workflow

1. Open n8n at `http://localhost:5678`
2. Go to **Workflows > Import from File**
3. Select `n8n-workflow.json` from the project root

### 4. Configure Credentials

In n8n, create two credentials:

**Google Sheets OAuth2:**
1. Create a Google Cloud project with Sheets API enabled
2. Create OAuth2 credentials
3. In n8n, go to **Credentials > New > Google Sheets OAuth2**
4. Enter your Client ID and Secret
5. Update the **Store in Google Sheets** node with the new credential

**SMTP:**
1. In n8n, go to **Credentials > New > SMTP**
2. Enter your SMTP server details (host, port, user, password)
3. Update both email nodes with the new credential

### 5. Google Sheet

Create a Google Sheet with these columns in Row 1:

| Student Name | Email | Course Name | Rating | Feedback Message | Submitted At | Status |
|---|---|---|---|---|---|---|

Use the Document ID in the workflow's **Store in Google Sheets** node.

## Environment Variables

Create `frontend/.env`:

```
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/feedback
```

## Project Structure

```
├── frontend/                      # React frontend
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Dependencies (React 18, Vite 6)
│   ├── vite.config.js             # Vite config with n8n proxy
│   ├── .env.example               # Environment template
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Root component
│       ├── App.css                # Glassmorphism card styles
│       ├── index.css              # Global dark gradient theme
│       └── components/
│           ├── FeedbackForm.jsx   # Main form with validation
│           ├── FeedbackForm.css   # Form styles + responsive
│           ├── StarRating.jsx     # Interactive 1-5 star rating
│           └── StarRating.css     # Star hover/active styles
├── n8n-workflow.json              # n8n workflow (import into n8n)
├── package.json                   # Root scripts (dev, build, n8n)
├── .gitignore
└── README.md
```

## License

MIT
