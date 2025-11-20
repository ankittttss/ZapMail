//Slack Configuration File
//Slack Config File is working I am receiving Notifications in Slack Channel, I will add the Snippet and Postman Response.


import { IncomingWebhook } from '@slack/webhook';

// Your Slack webhook URL
const slackWebhookUrl = 'https://hooks.slack.com/services/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';
const slackWebhook = new IncomingWebhook(slackWebhookUrl);

// Function to send Slack notification for an email
export async function sendSlackNotification(email: any) {
  try {
    await slackWebhook.send({
      text: `📧 *New Interested Email*\nFrom: ${email.from}\nTo: ${email.to}\nSubject: ${email.subject}\nDate: ${email.date}`
    });
  } catch (err) {
    console.error('Failed to send Slack notification:', err);
  }
}
