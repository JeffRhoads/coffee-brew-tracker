const {onRequest, HttpsError} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer"); // Import nodemailer

admin.initializeApp();

// HTTPS Callable Function (equivalent of Gen 1 onCall)
exports.initializeInvitationsCollection = onRequest({
  // Optional: Specify region and other options for Gen 2
  // region: "us-central1",
  // cpu: 1,
  // memory: "256Mi"
}, async (request) => { // In Gen 2 onCall, data is in request.data
  try {
    const db = admin.firestore();
    const data = request.data; // Access data from request.data in Gen 2

    await db.collection("invitations").doc("init").set({
      familyId: data.familyId || "init-family",
      invitedEmail: data.invitedEmail || "init@example.com",
      invitedByUid: data.invitedByUid || "init-uid",
      invitedByNickname: data.invitedByNickname || "Init User",
      status: data.status || "init",
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Invitations collection initialized",
    };
  } catch (error) {
    console.error("Error initializing invitations collection:", error);
    throw new HttpsError(
        "internal",
        "Failed to initialize invitations collection: " + error.message,
    );
  }
});


// Firestore Triggered Function (equivalent of Gen 1 onCreate)
exports.onNewInvitationCreate = onDocumentCreated({
  document: "invitations/{invitationId}",
  region: "us-central1", // Specify the region
  database: "(default)", // Use the default database instance
}, async (event) => { // Added async keyword here
  const snapshot = event.data;

  if (!snapshot) {
    console.log("No data associated with the event.");
    return null;
  }

  const data = snapshot.data();
  console.log("New invitation document created:", data);

  // Add this line to log the EMAIL_HOST environment variable
  console.log("EMAIL_HOST environment variable:", process.env.EMAIL_HOST);
  console.log("TEST_VAR environment variable:", process.env.TEST_VAR); // Add this line

  // ** Email Sending Logic Starts Here **

  const invitedEmail = data.invitedEmail;
  // const familyId = data.familyId;
  // const invitedByNickname = data.invitedByNickname;

  // Configure Nodemailer transporter
  // My email creds: email.host="smtp.gmail.com" email.port="587" email.secure="false" email.user="" email.pass="" email.from="""
  // My App Password is gexc laam uyun rfhu
  // Use environment variables for secure storage of credentials
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., 'smtp.sendgrid.net'
    port: parseInt(process.env.EMAIL_PORT), // e.g., 587
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // e.g., 'apikey' for SendGrid
      pass: process.env.EMAIL_PASS, // e.g., your SendGrid API key
    },
  });

  // Compose email
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender address (must be verified with your email service)
    to: invitedEmail, // Recipient address
    subject: "You've been invited to join a family on Coffee Brew Tracker!",
    text: "Hello! You've been invited by ${invitedByNickname} to join their family " +
    "on Coffee Brew Tracker. Family ID: ${familyId}",
    html: "<p>Hello!</p><p>You've been invited by ${invitedByNickname} to join their family " +
    "on Coffee Brew Tracker.</p><p>Family ID: <strong>${familyId}</strong></p>",
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${invitedEmail}`);
  } catch (emailError) {
    console.error(`Error sending invitation email to ${invitedEmail}:`, emailError);
    // Consider handling the error (e.g., logging to a separate error collection)
  }

  // ** Email Sending Logic Ends Here **

  return null;
});
