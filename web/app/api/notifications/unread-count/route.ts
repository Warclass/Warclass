import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { getPendingInvitationsCount } from '@/backend/services/invitation/invitation.service';

/**
 * Simple notifications unread count endpoint.
 * For now it proxies the number of pending invitations as unread notifications.
 */
export async function GET(req: NextRequest) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    const invitations = await getPendingInvitationsCount(userId);

    return NextResponse.json({ success: true, count: invitations });
  } catch (error) {
    console.error('GET /api/notifications/unread-count error:', error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}
