# ReachInbox - Onebox Email Aggregator

## Assignment - Build a Feature-Rich Onebox for Emails

### Problem Statement

ReachInbox is a highly functional email aggregator that synchronizes multiple IMAP email accounts in real-time, providing a seamless, searchable, and AI-powered experience. This project showcases the backend implementation of the email aggregator, featuring real-time synchronization, searchable storage, AI-based email categorization, and integration with Slack and webhooks.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

1. **Real-Time Email Synchronization**
   - Sync multiple IMAP accounts in real-time (minimum of 2).
   - Fetch the last 30 days of emails using persistent IMAP connections (IDLE mode).

2. **Searchable Storage using Elasticsearch**
   - Store emails in a locally hosted Elasticsearch instance (using Docker).
   - Implement indexing to make emails searchable.
   - Support filtering by folder and account.

3. **AI-Based Email Categorization**
   - Categorize emails into the following labels:
     - Interested
     - Meeting Booked
     - Not Interested
     - Spam
     - Out of Office

4. **Slack & Webhook Integration**
   - Send Slack notifications for every new Interested email.
   - Trigger webhooks for external automation when an email is marked as Interested.

## Architecture

The backend is built using Node.js and follows a modular architecture. The main components include:

- **Controllers**: Handle incoming requests and responses.
- **Services**: Contain business logic for email synchronization, categorization, and Elasticsearch interactions.
- **Models**: Define the data structure for MongoDB collections (e.g., users, IMAP accounts).
- **Routes**: Define API endpoints for user authentication, email fetching, and IMAP account management.
- **Workers**: Process background tasks such as email categorization and indexing.

The application uses Docker to run Elasticsearch and manage dependencies.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Docker
- MongoDB
- Redis

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/reachinbox-backend.git
cd reachinbox-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory and add the following variables:

MONGO_URI=mongodb://localhost:27017/reachinbox

ELASTICSEARCH_URI=http://localhost:9200

GEMINI_API_KEY=your_gemini_api_key

SLACK_WEBHOOK_URL=your_slack_webhook_url

WEBHOOK_URL=your_webhook_url


### Step 4: Start Elasticsearch with Docker

Run the following command to start Elasticsearch:
```bash
docker-compose up -d
```


### Step 5: Start the Application

Run the application in development mode:
```bash
npm run dev
```


### Step 6: Test the API

Use Postman or any API client to test the endpoints. Refer to the API Endpoints section below for details.

## API Endpoints

### Authentication

- **POST /api/users/register**: Register a new user.
- **POST /api/users/login**: Login an existing user.

### IMAP Accounts

- **POST /api/imap/:userId/imap-accounts**: Add an IMAP account.
- **POST /api/imap/connect/all/:userId**: Connect all IMAP accounts for a user.
- **POST /api/imap/connect/:userId**: Connect a specific IMAP account.
- **GET /api/imap/status/:userId**: Retrieve IMAP status.

### Email Operations

- **GET /api/email/fetch/all/:userId**: Fetch emails for all accounts.
- **GET /api/email/fetch/:userId**: Fetch emails for a specific account.
- **GET /api/email/fetch/folders/:userId**: Retrieve all folders for a specific account.

### Elasticsearch Operations

- **POST /api/es/search/:userId**: Search emails by query.
- **POST /api/es/search/date/range/:userId**: Search emails by date range.
- **POST /api/es/filter/folder/:userId**: Filter emails by folder.
- **DELETE /api/es/delete/:userId**: Delete emails from Elasticsearch.

### Queue Operations

- **DELETE /api/queue/clear**: Clear the BullMQ queue.

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing user and email data.
- **Elasticsearch**: Search engine for indexing and searching emails.
- **BullMQ**: Queue management for processing background tasks.
- **Docker**: Containerization for running Elasticsearch.
- **ioredis**: Redis client for managing queues.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


