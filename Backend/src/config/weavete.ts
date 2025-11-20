// import weaviate, { WeaviateClient ,ApiKey,generativeParameters} from "weaviate-client";
// import {GoogleGenAI} from '@google/genai';

// const weaviateURL = "00c1rzr4tsgfzul9kqiwa.c0.asia-southeast1.gcp.weaviate.cloud";
// const weaviateApiKey = "Tjh5aUxnNGN4U04rT0hqal85THVHT0hEemNkZEswVWtnZXppUCtyRGhVVVRYVFM0VHpQZ2tJRGkvQUdNPV92MjAw";

// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
// const GEMINI_API_KEY =  "AIzaSyB45uQ1GIkHLrh7-2vdgY3gTfJL4Ph_I-s";
// const Claude_Key = "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"
// const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


// export async function smartReply(emailText: string) {
//   try {
//     // 1️⃣ Connect to Weaviate
//     const client = await weaviate.connectToWeaviateCloud(weaviateURL, {
//       authCredentials: new ApiKey(weaviateApiKey),
//     });

//     // 2️⃣ Create QueryAgent targeting your collection
//     const agent = new QueryAgent(client, {
//       collections: ["OutreachReply"],
//     });

//     console.log(agent);

//     // 3️⃣ Retrieve similar items ONLY (no LLM generation here)
//     const retrieval = await agent.search(emailText, { limit: 1 });

//     console.log(retrieval);

//     if (!retrieval.searchResults.objects.length) {
//       await client.close();
//       return { reply: null, message: "No training data found." };
//     }

//     const retrievedObj = retrieval.searchResults.objects[0].properties;

//     const context = retrievedObj.context || "";
//     const exampleReply = retrievedObj.exampleReply || "";

//     // 4️⃣ Build final prompt for Gemini
//     const prompt = `
// You are an AI email assistant. Use the retrieved example to generate the best reply.

// --- CONTEXT ---
// ${context}

// --- EXAMPLE REPLY ---
// ${exampleReply}

// --- INCOMING EMAIL ---
// ${emailText}

// If they ask to schedule a meeting, include the link: https://cal.com/example
// `.trim();

//     // 5️⃣ Generate reply using Gemini Flash
//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: prompt,
//     });

//     await client.close();

//     return {
//       reply: response.candidates?.[0]?.content?.parts?.[0]?.text || null,
//       usedContext: retrievedObj,
//     };
//   } catch (err) {
//     console.error("Smart Reply Error:", err);
//     throw new Error("Failed to generate smart reply");
//   }
// }

// // main();


