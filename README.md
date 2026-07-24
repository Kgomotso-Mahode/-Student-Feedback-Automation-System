# Student Feedback Automation System

An automated student feedback collection and processing system built with React and n8n. Students submit feedback through a web form, and the system automatically stores responses in Google Sheets and sends conditional email replies based on the rating.


<img width="456" height="621" alt="Screenshot 2026-07-24 141717" src="https://github.com/user-attachments/assets/8b73abc0-f5dd-4905-bc0d-8dc2d04dca30" />


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
- Clean black and white minimalist design
- Responsive layout (desktop + mobile)
- Client-side validation with per-field error messages
- Fetch API submission to n8n webhook
- Success and error status banners

## Prerequisites

- Node.js 18+
- n8n (`npm install -g n8n`)
- Google Cloud project with Sheets API enabled
- SMTP server credentials (Gmail, SendGrid, etc.)

## How to Run

You need **two terminals** running at the same time - one for the n8n backend, one for the React frontend.

### Terminal 1: Start n8n Backend

```bash
# Install n8n globally (only needed once)
npm install -g n8n

# Start n8n
n8n start
```

n8n runs on `http://localhost:5678`. You will see a login/setup screen on first run.

### Terminal 2: Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### Import the n8n Workflow

1. Open `http://localhost:5678` in your browser
2. Complete the n8n setup wizard if it's your first time
3. Click **Workflows** in the sidebar
4. Click **Import from File** (or press `Ctrl+O`)
5. Select `n8n-workflow.json` from the project root
6. Click **Activate** to enable the workflow

### Configure Credentials

Before the workflow can store data and send emails, you need to set up credentials in n8n.

**Google Sheets OAuth2:**
1. Create a Google Cloud project with Sheets API enabled
2. Create OAuth2 credentials in Google Cloud Console
3. In n8n, go to **Credentials > New > Google Sheets OAuth2**
4. Enter your Client ID and Client Secret
5. Open the **Store in Google Sheets** node and select your new credential

**SMTP (Email):**
1. In n8n, go to **Credentials > New > SMTP**
2. Enter your SMTP details:
   - Host: `smtp.gmail.com` (for Gmail)
   - Port: `465`
   - User: your email
   - Password: your app password
3. Open both email nodes and select your SMTP credential

### Test It

1. Make sure both n8n and the frontend are running
2. Open `http://localhost:5173` in your browser
3. Fill in the form and submit
4. Check your Google Sheet for the new row
5. Check email for the automated response

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
│       ├── App.css                # Card styles
│       ├── index.css              # Global styles
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
