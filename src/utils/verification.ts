
// Utility functions for handling verification codes

// Generate a random 5-digit numeric verification code (0-9)
export function generateVerificationCode(): string {
  const characters = '0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

// Function to send email with verification code
export function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  console.log(`Sending verification code ${code} to ${email}`);
  
  // Extract name from email for personalization
  const name = email.split('@')[0] || 'there';
  
  return new Promise(async (resolve) => {
    try {
      // Make API call to Supabase edge function
      const response = await fetch(
        'https://hllrrffxfqyqqigyxujm.supabase.co/functions/v1/send-verification-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbHJyZmZ4ZnF5cXFpZ3l4dWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MTcyMTcsImV4cCI6MjA2MjA5MzIxN30.t-mBv3a3i2CKW3r4jRgm7E6hh2g2OihJqnUbvnAM7CM`
          },
          body: JSON.stringify({
            to: email,
            subject: 'Bellwright Finance: Your Verification Code',
            code: code,
            name: name
          })
        }
      );
      
      if (!response.ok) {
        console.error('Failed to send verification email:', await response.text());
        resolve(false);
        return;
      }
      
      console.log('Verification email sent successfully');
      resolve(true);
    } catch (error) {
      console.error('Error sending verification email:', error);
      resolve(false);
    }
  });
}

// Mock function to simulate sending welcome email
export function sendWelcomeEmail(email: string): Promise<boolean> {
  console.log(`Sending welcome email to ${email}`);
  
  // In a real application, this would make an API call to send an email
  // For this demo, we'll simulate a successful email send
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}
