"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elasticsearch_1 = require("@elastic/elasticsearch");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const client = new elasticsearch_1.Client({
    cloud: {
        id: process.env.ELASTIC_CLOUD_ID,
    },
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASS,
    },
});
router.put('/emails/:id/interest', async (req, res) => {
    const emailId = req.params.id;
    try {
        await client.update({
            index: 'emails',
            id: emailId,
            doc: {
                status: 'Interested',
            },
        });
        const emailDoc = await client.get({
            index: 'emails',
            id: emailId,
        });
        const email = emailDoc._source;
        if (!email) {
            res.status(404).json({ error: 'Email not found after update' });
            return;
        }
        if (process.env.SLACK_WEBHOOK_URL) {
            await axios_1.default.post(process.env.SLACK_WEBHOOK_URL, {
                text: `📧 New Interested Email!\n*Subject:* ${email.subject || '(No Subject)'}\n*From:* ${email.from || 'Unknown'}\n*Date:* ${email.date ? new Date(email.date).toLocaleString() : 'Unknown'}`,
            });
        }
        if (process.env.WEBHOOK_URL) {
            await axios_1.default.post(process.env.WEBHOOK_URL, {
                event: 'InterestedEmail',
                email,
            });
        }
        res.json({ message: 'Email marked as Interested and notifications sent.' });
    }
    catch (error) {
        console.error('❌ Error updating email interest status:', error);
        res.status(500).json({ error: 'Failed to update email status' });
    }
});
exports.default = router;
