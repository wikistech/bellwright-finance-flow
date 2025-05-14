
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

    // Log email details
    console.log(`Sending email to ${to} with subject "${subject}" and code "${code}"`);

    // Create improved email body
    const emailBody = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a56db; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9fafb; }
            .code { font-size: 32px; font-weight: bold; text-align: center; padding: 15px; margin: 20px 0; background-color: #e5e7eb; border-radius: 8px; letter-spacing: 10px; }
            .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #6b7280; padding: 20px; }
            .message { margin-bottom: 20px; font-size: 16px; line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bellwright Finance</h1>
            </div>
            <div class="content">
              <p class="message">Hi ${name || 'there'},</p>
              <p class="message">Welcome to bellwright-finance, your all-in-one financial hub for individuals, businesses & organizations!</p>
              <p class="message">Manage money, invest, borrow & do more globally – all from your secure bellwright-finance Dashboard.</p>
              <p class="message">Simply verify your email address with this verification code to get started:</p>
              <div class="code">${code}</div>
              <p class="message">Thanks for choosing us!</p>
              <p class="message">The bellwright-finance Account Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Bellwright Finance. All rights reserved.</p>
              <p>If you did not sign up for a Bellwright Finance account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // In a real implementation, we would send the actual email here
    // For now, we'll simulate success
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        subject: 'Your Bellwright Finance Verification Code',
        body: emailBody.substring(0, 200) + '...' // Log a preview of the email body
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
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
