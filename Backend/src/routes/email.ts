// My Routes for Email Related  Operations

import { Router, RequestHandler } from "express";
import { categoriseEmailById, categoriseEmails, categoriseEmailsByTo, getAll, getAllEmails, getEmailById, getLast30DaysEmails,  getSuggestedReplies,  searchEmails, testSlackNotification } from "../controller/email";

const router = Router();

// Get the leats 30 Days Email -: This function will return the Emails from Last 30 Days
router.get("/last30days", getLast30DaysEmails); 

// This function will Categorise the Emails Based on the Subject and Body. I can add Slack Notification Here as well.
// But the prompt isn't returning the Interested Label so I will add the Slack Notification in the Test Route.
router.post("/getLabel",categoriseEmails);

// A generic End Point that will return all the Emails from the Database. I am using the Docker Elasticsearch.
router.get("/all",getAllEmails);

// Testing The Slack Notification -: Working Fine. Here I am passing the Payload in the Body. Req.Body;
router.post("/sendNotification",testSlackNotification);

// Here I am able to pass the Email Id and it will categorise that particular Email.
router.get("/categorise/:id",categoriseEmailById);

// Here I am getting the Email by Id. Basically I will pass the ID in the Params and it will return the Email Object.
router.get("/get",getEmailById);

// Categorise Emails by To Field -: Used in the Frontend to get Emails for a particular Recipient
router.get("/emails",categoriseEmailsByTo);

// Search Emails based on Query -: Used in the Frontend to Search Emails
router.get("/search",searchEmails);

router.get("/getAll",getAll);

router.get("/suggestedreply/:id",getSuggestedReplies)

export default router;
