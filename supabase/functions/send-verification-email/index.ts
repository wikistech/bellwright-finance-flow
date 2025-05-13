
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  code: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { to, subject, code, name }: EmailRequest = await req.json();

    if (!to || !subject || !code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // For demo purposes, we're just logging the email details
    // In production, you would integrate with an email service like SendGrid, Mailgun, etc.
    console.log(`Sending email to ${to} with subject "${subject}" and code "${code}"`);

    // This is where you would add your email service integration
    // For example with SendGrid, Mailgun, or AWS SES
    // Here we'll simulate a successful send
    const emailBody = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .code { font-size: 24px; font-weight: bold; text-align: center; padding: 10px; margin: 20px 0; background-color: #e5e7eb; border-radius: 4px; letter-spacing: 8px; }
            .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bellwright Finance</h1>
            </div>
            <div class="content">
              <h2>Hello ${name || 'there'},</h2>
              <p>Thank you for registering with Bellwright Finance. To complete your registration, please use the following verification code:</p>
              <div class="code">${code}</div>
              <p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Bellwright Finance. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // In a real implementation, you would send the actual email here
    // For now, we'll just simulate success
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error sending verification email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send verification email',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
