import { Client } from '@elastic/elasticsearch';
import { ParsedEmail } from '../services/emailParser';

// Function to create and return the Elasticsearch client
// Need to Use process.ENV for production code


export function createElasticClient(): Client {
  const client = new Client({
    node: 'https://my-elasticsearch-project-b6b35f.es.us-central1.gcp.elastic.cloud:443',
    auth: {
      apiKey: 'eDB6eG5Kb0JKcTQwSzk0SUc1R1A6RU0xT1JNUzdabUVQbnBmYXZLRGF3QQ=='
    },
    serverMode: 'serverless', // optional for serverless clusters
  });

  return client;
}

// Optional: function to test the connection
export async function testElasticConnection(client: Client): Promise<void> {
  try {
    const info = await client.info();
  } catch (err) {
    console.error('Elasticsearch connection failed:', err);
  }
}


// Function to index emails into Elasticsearch
export async function indexEmailsToElastic(
  client: Client,
  index: string,
  emails: ParsedEmail[]
) {
  if (emails.length === 0) return;

  try {
    const bulkResponse = await client.helpers.bulk({
      datasource: emails,
      onDocument(email) {
        return {
          index: { _index: index },
        };
      },
      refreshOnCompletion: true,
    });
    return bulkResponse;
  } catch (err) {
    console.error('Error indexing emails to Elasticsearch:', err);
  }
}
