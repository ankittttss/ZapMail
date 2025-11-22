import {GoogleGenAI} from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import {pipeline } from '@xenova/transformers';


import dotenv from 'dotenv'
dotenv.config();

// Configuration
const PINECONE_API_KEY = process.env.PINECONE_KEY;
const INDEX_NAME = 'email-replies';
const GEMINI_API_URL =  process.env.GEMINI_URL;
const GEMINI_API_KEY =  process.env.GEMINI_KEY;

// Ensure required environment variables are present so TypeScript can treat them as strings
if (!PINECONE_API_KEY) {
  throw new Error('Missing environment variable: PINECONE_KEY');
}
if (!GEMINI_API_KEY) {
  throw new Error('Missing environment variable: GEMINI_KEY');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

let embedder:any;

async function initializeEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}


async function generateEmbedding(text: any) {
  // 1. Avoid null / undefined crashes
  if (text == null) {
    text = "";
  }

  // 2. Convert ALL non-string inputs into a readable string
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }

  // 3. Final safety conversion
  text = text.toString().trim();

  const embedder = await initializeEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });

  return Array.from(output.data);
}


async function createIndex() {
  try {
    const indexes = await pc.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === INDEX_NAME);

    if (!indexExists) {
      await pc.createIndex({
        name: INDEX_NAME,
        dimension: 384, // all-MiniLM-L6-v2 dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log(`✓ Created index: ${INDEX_NAME}`);
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    return pc.index(INDEX_NAME);
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
}

async function storeTrainingData(index: any) {
  const trainingData = [
    {
      id: 'job_interview_invitation',
      scenario: 'Email received asking about availability for technical interview after resume shortlisting',
      context: 'I am applying for a job position. If the lead is interested, share the meeting booking link.',
      receivedEmail: 'Hi, Your resume has been shortlisted. When will be a good time for you to attend the technical interview?',
      suggestedReply: "Thank you for shortlisting my profile! I'm available for a technical interview. You can book a slot here: https://cal.com/example",
      bookingLink: 'https://cal.com/example'
    },
    {
      id: 'initial_interest',
      scenario: 'Recruiter shows initial interest in profile',
      context: 'I am actively looking for opportunities. Share booking link for initial discussion.',
      receivedEmail: 'I came across your profile and would like to discuss potential opportunities. Are you available for a call?',
      suggestedReply: "Thank you for reaching out! I'm definitely interested in exploring opportunities. Please feel free to book a convenient time here: https://cal.com/example",
      bookingLink: 'https://cal.com/example'
    },
    {
      id: 'final_round_invitation',
      scenario: 'Invitation to final interview round',
      context: 'Final interview stage, share availability via booking link',
      receivedEmail: "Congratulations! You've made it to the final round. Let us know your availability for the interview with our CEO.",
      suggestedReply: "Thank you! I'm excited about the opportunity. You can schedule the final interview at your convenience here: https://cal.com/example",
      bookingLink: 'https://cal.com/example'
    },
    {
      id: 'phone_screening',
      scenario: 'Request for phone screening',
      context: 'Initial phone screening request, provide booking link',
      receivedEmail: "We'd like to schedule a brief phone screening to discuss your background. What times work for you?",
      suggestedReply: "I'd be happy to participate in a phone screening. Please book a suitable time slot here: https://cal.com/example",
      bookingLink: 'https://cal.com/example'
    },
    {
      id: 'follow_up_interest',
      scenario: 'Follow-up after application submission',
      context: 'Recruiter following up on submitted application',
      receivedEmail: "We received your application and would like to move forward. Can we schedule a time to chat?",
      suggestedReply: "Thank you for considering my application! I'm very interested. Please book a time that works best for you: https://cal.com/example",
      bookingLink: 'https://cal.com/example'
    }
  ];

  console.log('Generating embeddings for training data...');
  
  // Prepare vectors for upsert
  const vectors = await Promise.all(
    trainingData.map(async (data) => {
      // Create combined text for embedding
      const textToEmbed = `${data.scenario} ${data.context} ${data.receivedEmail}`;
      
      // Generate embedding (dense values)
      const embedding = await generateEmbedding(textToEmbed);
      
      return {
        id: data.id,
        values: embedding,
        metadata: {
          scenario: data.scenario,
          context: data.context,
          receivedEmail: data.receivedEmail,
          suggestedReply: data.suggestedReply,
          bookingLink: data.bookingLink
        }
      };
    })
  );

  // Upsert to Pinecone
  await index.upsert(vectors);
  console.log(`✓ Stored ${vectors.length} training examples in Pinecone`);
}

async function retrieveSimilarScenarios(index:any, incomingEmail:any, topK = 3) {
  console.log('\nSearching for similar scenarios...');
  
  // Generate embedding for incoming email
  const queryEmbedding = await generateEmbedding(incomingEmail);
  
  // Query Pinecone
  const results = await index.query({
    vector: queryEmbedding,
    topK: topK,
    includeMetadata: true
  });
  
  return results.matches;
}

async function generateReplyWithLLM(incomingEmail:any, similarScenarios:any) {
  // Build context from retrieved scenarios
  let context = 'Here are similar email scenarios and their appropriate responses:\n\n';
   console.log(incomingEmail);

  similarScenarios.forEach((match:any, index:any) => {
    const { metadata } = match;
    context += `Example ${index + 1} (Similarity: ${(match.score * 100).toFixed(1)}%):\n`;
    context += `Received: ${metadata.receivedEmail.subject}\n`;
    context += `Reply: ${metadata.suggestedReply}\n`;
    context += `Booking Link: ${metadata.bookingLink}\n\n`;
  });

  const prompt = `${context}
Based on the examples above, generate a professional and friendly reply to the following email:

Incoming Email: "${incomingEmail.subject}"

Requirements:
- Be professional and enthusiastic
- Include the booking link: https://cal.com/example
- Keep it concise (2-3 sentences)
- Match the tone of the example replies

Suggested Reply:`;

  console.log('\nGenerating AI reply...');
  
 const response: any = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

  // Safely extract the reply content, handling possible null/undefined shapes from the API response

   const text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "⚠ No valid text response from model";

    return text.trim();
}


async function getSuggestedReply(incomingEmail:any) {
  try {
    console.log('='.repeat(60));
    console.log('AI-POWERED EMAIL REPLY SUGGESTION SYSTEM');
    console.log('='.repeat(60));
    
    // Initialize index
    const index = await createIndex();
    
    // Store training data (comment out after first run)
    await storeTrainingData(index);
    
    // Retrieve similar scenarios
    const similarScenarios = await retrieveSimilarScenarios(index, incomingEmail);
    
    console.log(`\n✓ Found ${similarScenarios.length} similar scenarios`);
    
    // Generate reply
    const suggestedReply = await generateReplyWithLLM(incomingEmail, similarScenarios);
    
    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('INCOMING EMAIL:');
    console.log('='.repeat(60));
    console.log(incomingEmail);
    
    console.log('\n' + '='.repeat(60));
    console.log('SUGGESTED REPLY:');
    console.log('='.repeat(60));
    console.log(suggestedReply);
    console.log('\n');
    
    return {
      incomingEmail,
      suggestedReply,
      similarScenarios: similarScenarios.map((s: { metadata: { scenario: any; }; score: number; }) => ({
        scenario: s.metadata.scenario,
        similarity: (s.score * 100).toFixed(1) + '%'
      }))
    };
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export {
  createIndex,
  storeTrainingData,
  retrieveSimilarScenarios,
  generateReplyWithLLM,
  getSuggestedReply
};