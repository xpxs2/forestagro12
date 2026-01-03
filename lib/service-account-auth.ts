import { auth } from '@/lib/firebase-admin';

/**
 * Authenticates an incoming request by verifying the service account JWT 
 * present in the Authorization header.
 * 
 * @param request The incoming Next.js Request object.
 * @returns An object indicating success or failure.
 */
export async function authenticateServiceAccount(request: Request): Promise<{ success: boolean; error?: string; status?: number }> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { 
            success: false, 
            error: 'Authorization header is missing or malformed. Must be: Bearer [token]', 
            status: 401 
        };
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the Firebase Admin SDK. 
        // This checks the signature, expiration, and issuer.
        await auth.verifyIdToken(token);
        return { success: true };
    } catch (error: any) {
        console.error('Error verifying service account token:', error);

        let errorMessage = 'Invalid or expired token.';
        // Provide more specific error messages in a development environment
        if (process.env.NODE_ENV === 'development') {
            if (error.code === 'auth/id-token-expired') {
                errorMessage = 'The provided service account token has expired.';
            } else if (error.code === 'auth/argument-error') {
                errorMessage = 'The provided token is malformed or invalid.';
            }
        }

        return { 
            success: false, 
            error: errorMessage, 
            status: 403 // 403 Forbidden is appropriate for failed authentication
        };
    }
}
