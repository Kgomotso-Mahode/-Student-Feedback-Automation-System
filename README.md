# Student Feedback Automation System

An automated student feedback collection and processing system built with React and n8n. Students submit feedback through a web form, and the system automatically stores responses in Google Sheets and sends conditional email replies based on the rating.

## Architecture

```
React Frontend (Vite)          n8n Workflow
┌──────────────────┐          ┌─────────────────────────┐
│  Feedback Form    │  POST    │  Webhook (/feedback)     │
│  - Student Name   │ ──────> │  Validate Data           │
│  - Email          │         │  Set Server Data         │
│  - Course Name    │         │  Store in Google Sheets  │
│  - Star Rating    │         │  Rating <= 2?            │
│  - Message        │  JSON   │    Yes → Email (Concern) │
│                   │ <────── │    No  → Email (Thanks)  │
└──────────────────┘         │  Success Response        │
                              └─────────────────────────┘
```

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
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── App.jsx            # Root component
│   │   ├── App.css            # App styles
│   │   ├── index.css           # Global styles
│   │   └── components/
│   │       ├── FeedbackForm.jsx    # Main form with validation
│   │       ├── FeedbackForm.css    # Form styles
│   │       ├── StarRating.jsx      # Interactive star rating
│   │       └── StarRating.css      # Star rating styles
│   ├── vite.config.js         # Vite config with proxy
│   └── package.json
├── n8n-workflow.json          # n8n automation workflow
├── .gitignore
└── README.md
```

## Workflow Nodes

| Node | Description |
|------|-------------|
| Receive Feedback | Webhook endpoint receiving POST data |
| Validate Data | Checks all required fields are present |
| Set Server Data | Generates server-side timestamp and status |
| Store in Google Sheets | Appends feedback row to spreadsheet |
| Rating <= 2? | Branches based on rating value |
| Email - Needs Attention | Sends concern response for low ratings |
| Email - Positive Response | Sends thank-you for high ratings |
| Success/Invalid Response | Returns JSON response to frontend |

## License

MIT
