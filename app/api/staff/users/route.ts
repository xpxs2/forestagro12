// In your backend, you would initialize the Firebase Admin SDK
// This is typically done in a separate configuration file (e.g., app/lib/firebase-admin.ts)
// For this example, we'll assume admin is initialized.
import { admin } from '@/app/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * Placeholder for authenticating a request from the trusted Agro-Vista20 backend.
 * In a real implementation, this would involve verifying a JWT signed by the service account.
 *
 * @param {Request} request The incoming request
 * @returns {Promise<boolean>} A promise that resolves to true if the request is authentic
 */
async function authenticateStaffRequest(request: Request): Promise<boolean> {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        console.warn('Authentication failed: No token provided.');
        return false;
    }

    try {
        // Here you would verify the token is valid and originates from your trusted service account
        // For now, we will just decode it. In a real scenario, you would verify it.
        // const decodedToken = await admin.auth().verifyIdToken(idToken);
        // if (decodedToken.uid === 'your-service-account-uid') {
        //     return true;
        // }
        return true; // For now, we'll assume any token is valid for demonstration
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

/**
 * Handles GET requests to fetch user data based on country and role.
 * This directly addresses the requirement for the staff app to read data.
 *
 * Query Parameters:
 *  - country: The country to filter users by.
 *  - role: The user role to fetch (e.g., 'farmers', 'rangers', 'merchants').
 */
export async function GET(request: Request) {
    const isAuthentic = await authenticateStaffRequest(request);
    if (!isAuthentic) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const role = searchParams.get('role');

    if (!country || !role) {
        return new NextResponse('Missing required query parameters: country, role', { status: 400 });
    }

    try {
        const firestore = admin.firestore();
        const snapshot = await firestore.collection(role).where('country', '==', country).get();
        
        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(users);

    } catch (error) {
        console.error(`Error fetching role=${role} for country=${country}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

/**
 * Handles PATCH requests to enable or disable a user account in Firebase Authentication.
 * This directly addresses the requirement for the staff app to manage user access.
 *
 * Request Body:
 *  - uid: The UID of the user to update.
 *  - disabled: A boolean value indicating the desired state.
 */
export async function PATCH(request: Request) {
    const isAuthentic = await authenticateStaffRequest(request);
    if (!isAuthentic) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { uid, disabled } = await request.json();

        if (!uid || typeof disabled !== 'boolean') {
            return new NextResponse('Missing required body parameters: uid (string), disabled (boolean)', { status: 400 });
        }

        await admin.auth().updateUser(uid, { disabled });

        return NextResponse.json({
            message: `Successfully ${disabled ? 'disabled' : 'enabled'} user with UID: ${uid}`
        });

    } catch (error) {
        console.error('Error updating user:', error);
        // Check for a specific error type, e.g., user not found
        if (error.code === 'auth/user-not-found') {
            return new NextResponse('User not found', { status: 404 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
