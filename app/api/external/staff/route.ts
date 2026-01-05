
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/app/lib/firebase-admin';
import { logActivity } from '@/app/lib/actions';

// Define the structure of an incoming request from agro-vista20
interface StaffRequest {
  staffUser: {
    id: string;
    country: string;
  };
  action: string; // e.g., 'get_farmers', 'set_user_state', 'update_farmer_crops'
  payload?: any;
}

// This function handles all POST requests to /api/external/staff
export async function POST(request: Request) {
  // 1. Authenticate the application
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = process.env.AGRO_VISTA_API_KEY;

  if (!expectedApiKey) {
    console.error('CRITICAL: AGRO_VISTA_API_KEY is not set.');
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedApiKey}`) {
    await logActivity('anonymous', 'auth_failure', { endpoint: '/api/external/staff' });
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body: StaffRequest = await request.json();
    const { staffUser, action, payload } = body;

    // Log the incoming action from the authenticated staff member
    await logActivity(staffUser.id, `staff_api_${action}`, { country: staffUser.country, payload });

    // 2. Authorize and Route based on the action
    switch (action) {
      case 'get_farmers':
      case 'get_rangers':
      case 'get_merchants':
        const role = action.split('_')[1].slice(0, -1); // 'get_farmers' -> 'farmer'
        const usersSnapshot = await adminDb.collection('users')
            .where('role', '==', role)
            .where('address.country', '==', staffUser.country)
            .get();
        const data = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ [role + 's']: data });

      case 'set_user_state':
        // Security Check: Ensure staff can only modify users in their own country
        const userDoc = await adminDb.collection('users').doc(payload.userId).get();
        if (!userDoc.exists || userDoc.data()?.address.country !== staffUser.country) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }
        await adminAuth.updateUser(payload.userId, { disabled: payload.disabled });
        return NextResponse.json({ success: true, message: `User ${payload.userId} state set to disabled: ${payload.disabled}` });

      case 'update_farmer_crops':
      case 'update_farmer_activities':
        const dataType = action === 'update_farmer_crops' ? 'cropData' : 'practiceActivities';
        // Security Check: Ensure staff can only modify farmers in their own country
        const farmerDoc = await adminDb.collection('users').doc(payload.farmerId).get();
        if (!farmerDoc.exists || farmerDoc.data()?.address.country !== staffUser.country) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }
        await adminDb.collection('users').doc(payload.farmerId).update({ [dataType]: payload.data });
        return NextResponse.json({ success: true, message: `Farmer ${payload.farmerId} ${dataType} updated.` });

      default:
        return new NextResponse(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
  } catch (error) {
    const typedError = error as Error;
    console.error('Error in Staff API:', typedError.message);
    await logActivity('system_error', 'staff_api_error', { errorMessage: typedError.message });
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
