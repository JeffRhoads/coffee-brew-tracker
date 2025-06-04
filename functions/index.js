const {onRequest, HttpsError} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

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
exports.onNewInvitationCreate = onDocumentCreated("invitations/{invitationId}", (event) => {
  const snapshot = event.data;

  if (!snapshot) {
    console.log("No data associated with the event.");
    return null;
  }

  const data = snapshot.data();
  console.log("New invitation document created:", data);

  // ** Email Sending Logic Goes Here **
  // This is where you would add the code to send the email.
  // Example (requires a configured email service):
  /*
    const invitedEmail = data.invitedEmail;
    const familyId = data.familyId;
    const invitedByNickname = data.invitedByNickname;

    // Use an email sending library or service (like nodemailer, SendGrid, etc.)
    // and your email service credentials to send the email.

    console.log(`Attempting to send invitation email to ${invitedEmail} for family ${familyId}`);

    // Example with a hypothetical sendEmail function:
    // await sendEmail({
    //     to: invitedEmail,
    //     from: 'noreply@your-app.com', // Replace with your sender email
    //     subject: 'You've been invited to join a family on Coffee Brew Tracker!',
    //     text: `Hello! You've been invited by ${invitedByNickname} to join their family on Coffee Brew Tracker. Family ID: ${familyId}`,
    //     html: `<p>Hello!</p><p>You've been invited by ${invitedByNickname} to join their family on Coffee Brew Tracker.</p><p>Family ID: <strong>${familyId}</strong></p>`
    // });

    console.log('Email sending logic would be here.');
    */

  return null; // Important to return null or a Promise
});
