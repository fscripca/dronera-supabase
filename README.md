dronera-new

## Email System

The platform includes an email system for sending support messages and notifications. It can be configured to use either Supabase Edge Functions or a local API server.

### Components

- **Edge Function**: `send-email` - HTTP endpoint that handles sending emails via SMTP
- **Local API Server**: `server.js` - Local Express server that handles sending emails via SMTP
- **Client Service**: `emailService` - Frontend service that interfaces with the Edge Function
- **UI Integration**: Support form in HelpSupportPage uses the email service

### Configuration

To set up the email system with Supabase Edge Functions, add the following environment variables to your Supabase project:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@dronera.com
SUPPORT_EMAIL=support@dronera.com
```

To use the local API server instead, add these variables to your `.env` file and run:

```bash
# Start both the Vite dev server and the email API server
npm run dev:all

# Or start just the email API server
npm run server
```

### Usage

```typescript
import { emailService } from '../lib/emailService';

// Send a support email
await emailService.sendSupportEmail(
  'User Name',
  'user@example.com',
  'Subject Line',
  'Message content'
);

// Send a notification to a specific user
await emailService.sendNotification(
  'recipient@example.com',
  'Notification Subject',
  'Notification message'
);
```