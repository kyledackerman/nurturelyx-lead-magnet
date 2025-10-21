// Email HTML Templates with inline CSS for compatibility

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
`;

export function generateWelcomeEmail(fullName: string, userId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; ${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nurturely!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Hi ${fullName},</h2>
      <p style="margin: 0 0 15px;">Congratulations! Your ambassador application has been approved. We're excited to have you join our program.</p>
      <p style="margin: 0 0 15px;">As an ambassador, you'll earn commissions by:</p>
      <ul style="margin: 0 0 20px; padding-left: 20px;">
        <li>Submitting new domains to the marketplace</li>
        <li>Earning platform fees when clients sign up (5-10% based on tier)</li>
        <li>Earning per-lead commissions as clients process leads (15-25% based on tier)</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://nurturely.io/ambassador/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">Go to Dashboard</a>
      </div>
      <p style="margin: 20px 0 0; color: #666; font-size: 14px;">Questions? Reply to this email and we'll be happy to help.</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateRejectionEmail(fullName: string, reason: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; ${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background-color: #6366f1; padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Ambassador Application Update</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Hi ${fullName},</h2>
      <p style="margin: 0 0 15px;">Thank you for your interest in becoming a Nurturely ambassador.</p>
      <p style="margin: 0 0 15px;">After careful review, we've decided not to move forward with your application at this time:</p>
      <div style="background-color: #f8f9fa; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #666;">${reason}</p>
      </div>
      <p style="margin: 20px 0 0;">We appreciate your interest and encourage you to reapply in the future as our program evolves.</p>
      <p style="margin: 20px 0 0; color: #666; font-size: 14px;">If you have questions, feel free to reply to this email.</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generatePurchaseConfirmationEmail(
  fullName: string,
  domain: string,
  price: number
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; ${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✓ Lead Purchased</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Hi ${fullName},</h2>
      <p style="margin: 0 0 15px;">Your lead purchase has been confirmed!</p>
      <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px; color: #059669;">Purchase Details</h3>
        <p style="margin: 5px 0;"><strong>Domain:</strong> ${domain}</p>
        <p style="margin: 5px 0;"><strong>Price:</strong> $${price.toFixed(2)}</p>
      </div>
      <p style="margin: 20px 0 0;">This lead is now exclusively assigned to you. View it in your dashboard to start outreach.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://nurturely.io/ambassador/domains" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View My Domains</a>
      </div>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCommissionEligibleEmail(
  fullName: string,
  amount: number,
  domain: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; ${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">💰 Commission Now Eligible!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Great news, ${fullName}!</h2>
      <p style="margin: 0 0 15px;">Your platform fee commission for <strong>${domain}</strong> has passed the 60-day hold period and is now eligible for payout.</p>
      <div style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">Eligible Commission</p>
        <p style="margin: 10px 0 0; font-size: 32px; font-weight: bold; color: #d97706;">$${amount.toFixed(2)}</p>
      </div>
      <p style="margin: 20px 0 0;">This commission will be included in the next monthly payout (minimum $100 threshold).</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://nurturely.io/ambassador/commissions" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View Commissions</a>
      </div>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generatePayoutProcessedEmail(
  fullName: string,
  payoutAmount: number,
  payoutDate: string,
  commissionsSummary: { platformFee: number; perLead: number; }
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; ${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Payout Processed!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Congratulations, ${fullName}!</h2>
      <p style="margin: 0 0 15px;">Your monthly payout has been processed and is on its way.</p>
      <div style="background-color: #f5f3ff; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #6d28d9;">Total Payout</p>
          <p style="margin: 10px 0 0; font-size: 36px; font-weight: bold; color: #8b5cf6;">$${payoutAmount.toFixed(2)}</p>
          <p style="margin: 5px 0 0; font-size: 12px; color: #6d28d9;">${payoutDate}</p>
        </div>
        <div style="border-top: 1px solid #c4b5fd; padding-top: 15px;">
          <p style="margin: 5px 0; display: flex; justify-content: space-between;"><span>Platform Fee Commissions:</span> <strong>$${commissionsSummary.platformFee.toFixed(2)}</strong></p>
          <p style="margin: 5px 0; display: flex; justify-content: space-between;"><span>Per-Lead Commissions:</span> <strong>$${commissionsSummary.perLead.toFixed(2)}</strong></p>
        </div>
      </div>
      <p style="margin: 20px 0 0;">The funds should arrive within 3-5 business days depending on your payment method.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://nurturely.io/ambassador/commissions" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View Full History</a>
      </div>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateDomainSubmissionEmail(
  fullName: string,
  domain: string,
  reportId: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; ${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">✓ Domain Submitted</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Hi ${fullName},</h2>
      <p style="margin: 0 0 15px;">Your domain has been successfully submitted and is now active in your account!</p>
      <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px; color: #2563eb;">Submitted Domain</h3>
        <p style="margin: 5px 0; font-size: 18px; font-weight: 600;">${domain}</p>
      </div>
      <p style="margin: 20px 0 0;">This domain has been auto-assigned to you. When a client signs up, you'll earn platform fee commissions and per-lead commissions as they process leads.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://nurturely.io/ambassador/domains" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View My Domains</a>
      </div>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
