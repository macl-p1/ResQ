import { sendTestEmail } from '@/lib/email';
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const info = await sendTestEmail('shivanshgangwar655@gmail.com');
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Test email error:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
