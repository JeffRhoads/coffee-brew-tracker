const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.initializeInvitationsCollection = functions.https.onCall(
    async (data, context) => {
      try {
        const db = admin.firestore();
        await db.collection("invitations").doc("init").set({
          familyId: "init-family",
          invitedEmail: "init@example.com",
          invitedByUid: "init-uid",
          invitedByNickname: "Init User",
          status: "init",
          createdAt: new Date().toISOString(),
        });
        return {
          success: true,
          message: "Invitations collection initialized",
        };
      } catch (error) {
        console.error("Error initializing invitations collection:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Failed to initialize invitations collection: " + error.message,
        );
      }
    },
);
