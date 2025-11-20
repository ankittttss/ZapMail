"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
dotenv_1.default.config();
const client = new elasticsearch_1.Client({
    cloud: {
        id: process.env.ELASTIC_CLOUD_ID,
    },
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASS,
    },
});
router.get('/emails', async (req, res) => {
    try {
        const { hits } = await client.search({
            index: 'emails',
            query: {
                match_all: {},
            },
            size: 50,
            _source: ['from', 'subject', 'date', 'text', 'category']
        });
        const emails = hits.hits.map((hit) => ({
            id: hit._id,
            ...hit._source,
            category: hit._source.category
        }));
        res.json(emails);
    }
    catch (error) {
        console.error('Error fetching emails from Elasticsearch:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_SUMMARY_MODEL_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
router.post('/emails/suggest-reply', async (req, res) => {
    const { subject, text } = req.body;
    try {
        const prompt = `Subject: ${subject}\n\nEmail: ${text}`;
        const response = await axios_1.default.post(HUGGINGFACE_SUMMARY_MODEL_URL, {
            inputs: prompt,
        }, {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        const summary = response.data?.[0]?.summary_text || 'Thank you for your email. I will get back to you soon.';
        res.json({ reply: summary });
    }
    catch (error) {
        console.error('AI reply generation failed:', error);
        res.status(500).json({ error: 'Failed to generate AI reply' });
    }
});
exports.default = router;
