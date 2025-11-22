import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { startIMAP } from './services/imapservice'
import router from './routes/email';
import { createElasticClient, testElasticConnection } from './config/elasticSearc';


dotenv.config(); // Storing the Credentials

const app = express();
const PORT = process.env.PORT || 5000;

// Cross-Origin Resource Sharing (CORS) Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Next.js dev server
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

//Middleware Routes
app.use('/app',router);

// Imap Service Initialization
startIMAP();
// smartReply("Hello, I hope you are doing well. I wanted to follow up on our previous conversation regarding the project timeline. Please let me know if you have any updates. Looking forward to hearing from you soon!");

// Test Elasticsearch Connection
const elasticClient = createElasticClient();
testElasticConnection(elasticClient);


app.listen(PORT, () => {
  // console.log(`Server running on http://localhost:${PORT}`);
});
