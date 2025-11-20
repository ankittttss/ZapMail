import { ImapFlow } from "imapflow";
import { ParsedEmail, parseMail } from "../services/emailParser";
import { createElasticClient } from '../config/elasticSearc';
import { indexEmailsToElastic } from "../config/elasticSearc";
import crypto from 'crypto'

const elasticClient = createElasticClient();
const indexName = 'search-w9v0-myemails';

interface EmailAccount {
  user: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
}

// I know we have to use this in ENV File but just to be fast and complete the Assignment I am directly using it here.
const emailAccounts: EmailAccount[] = [
  {
    user: "ankitsaini955831@gmail.com",
    password: "beqowjjbarfdatao",
    host: "imap.gmail.com",
    port: 993,
    secure: true
  },
  {
    user: "anmolsainiii23@gmail.com",
    password: "iuenomqneoobkcpf",
    host: "imap.gmail.com",
    port: 993,
    secure: true
  }
];

// Store connected clients
export const clients: { account: string; client: ImapFlow }[] = [];

// -------------------------------------------------------
// CONNECT TO IMAP & OPEN INBOX
// -------------------------------------------------------
async function connectToAccount(account: EmailAccount): Promise<ImapFlow> {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: {
      user: account.user,
      pass: account.password,
    },
    logger: false
  });

  await client.connect();
  clients.push({ account: account.user, client });
  return client;
}

// -------------------------------------------------------
// FETCH LAST 30 DAYS EMAILS ON STARTUP
// -------------------------------------------------------

// -------------------------------------------------------
// FETCH LAST 30 DAYS EMAILS (HISTORY SYNC)
// -------------------------------------------------------
export async function fetchLast30Days(client: ImapFlow, account: any): Promise<ParsedEmail[]> {
  
  const emails: ParsedEmail[] = [];

  try {
    await client.mailboxOpen("INBOX");

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const messages = (await client.search({ since })) || [];

    for await (const msg of client.fetch(messages, { source: true })) {
      try {
        const parsed = await parseMail(msg.source as Buffer);
        emails.push(parsed);
      } catch (err) {
        console.error(`[HISTORY][${account.user}] Failed to parse email`, err);
      }
    }

    if (emails.length > 0) {
      const bulkOps: any[] = [];

      for (const email of emails) {
        try {
          const exists = await elasticClient.exists({
            index: indexName,
            id: email.id
          });

          if (exists) {
            const existingDoc = await elasticClient.get({
              index: indexName,
              id: email.id
            });

            const existingCategory = (existingDoc._source as any)?.category;

            if (existingCategory && existingCategory !== "New") {
              email.category = existingCategory;
            }

            // Update the document
            bulkOps.push(
              { update: { _index: indexName, _id: email.id }},
              { doc: email }
            );

          } else {
            // New email → insert fresh
            bulkOps.push(
              { index: { _index: indexName, _id: email.id }},
              email
            );
          }

        } catch (err) {
          console.error(`[HISTORY][${account.user}] Failed checking email → indexing anyway`, err);
          bulkOps.push(
            { index: { _index: indexName, _id: email.id }},
            email
          );
        }
      }

      if (bulkOps.length > 0) {
        await elasticClient.bulk({ operations: bulkOps, refresh: true });
      }
    }

  } catch (err) {
    console.error(`[HISTORY][${account.user}] Failed to fetch last 30 days emails:`, err);
  }

  return emails;
}



// -------------------------------------------------------
// REAL-TIME EMAIL LISTENER (IDLE MODE)
// -------------------------------------------------------
export function listenForRealtimeEmails(client: ImapFlow, account: any) {

  client.on("exists", async () => {
    const lock = await client.getMailboxLock("INBOX");

    try {
      const unseen = await client.search({ seen: false });
      if (unseen.length === 0) return;

      const newEmails: ParsedEmail[] = [];

      for await (const msg of client.fetch(unseen, { source: true })) {
        try {
          const parsed = await parseMail(msg.source as Buffer);
          newEmails.push(parsed);
        } catch (err) {
          console.error(`[REAL-TIME][${account.user}] Failed to parse email`, err);
        }
      }

      if (newEmails.length === 0) return;

      const bulkOps: any[] = [];

      for (const email of newEmails) {
        try {
          const exists = await elasticClient.exists({
            index: indexName,
            id: email.id
          });

          if (!exists) {
            // Email does NOT exist → index it
            bulkOps.push(
              { index: { _index: indexName, _id: email.id }},
              email
            );
          } else {
          }

        } catch (err) {
          console.error(`[REAL-TIME][${account.user}] Check failed → indexing anyway`, err);
          bulkOps.push(
            { index: { _index: indexName, _id: email.id }},
            email
          );
        }
      }

      if (bulkOps.length > 0) {
        await elasticClient.bulk({ operations: bulkOps, refresh: true });
        console.log(`[REAL-TIME][${account.user}] Indexed ${bulkOps.length / 2} new emails`);
      }

    } finally {
      lock.release();
    }
  });
}

// -------------------------------------------------------
// START SYNC FOR ALL ACCOUNTS
// -------------------------------------------------------
export const startIMAP = async () => {
   console.log("Starting IMAP Service...");
  for (const account of emailAccounts) {
    try {
      const client = await connectToAccount(account);

      // Fetch last 30 days emails
      await fetchLast30Days(client, account);

      // Enable IDLE mode real-time sync
      listenForRealtimeEmails(client, account);

    } catch (err) {
      console.error(`[FAILED TO CONNECT] ${account.user}`, err);
    }
  }
};
