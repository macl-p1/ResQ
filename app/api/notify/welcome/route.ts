export const dynamic = "force-dynamic";
import { sendWelcomeEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('=== WELCOME NOTIFICATION ROUTE HIT ===');
  try {
    const { name, email, phone, skills, location_name } = await request.json();
    console.log('Sending welcome email to:', email);
    await sendWelcomeEmail(name, email, skills, location_name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome notification error:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
