import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * A centralized function to log significant activities to an immutable log.
 * @param {string} message The description of the activity.
 * @param {object} context Additional data related to the event.
 */
const logActivity = (message: string, context: object = {}) => {
  console.log(`Logging activity: ${message}`);
  return admin.firestore().collection("activity_log").add({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    message,
    context,
  });
};

/**
 * Unified Cloud Function to handle SAA report lifecycle events (creation and updates).
 * Triggered by any write (create, update) to the /saa_reports/{reportId} path.
 */
export const onsaareportwritten = onDocumentWritten("saa_reports/{reportId}", async (event) => {
  const { reportId } = event.params;

  // Event type: 'create' or 'update'
  const change = event.data;
  if (!change) {
    console.log(`[SAA] No data associated with event for report ${reportId}.`);
    return;
  }

  const dataBefore = change.before.data();
  const dataAfter = change.after.data();

  // ---> Handle NEW report creation <---
  if (!dataBefore && dataAfter) {
    const { plotId, farmerId } = dataAfter;
    await logActivity(`[SAA] New report requested: ${reportId}`, { reportId, plotId, farmerId });

    await change.after.ref.update({ status: "processing" });

    try {
      // Mock analysis delay
      await new Promise(resolve => setTimeout(resolve, 5000));

      const raw_output = {
        summary: `Analysis for Plot ${plotId}: Soil pH is optimal, but crop diversity could be improved based on regional data.`,
        recommendations: [
          "Actionable Insight: Consider intercropping with leguminous plants like peanuts to boost soil nitrogen.",
          "Long-term: A regular pruning schedule for your existing fruit trees is recommended to increase yield.",
        ],
      };

      await change.after.ref.update({
        status: "pending_review",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        saa_raw_output: raw_output,
      });

      await logActivity(`[SAA] Report ${reportId} processed and awaiting expert review.`, { reportId });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error(`[SAA] Error processing report ${reportId}:`, error);
        await change.after.ref.update({
            status: "error",
            errorMessage: "The AI analysis failed. The technical team has been notified.",
        });
        await logActivity(`[SAA] Error processing report ${reportId}`, { reportId, error: errorMessage });
    }
    return;
  }

  // ---> Handle report APPROVAL <--- 
  if (dataBefore && dataAfter && dataBefore.status !== "approved_by_expert" && dataAfter.status === "approved_by_expert") {
    const { plotId, farmerId, expertId } = dataAfter; // Assuming expertId is added

    await logActivity(`[SAA] Report ${reportId} approved by expert: ${expertId}`, { reportId, expertId, plotId });

    await change.after.ref.update({
        status: "delivered",
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const notificationRef = admin.firestore().collection("notifications").doc();
    await notificationRef.set({
        notificationId: notificationRef.id,
        farmerId,
        plotId,
        type: "saa_report_ready",
        message: `Your Smart Agro-Analyst report for Plot ${plotId} is ready.`,
        link: `/farmers/reports/${reportId}?plotId=${plotId}`,
        status: "unread",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logActivity(`[SAA] Report ${reportId} delivered and notification sent to farmer.`, { reportId, farmerId });
    return;
  }

  console.log(`[SAA] No action taken for report ${reportId}. Event was neither a creation nor an approval.`);
});
