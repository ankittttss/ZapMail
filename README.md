# ZapMail - Backend

An intelligent email management system that syncs, categorizes, and analyzes emails using IMAP, Elasticsearch, and AI-powered suggestions.

## Features

- **IMAP Email Sync**: Real-time email synchronization using `imap-flow`
- **Elasticsearch Integration**: Fast and efficient email search and storage using Docker-based Elasticsearch
- **AI-Powered Categorization**: Automatic email categorization using Gemini API
- **RAG-Based Suggested Replies**: Context-aware email reply suggestions using Weaviate vector database and Claude API (in development)
- **Slack Notifications**: Integration with Slack for important email alerts
- **Advanced Search**: Query-based email search capabilities
- **Email Filtering**: Filter emails by recipient, date range, and categories

## Tech Stack

- **Backend**: Node.js with Express & TypeScript
- **Email Protocol**: IMAP (via `imap-flow`)
- **Search Engine**: Elasticsearch (Docker)
- **Vector Database**: Weaviate (for RAG-based suggested replies)
- **AI/ML**: Google Gemini API & Claude API (in progress)
- **Notifications**: Slack API

## API Endpoints

### Email Operations

#### Get Last 30 Days Emails
```
GET /last30days
```
Returns all emails received in the last 30 days.

#### Categorize Emails
```
POST /getLabel
```
Categorizes emails based on subject and body content using AI. Returns labels for email classification.

#### Get All Emails
```
GET /all
```
Retrieves all emails from the Elasticsearch database.

#### Get Email by ID
```
GET /get?id=<email_id>
```
Fetches a specific email by its ID.

**Query Parameters:**
- `id`: Email identifier

#### Categorize Single Email
```
GET /categorise/:id
```
Categorizes a specific email by its ID.

**URL Parameters:**
- `id`: Email identifier

#### Get Emails by Recipient
```
GET /emails?to=<recipient_email>
```
Retrieves emails sent to a specific recipient.

**Query Parameters:**
- `to`: Recipient email address

#### Search Emails
```
GET /search?q=<query>
```
Searches emails based on a query string.

**Query Parameters:**
- `q`: Search query

### Notifications

#### Send Slack Notification
```
POST /sendNotification
```
Sends a test notification to Slack with custom payload.

**Request Body:**
```json
{
  "message": "Your notification message",
  "email": "email details"
}
```

## Setup & Installation

### Prerequisites

- Node.js (v16+)
- Docker & Docker Compose
- IMAP-enabled email account
- Gemini API key
- Claude API key (for suggested replies - optional)
- Slack webhook URL

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd zapmail
```

2. Install dependencies:
```bash
npm install
```

3. Start Elasticsearch and Weaviate using Docker:
```bash
docker-compose up -d
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Add your credentials:
```env
IMAP_HOST=your-imap-host
IMAP_PORT=993
IMAP_USER=your-email@example.com
IMAP_PASSWORD=your-password

ELASTICSEARCH_URL=http://localhost:9200

WEAVIATE_URL=http://localhost:8080

GEMINI_API_KEY=your-gemini-api-key

CLAUDE_API_KEY=your-claude-api-key

SLACK_WEBHOOK_URL=your-slack-webhook-url
```

5. Start the application:
```bash
npm run dev
```

## Usage Examples

### Categorizing Emails

The system automatically categorizes emails using the Gemini API. Categories might include:
- Important
- Promotional
- Social
- Updates
- Spam

### Searching Emails

Search for emails containing specific keywords:
```bash
curl http://localhost:3000/search?q=invoice
```

### Slack Notifications

Send notifications for important emails:
```bash
curl -X POST http://localhost:3000/sendNotification \
  -H "Content-Type: application/json" \
  -d '{"message": "Important email received", "priority": "high"}'
```

## Output Snippets

### Email Categorization Response
```json
{
  "success": true,
  "email": {
    "id": "12345",
    "subject": "Q4 Report",
    "from": "boss@company.com",
    "category": "Important",
  }
}
```

### Search Results
```json
{
  "total": 15,
  "emails": [
    {
      "id": "67890",
      "subject": "Invoice #2024-001",
      "from": "billing@vendor.com",
      "date": "2024-11-15",
      "snippet": "Please find attached invoice..."
    }
  ]
}
```

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   IMAP      │─────▶│   Express    │─────▶│ Elasticsearch│
│   Server    │      │   Backend    │      │   (Docker)   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├─────▶ Gemini API (Categorization)
                            │
                            ├─────▶ Weaviate (Vector DB for RAG)
                            │             │
                            │             └─────▶ Claude API (Suggested Replies)*
                            │
                            └─────▶ Slack API (Notifications)

* In Development
```

## Development

### Project Structure
```
zapmail/
├── src/
│   ├── controller/
│   │   └── email.ts       # Email operations logic
│   ├── routes/
│   │   └── email.ts       # API routes
│   ├── services/
│   │   ├── imapservice.ts
│   │   └── emailParser.ts
|   |--- config
│   │   └── elasticSearch.ts
|   |   └── weavete.ts
|   |   └── slackConfig.ts
|   |   └── emailCategoriser.ts
|      
│   └── index.ts           # Application entry point
├── package.json
└── tsconfig.json
```

## Future Enhancements

- [x] RAG-based email reply suggestions using Weaviate and Claude API (in progress)
- [ ] Complete Claude API integration for suggested replies
- [ ] Advanced email threading
- [ ] Custom categorization rules
- [ ] Email scheduling
- [ ] Multi-account support
- [ ] Dashboard UI for analytics

# ZapMail Frontend Readme

This project is a **Next.js-based frontend** built using a **component-driven** architecture and following the **DRY (Don't Repeat Yourself)** principle for clean, reusable, and maintainable code.

## 🚀 Features Implemented

### ✓ Component-Based Architecture

* UI broken down into small, reusable components.
* Ensures maintainability and consistency across the app.

### ✓ DRY Principle

* Avoided duplicate logic by centralizing commonly used utilities and components.
* Abstracted repeated UI blocks into shared components.

### ✓ Pagination Implemented

* Efficiently fetches and displays paginated data.
* Fully dynamic and works with API queries or local state.
* Provides smooth navigation between pages.

### ✓ Debounce Functionality Working (In Progress)

* Implemented debounce for search input to avoid excessive API calls.
* Ensures optimized performance and responsive UX.
* Custom debounce hook created for reusability.

## 📁 Folder Structure

```
/ components
  / emails
     -DashBoardHeader.tsx
     -EmailCard.tsx
     -EmptyState.tsx
     -ErrorState.tsx
     -FilterPanel.tsx
     -LoadingSpinner.tsx
     -PaginationControl.tsx
/constants
  -emailConstant.ts
/emails
  -page.tsx (Home Page)
/services
  -emailService.ts
/type
  -emails.ts
/utils
  -emailUtils.ts
```

## 🛠️ Tech Stack

* **Next.js**
* **TypeScript
* **TailwindCSS** or CSS Modules

## 📦 How to Run

```bash
npm install
npm run dev
```

---

More sections can be added once you share your additional details or code.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Contact

For questions or support, please open an issue in the repository.
