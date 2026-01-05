
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

/**
 * Authenticates an incoming request by verifying the Google ID Token 
 * present in the Authorization header, ensuring it's from a trusted service account.
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
        // Define the expected audience for the token.
        // This should be the URL of your service.
        const audience = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3000' 
            : 'https://your-production-url.com'; // Replace with your actual production URL

        // Verify the token using the Google Auth Library.
        // This checks the signature, expiration, issuer, and audience.
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: audience,
        });

        const payload = ticket.getPayload();

        // Optional: You could add a further check here to ensure the token
        // belongs to a specific, expected service account email if needed.
        // const email = payload?.email;
        // if (email !== 'expected-service-account@your-project.iam.gserviceaccount.com') {
        //     throw new Error('Token is not from the expected service account.');
        // }

        if (!payload) {
            throw new Error('Token verification failed to produce a payload.');
        }

        return { success: true };

    } catch (error: any) {
        console.error('Error verifying service account token:', error.message);

        return { 
            success: false, 
            error: 'Invalid or expired token. Verification failed.', 
            status: 403 // 403 Forbidden is appropriate for failed authentication
        };
    }
}
