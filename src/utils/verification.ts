
// Utility functions for handling verification codes

// Generate a random 5-character alphanumeric code (letters and numbers from 0-9)
export function generateVerificationCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

// Mock function to simulate sending email with verification code
export function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  console.log(`Sending verification code ${code} to ${email}`);
  
  // In a real application, this would make an API call to send an email
  // For this demo, we'll simulate a successful email send
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
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
