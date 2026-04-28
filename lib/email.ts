import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export async function sendWelcomeEmail(
  volunteerName: string,
  volunteerEmail: string,
  skills: string[],
  locationName: string
) {
  const mailOptions = {
    from: `ResQ Crisis Response <${process.env.GMAIL_USER}>`,
    to: volunteerEmail,
    subject: '🚨 Welcome to ResQ — You are now a registered volunteer!',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8F9FA;padding:20px">
        <div style="background:#1A73E8;padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:28px">🛡️ ResQ</h1>
          <p style="color:#E8F0FE;margin:8px 0 0;font-size:16px">AI-powered Crisis Response</p>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <h2 style="color:#1A73E8;margin-top:0">Welcome, ${volunteerName}! 🙏</h2>
          <p style="color:#3C4043;line-height:1.6;font-size:16px">
            You have successfully registered as a ResQ volunteer. You will now be matched 
            with crisis tasks in your area based on your skills and availability.
          </p>

          <div style="background:#F8F9FA;border-radius:8px;padding:20px;margin:24px 0">
            <h3 style="color:#3C4043;margin:0 0 12px;font-size:16px">📋 Your Profile</h3>
            <p style="margin:8px 0;color:#5F6368;font-size:15px">
              ✅ <strong>Skills:</strong> ${skills.join(', ')}
            </p>
            <p style="margin:8px 0;color:#5F6368;font-size:15px">
              📍 <strong>Location:</strong> ${locationName}
            </p>
            <p style="margin:8px 0;color:#5F6368;font-size:15px">
              📧 <strong>Email alerts:</strong> Enabled
            </p>
            <p style="margin:8px 0;color:#5F6368;font-size:15px">
              📱 <strong>WhatsApp alerts:</strong> Enabled
            </p>
          </div>

          <div style="background:#E8F5E9;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #188038">
            <p style="margin:0;color:#188038;font-weight:600;font-size:15px">🚨 What happens next?</p>
            <p style="margin:8px 0 0;color:#3C4043;font-size:14px;line-height:1.6">
              When a coordinator assigns a task matching your skills, you will receive 
              both a WhatsApp message and an email instantly. Log in to accept 
              the task and navigate to the location.
            </p>
          </div>

          <div style="background:#FFF3E0;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #F29900">
            <p style="margin:0;color:#E65100;font-weight:600;font-size:15px">📱 Enable WhatsApp Alerts</p>
            <p style="margin:8px 0 0;color:#3C4043;font-size:14px;line-height:1.6">
              Save <strong>+1 415 523 8886</strong> in your contacts and 
              send <strong>join himself-explanation</strong> on WhatsApp to 
              receive instant task alerts.
            </p>
          </div>

          <div style="text-align:center;margin-top:32px">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/volunteer/dashboard"
               style="display:inline-block;background:#1A73E8;color:white;padding:16px 48px;border-radius:24px;text-decoration:none;font-weight:600;font-size:16px">
              Open Volunteer Dashboard →
            </a>
          </div>

          <hr style="border:none;border-top:1px solid #E8EAED;margin:32px 0">
          <p style="color:#9AA0A6;font-size:12px;text-align:center;margin:0">
            ResQ — Built on Google Cloud. Powered by Gemini AI.<br>
            This email was sent to ${volunteerEmail} because you registered as a volunteer.
          </p>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Welcome email sent:', info.messageId);
  return info;
}

export async function sendTaskAssignmentEmail(
  volunteerEmail: string,
  volunteerName: string,
  needType: string,
  location: string,
  urgencyScore: number,
  affectedCount: number,
  needId: string,
  mapsLink: string
) {
  const urgencyColor = urgencyScore >= 80 ? '#D93025' : urgencyScore >= 60 ? '#E8710A' : urgencyScore >= 40 ? '#F29900' : '#188038';
  const urgencyLabel = urgencyScore >= 80 ? 'CRITICAL' : urgencyScore >= 60 ? 'HIGH' : urgencyScore >= 40 ? 'MODERATE' : 'LOW';

  await transporter.sendMail({
    from: `ResQ Crisis Response <${process.env.GMAIL_USER}>`,
    to: volunteerEmail,
    subject: `🚨 Task Assigned — ${needType} in ${location}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8F9FA;padding:20px">
        <div style="background:${urgencyColor};padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0">🚨 New Task Assigned</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">${urgencyLabel} PRIORITY</p>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="color:#3C4043">Hi ${volunteerName},</h2>
          <p style="color:#3C4043;line-height:1.6">A coordinator has assigned you an emergency task. Please respond immediately.</p>

          <div style="background:#FCE8E6;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid ${urgencyColor}">
            <h3 style="color:${urgencyColor};margin:0 0 12px">📋 Task Details</h3>
            <p style="margin:8px 0;color:#3C4043">🆘 <strong>Need:</strong> ${needType}</p>
            <p style="margin:8px 0;color:#3C4043">📍 <strong>Location:</strong> ${location}</p>
            <p style="margin:8px 0;color:#3C4043">⚠️ <strong>Urgency:</strong> ${urgencyScore}/100 — ${urgencyLabel}</p>
            <p style="margin:8px 0;color:#3C4043">👥 <strong>People affected:</strong> ${affectedCount}</p>
          </div>

          ${mapsLink ? `
          <a href="${mapsLink}"
             style="display:block;background:#1A73E8;color:white;text-align:center;padding:16px;border-radius:24px;text-decoration:none;font-weight:600;font-size:16px;margin:24px 0">
            🗺️ Navigate to Crisis Site →
          </a>
          ` : ''}

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/volunteer/dashboard"
             style="display:block;background:${urgencyColor};color:white;text-align:center;padding:16px;border-radius:24px;text-decoration:none;font-weight:600;font-size:16px;margin:12px 0">
            ✅ Accept Task in ResQ →
          </a>

          <hr style="border:none;border-top:1px solid #E8EAED;margin:24px 0">
          <p style="color:#9AA0A6;font-size:12px;text-align:center">ResQ — Built on Google Cloud · Powered by Gemini AI</p>
        </div>
      </div>
    `
  });
}

export async function sendTestEmail(toEmail: string) {
  const mailOptions = {
    from: `ResQ <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'ResQ — Email Test',
    html: '<h1>ResQ email is working!</h1><p>Gmail SMTP is configured correctly.</p>'
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('Test email sent:', info.messageId);
  return info;
}
