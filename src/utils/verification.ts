
// Utility functions for handling verification codes

// Generate a random 6-digit code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
