"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexEmail = indexEmail;
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv_1 = __importDefault(require("dotenv"));
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
async function indexEmail(user, parsedEmail, category) {
    const emailData = {
        from: parsedEmail.from?.text || '',
        subject: parsedEmail.subject || '',
        date: parsedEmail.date || new Date().toISOString(),
        text: parsedEmail.text || '',
        html: parsedEmail.html || '',
        user,
        category: category || '',
        status: 'new',
    };
    try {
        await client.index({
            index: 'emails',
            document: emailData,
        });
        console.log(`✅ Successfully indexed email with category: ${emailData.category}`);
    }
    catch (error) {
        console.error('Error indexing email:', error);
    }
}
