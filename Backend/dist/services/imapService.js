"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIMAPSync = startIMAPSync;
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
const dotenv_1 = __importDefault(require("dotenv"));
const indexEmail_1 = require("../../src/indexEmail");
const emailCategorizer_1 = require("../utils/emailCategorizer");
dotenv_1.default.config();
const imapAccounts = [
    {
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER1,
            pass: process.env.EMAIL_PASS1,
        },
    },
    {
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER2,
            pass: process.env.EMAIL_PASS2,
        },
    },
];
async function startIdle(client, accountUser) {
    while (true) {
        try {
            await client.idle();
            const lock = await client.getMailboxLock('INBOX');
            try {
                const latest = await client.fetchOne('*', { uid: true, envelope: true, source: true });
                if (latest) {
                    const parsed = await (0, mailparser_1.simpleParser)(latest.source);
                    console.log(`🆕 [${accountUser}] ${parsed.subject}`);
                    const subject = parsed.subject || '';
                    const body = parsed.text || '';
                    const category = await (0, emailCategorizer_1.categorizeEmail)(subject, body);
                    await (0, indexEmail_1.indexEmail)(accountUser, parsed, category);
                }
            }
            finally {
                lock.release();
            }
        }
        catch (err) {
            console.error(`Error in IDLE for ${accountUser}:`, err);
        }
    }
}
async function startIMAPSync() {
    for (const account of imapAccounts) {
        const client = new imapflow_1.ImapFlow(account);
        client.on('error', (err) => {
            console.error(`IMAP Error (${account.auth.user}):`, err);
        });
        await client.connect();
        await client.mailboxOpen('INBOX');
        console.log(`Connected to ${account.auth.user}, fetching emails...`);
        const since = new Date();
        since.setDate(since.getDate() - 30);
        for await (const msg of client.fetch({ since }, { uid: true, envelope: true, source: true })) {
            const parsed = await (0, mailparser_1.simpleParser)(msg.source);
            const subject = parsed.subject || '';
            const body = parsed.text || '';
            const category = await (0, emailCategorizer_1.categorizeEmail)(subject, body);
            await (0, indexEmail_1.indexEmail)(account.auth.user, parsed, category);
        }
        startIdle(client, account.auth.user);
    }
}
