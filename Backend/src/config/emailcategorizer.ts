//Reusable Function that categorizes emails using Google Gemini API
// Note -: I will use environment variables to store sensitive information like API keys. But as it's an Assignment I will directly use them here.
// Axios -: for making HTTP requests

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Categorizes a single email using Google Gemini
 * @param subject - Email subject
 * @param body - Email body
 * @param candidateLabels - List of possible labels
 * @returns The most likely label
 */

const labels = [
  "Interested",
  "Meeting Booked",
  "Not Interested",
  "Spam",
  "Out of Office",
];

export async function categorizeEmail(
  subject: string,
  body: string,
  candidateLabels: string[]
): Promise<string> {
  try {
    const prompt = `
You are an email classifier. Categorize the following email into one of these labels: ${candidateLabels.join(
      ", "
    )}.
    
Email Subject: ${subject}
Email Body: ${body}

Return only the label.
`;

    console.log(prompt);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GOOGLE_API_KEY,
        },
      }
    );

    // Extract Gemini's output
    console.log(response, "Resonse");

    const outputText =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") ?? "";

    // Find matching label (case-insensitive)
    const matchedLabel = candidateLabels.find((label) =>
      outputText.toLowerCase().includes(label.toLowerCase())
    );

    const finalLabel = matchedLabel || "Uncategorized";

    return finalLabel;
  } catch (error) {
    return "Uncategorized";
  }
}

export default categorizeEmail;
