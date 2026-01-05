import { adminDb } from './firebase-admin';
import admin from 'firebase-admin';

interface LogEntry {
  timestamp: FirebaseFirestore.FieldValue;
  userId: string;
  action: string;
  details: any; // Can be any structured data
}

/**
 * Logs an activity to the immutable activity_log collection in Firestore.
 * This is essential for creating a verifiable audit trail for all actions.
 *
 * @param userId - The ID of the user performing the action.
 * @param action - A string describing the action (e.g., 'user_login', 'plot_update').
 * @param details - An object containing additional data about the action.
 */
export async function logActivity(
  userId: string,
  action: string,
  details: any
): Promise<void> {
  try {
    const logEntry: LogEntry = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId,
      action,
      details,
    };

    await adminDb.collection('activity_log').add(logEntry);
    console.log(`Activity logged: ${action} for user ${userId}`);
  } catch (error) {
    console.error('Error logging activity:', error);
    // In a real application, you might want to handle this error more gracefully
    // (e.g., by notifying an admin or retrying the operation).
  }
}
