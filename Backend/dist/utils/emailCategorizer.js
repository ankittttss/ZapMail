"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeEmail = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const candidateLabels = ['Job', 'Newsletter', 'Promotion', 'Personal', 'Spam'];
const categorizeEmail = async (subject, body) => {
    try {
        const response = await axios_1.default.post(HUGGINGFACE_API_URL, {
            inputs: `Subject: ${subject}\n\nBody: ${body}`,
            parameters: {
                candidate_labels: candidateLabels
            }
        }, {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const labels = response.data.labels;
        console.log(labels[0]);
        return labels[0];
    }
    catch (error) {
        console.error('❌ Categorization failed:', error);
        return 'Uncategorized';
    }
};
exports.categorizeEmail = categorizeEmail;
