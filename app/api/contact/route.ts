import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert into database
    await db.insert(messages).values({
      name,
      email,
      subject,
      message,
    });

    // 2. Send email via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY in environment variables");
      return NextResponse.json({ error: "Mail configuration error" }, { status: 500 });
    }
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: "gauravsunthwalwork@gmail.com",
        subject: `Portfolio Contact: ${subject}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 16px;">
            <!-- Header -->
            <div style="padding-bottom: 16px; border-bottom: 1px solid #EAEAEA; margin-bottom: 24px;">
              <h2 style="margin: 0; color: #111111; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">New Portfolio Inquiry</h2>
              <p style="margin: 4px 0 0 0; color: #666666; font-size: 14px;">Submitted via the contact form on your portfolio website.</p>
            </div>
            
            <!-- Details Grid -->
            <div style="margin-bottom: 24px;">
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #888888; margin-bottom: 4px; letter-spacing: 0.5px;">Sender Name</span>
                <span style="font-size: 15px; color: #111111; font-weight: 500;">${name}</span>
              </div>
              
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #888888; margin-bottom: 4px; letter-spacing: 0.5px;">Sender Email</span>
                <a href="mailto:${email}" style="font-size: 15px; color: #0070F3; text-decoration: none; font-weight: 500;">${email}</a>
              </div>

              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #888888; margin-bottom: 4px; letter-spacing: 0.5px;">Subject</span>
                <span style="font-size: 15px; color: #111111; font-weight: 500;">${subject}</span>
              </div>
            </div>
            
            <!-- Message Block -->
            <div style="background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);">
              <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #888888; margin-bottom: 8px; letter-spacing: 0.5px;">Message</span>
              <div style="font-size: 15px; line-height: 1.6; color: #333333; white-space: pre-wrap; margin: 0;">${message}</div>
            </div>
            
            <!-- Footer -->
            <div style="font-size: 12px; color: #999999; text-align: center; border-top: 1px solid #EAEAEA; padding-top: 16px; margin-top: 8px;">
              This is an automated notification. You can reply directly to this email to contact the sender.
            </div>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
