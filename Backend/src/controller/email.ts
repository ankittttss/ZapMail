import { Request, Response } from "express";
import {GoogleGenAI} from '@google/genai';
import { createElasticClient } from '../config/elasticSearc';
import { sendSlackNotification } from "../config/slackConfig";
import categorizeEmail from "../config/emailcategorizer";
import dotenv from 'dotenv'
import { getSuggestedReply } from "../config/pinecone";

const elasticClient = createElasticClient();
const indexName = 'search-w9v0-myemails';

dotenv.config();

const GEMINI_API_URL =  process.env.GEMINI_URL;
const GEMINI_API_KEY =  process.env.GEMINI_KEY;
console.log("Using Gemini API Key:", GEMINI_API_KEY ? "Provided" : "Not Provided");
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const LABELS = ["Interested", "Meeting Booked", "Not Interested", "Out of Office","Spam"];



interface EmailPayload {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  category: string;
  body?: string;
}

// Without Pagination
export const getAll = async (req: Request, res: Response) => {
  try {
    const exists = await elasticClient.indices.exists({ index: indexName });
    if (!exists) {
      res.status(404).json({ success: false, message: "Index not found" });
      return;
    }

    let allEmails: any[] = [];

    let response = await elasticClient.search({
      index: indexName,
      scroll: "1m",
      size: 5000,
      query: { match_all: {} },
      sort: [{ date: { order: "desc" } }],
    });

    while (true) {
      const hits = response.hits.hits;
      if (hits.length === 0) break;

      allEmails.push(
        ...hits.map(hit => ({
          id: hit._id,
          ...(hit._source as any),
        }))
      );

      response = await elasticClient.scroll({
        scroll_id: response._scroll_id,
        scroll: "1m",
      });
    }

    console.log("Total Emails Fetched:", allEmails.length);

    res.status(200).json({
      success: true,
      total: allEmails.length,
      data: allEmails,
    });
    return;

  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ success: false, message: "Failed to fetch emails" });
    return;
  }
};



// Get All Emails with Pagination
export const getAllEmails = async (req: Request, res: Response) => {
  try {
    // Get pagination params from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Calculate offset
    const from = (page - 1) * limit;

    const exists = await elasticClient.indices.exists({ index: indexName });
    if (!exists) {
       res.status(404).json({ success: false, message: 'Index not found' });
       return;
    }

    const result = await elasticClient.search({
      index: indexName,
      from: from,        // Start from this position
      size: limit,       // Number of results per page
      query: { match_all: {} },
      sort: [{ date: { order: "desc" } }]
    });

    const emails = result.hits.hits.map(hit => ({
      id: hit._id,
      ...(hit._source as any)
    }));

    // Get total count
    const total = typeof result.hits.total === 'number' 
      ? result.hits.total 
      : result.hits.total?.value || 0;

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
   
    return;
  } catch (err) {
    console.error('Error fetching emails from Elasticsearch:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch emails' });
  }
};


// Get Emails from Last 30 Days
export const getLast30DaysEmails = async (req: Request, res: Response) => {
  try {
    // Calculate date 30 days ago
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceISO = since.toISOString();

    // Search Elasticsearch for emails with date >= sinceISO
    const result = await elasticClient.search({
      index: indexName,
      size: 1000, // adjust size or implement pagination
      query: {
        range: {
          date: {
            gte: sinceISO
          }
        }
      }
    });

    // Extract the _source from hits
    const emails = result.hits.hits.map(hit => hit._source);

    res.status(200).json({
      success: true,
      count: emails.length,
      emails
    });

    return;
    
  } catch (err) {
    console.error('Error fetching emails from Elasticsearch:', err);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch emails'
    });
    return;
  }
};

// Categorize Multiple Emails
export const categoriseEmails = async (req: Request, res: Response) => {
  try {
    const { emails } = req.body;

    // Validate input
    if (!emails || !Array.isArray(emails)) {
      res.status(400).json({ error: 'Missing or invalid emails array' });
      return; 
    }

    const results: { subject: string; label: string }[] = [];

    for (const email of emails) {
      const prompt = `Categorize this email into one of the following labels: ${LABELS.join(
        ', '
      )}.\n\nSubject: ${email.subject}${email.body ? `\nBody: ${email.body}` : ''}\nAnswer with only the label.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const rawText = response.text || '';
      const predictedLabel =
        LABELS.find(label => rawText.toLowerCase().includes(label.toLowerCase())) || 'Uncategorized';

      results.push({ subject: email.subject, label: predictedLabel });
    }
  
    res.json({ results });
  } catch (error: any) {
    console.error('❌ Categorization failed:', error.message);
    res.status(500).json({ error: 'Failed to categorize emails' });
  }
};


// Test to see the Slack Notification
export const testSlackNotification = async (req: Request, res: Response) => {
  try {
    const sampleEmail = req.body;

    if (!sampleEmail || !sampleEmail.from || !sampleEmail.subject) {
      res.status(400).json({
        success: false,
        message: 'Provide at least "from" and "subject" in JSON body'
      });
      return;
    }

    await sendSlackNotification(sampleEmail);

    console.log('Slack notification sent:', sampleEmail.subject);

    res.status(200).json({
      success: true,
      message: 'Slack notification triggered',
      data: sampleEmail
    });

    return;

  } catch (err) {
    console.error('Failed to send Slack notification:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send Slack notification'
    });
    return;
  }
};



export const categoriseEmailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Received ID for categorization:', id);

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Missing or invalid id' });
      return; 
    }

    // Fetch the single email document by ID
    const { _source } = await elasticClient.get<EmailPayload>({
      index: indexName,
      id,
    });

    if (!_source) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    const email: EmailPayload = {
      id,
      subject: _source.subject || '',
      from: _source.from || '',
      to: _source.to || '',
      date: _source.date || '',
      category: _source.category || 'Uncategorized',
      body: _source.body || '',
    };

    // Categorize using AI
    const prompt = `Categorize this email into one of the following labels Most based on body and Subject of Email: ${LABELS.join(
      ', '
    )}.\n\nSubject: ${email.subject}${email.body ? `\nBody: ${email.body}` : ''}\nAnswer with only the label.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    const predictedLabel =
      LABELS.find(label => rawText.toLowerCase().includes(label.toLowerCase())) || 'Uncategorized';

    await elasticClient.update({
      index: indexName,
      id,
      doc: { category: predictedLabel },
    });

    console.log(`Email ID: ${id} categorized as: ${predictedLabel}`);

    if(predictedLabel == "Interested") sendSlackNotification(email);

    // Return updated email
    res.status(200).json({
      success: true,
      email: { ...email, category:predictedLabel },
    });
  } catch (error: any) {
    console.error('Categorization by ID failed:', error.message);
    res.status(500).json({ error: 'Failed to categorize email by ID' });
  }
};



export const getEmailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    console.log('Fetching email with ID:', id);

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Missing or invalid id' });
      return;
    }

    // Fetch the email document by ID from Elasticsearch
    const { _source } = await elasticClient.get<EmailPayload>({
      index: indexName,
      id,
    });

    if (!_source) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    const email: EmailPayload = {
      id,
      subject: _source.subject || '',
      from: _source.from || '',
      to: _source.to || '',
      date: _source.date || '',
      category: _source.category || 'Uncategorized',
      body: _source.body || '',
    };

    getSuggestedReply(email);

    res.status(200).json({
      success: true,
      email,
    });
  } catch (error: any) {
    console.error('Failed to fetch email:', error.message);
    res.status(500).json({ error: 'Failed to fetch email by ID' });
  }
};


export const categoriseEmailsByTo = async (req: Request, res: Response) => {
  try {
    const { to } = req.query;

    if (!to || typeof to !== "string") {
     res.status(400).json({ error: "Missing or invalid 'to' value" });
     return;
    }

    console.log("Fetching emails for:", to);

    // Elasticsearch search query
    const { hits } = await elasticClient.search({
      index: indexName,
      size: 1000, // increase if you expect more emails
      query: {
        term: {
          "to.keyword": to, // exact match on 'to' field
        },
      },
    });

    const emails = hits.hits.map((hit: any) => ({
      id: hit._id,
      subject: hit._source.subject || "",
      from: hit._source.from || "",
      to: hit._source.to || "",
      date: hit._source.date || "",
      category: hit._source.category || "Uncategorized",
      body: hit._source.body || "",
    }));

    res.status(200).json({ success: true, emails });
    return;
  } catch (error: any) {
    console.error("Fetching emails by 'to' failed:", error.message);
    res.status(500).json({ error: "Failed to fetch emails by 'to'" });
    return;
  }
};


export const searchEmails = async (req: Request, res: Response) => {
  try {
    const { from, to, category, subject } = req.query;

    const must: any[] = [];

    if (from && typeof from === "string") {
      must.push({ term: { "from.keyword": from } });
    }

    if (to && typeof to === "string") {
      must.push({ term: { "to.keyword": to } });
    }

    if (category && typeof category === "string") {
      must.push({ term: { "category.keyword": category } });

    }

    if (subject && typeof subject === "string") {
      must.push({ match: { subject } });
    }

    const query = must.length > 0 ? { bool: { must } } : { match_all: {} };

    const { hits } = await elasticClient.search({
      index: indexName,
      size: 1000,
      query,
    });

    const emails = hits.hits.map((hit: any) => ({
      id: hit._id,
      subject: hit._source.subject || "",
      from: hit._source.from || "",
      to: hit._source.to || "",
      date: hit._source.date || "",
      category: hit._source.category || "Uncategorized",
      body: hit._source.body || "",
    }));

    console.log("Search Emails Result:", emails);
     res.status(200).json({ success: true, emails });
     return;
  } catch (error: any) {
    console.error("Search emails failed:", error.message);
    res.status(500).json({ error: "Failed to search emails" });
    return;
  }
};

export const getSuggestedReplies = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;
    console.log("Received ID for categorization:", id);

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Missing or invalid id" });
      return;
    }

    const { _source } = await elasticClient.get<EmailPayload>({
      index: indexName,
      id,
    });

    if (!_source) {
      res.status(404).json({ error: "Email not found" });
      return;
    }
    
     const email: EmailPayload = {
      id,
      subject: _source.subject || "",
      from: _source.from || "",
      to: _source.to || "",
      date: _source.date || "",
      category: _source.category || "Uncategorized",
      body: _source.body || "",
    };

    const result = await getSuggestedReply(email);

    res.status(200).json({ success: true, data: result });
    return;
  } catch (error: any) {
    console.error("Failed to get suggested replies:", error.message);
    res.status(500).json({ error: "Failed to get suggested replies" });
    return;
  }
};

