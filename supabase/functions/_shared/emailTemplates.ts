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
      
      <div style="background-color: #fff4e6; border: 3px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="margin: 0 0 12px; color: #d97706; font-size: 18px;">⚠️ IMPORTANT: Complete Your Account Setup</h3>
        <p style="margin: 0 0 12px; font-weight: 600; color: #333;">You will receive TWO separate emails:</p>
        <ol style="margin: 0 0 15px; padding-left: 20px; color: #333;">
          <li style="margin-bottom: 8px;"><strong>This welcome email</strong> (you're reading it now)</li>
          <li style="margin-bottom: 8px;"><strong>A separate account setup email from Supabase Auth</strong><br/>
          <span style="font-size: 14px; color: #666;">Subject: "You have been invited"</span></li>
        </ol>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 15px;">
          <p style="margin: 0 0 10px; font-weight: 600; color: #92400e;">📋 Next Steps:</p>
          <ol style="margin: 0; padding-left: 20px; color: #92400e;">
            <li style="margin-bottom: 5px;">Check your inbox for "You have been invited"</li>
            <li style="margin-bottom: 5px;">Click "Accept Invite" to set your password</li>
            <li style="margin-bottom: 5px;">Once complete, use the button below to access your dashboard</li>
          </ol>
        </div>
      </div>

      <p style="margin: 20px 0 15px;">As an ambassador, you'll earn commissions by:</p>
      <ul style="margin: 0 0 20px; padding-left: 20px;">
        <li>Submitting new domains to the marketplace</li>
        <li>Earning platform fees when clients sign up (5-10% based on tier)</li>
        <li>Earning per-lead commissions as clients process leads (15-25% based on tier)</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://x1.nurturely.io/ambassador/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">Already Set Up? Go to Dashboard →</a>
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
  price: number,
  newCreditBalance: number
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
      <p style="margin: 0 0 15px;">Your lead purchase has been charged to your credit balance.</p>
      <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px; color: #059669;">Purchase Details</h3>
        <p style="margin: 5px 0;"><strong>Domain:</strong> ${domain}</p>
        <p style="margin: 5px 0;"><strong>Price:</strong> $${price.toFixed(2)} (charged to credit)</p>
        <p style="margin: 5px 0;"><strong>Current Credit Balance:</strong> $${newCreditBalance.toFixed(2)}</p>
      </div>
      <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
        <p style="margin: 0;"><strong>💡 How Credit Works:</strong></p>
        <p style="margin: 10px 0 0 0;">Your credit balance will be automatically settled against your monthly commission payouts. No upfront payment required!</p>
      </div>
      <p style="margin: 20px 0 0;">This lead is now exclusively assigned to you. View it in your dashboard to start outreach.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://x1.nurturely.io/ambassador/domains" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View My Domains</a>
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
        <a href="https://x1.nurturely.io/ambassador/commissions" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View Commissions</a>
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
  commissionsSummary: { platformFee: number; perLead: number; },
  creditSettlement?: number
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
        <div style="border-bottom: 1px solid #c4b5fd; padding-bottom: 15px; margin-bottom: 15px;">
          <p style="margin: 5px 0; display: flex; justify-content: space-between;"><span>Platform Fee Commissions:</span> <strong>$${commissionsSummary.platformFee.toFixed(2)}</strong></p>
          <p style="margin: 5px 0; display: flex; justify-content: space-between;"><span>Per-Lead Commissions:</span> <strong>$${commissionsSummary.perLead.toFixed(2)}</strong></p>
          <p style="margin: 5px 0; display: flex; justify-content: space-between; font-size: 16px;"><span><strong>Total Commissions Earned:</strong></span> <strong style="color: #8b5cf6;">$${(commissionsSummary.platformFee + commissionsSummary.perLead).toFixed(2)}</strong></p>
        </div>
        ${creditSettlement && creditSettlement > 0 ? `
        <div style="border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 15px;">
          <p style="margin: 5px 0; display: flex; justify-content: space-between; color: #dc2626;"><span><strong>Credit Balance Settlement:</strong></span> <strong>-$${creditSettlement.toFixed(2)}</strong></p>
          <p style="margin: 10px 0 0; font-size: 12px; color: #666;">This represents lead purchases charged to your credit that are now being settled.</p>
        </div>
        ` : ''}
        <div style="text-align: center; padding-top: 15px;">
          <p style="margin: 0; font-size: 14px; color: #6d28d9;">Net Payout</p>
          <p style="margin: 10px 0 0; font-size: 36px; font-weight: bold; color: #10b981;">${payoutAmount > 0 ? '$' + payoutAmount.toFixed(2) : '$0.00'}</p>
          <p style="margin: 5px 0 0; font-size: 12px; color: #6d28d9;">${payoutDate}</p>
        </div>
      </div>
      <p style="margin: 20px 0 0;">The funds should arrive within 3-5 business days depending on your payment method.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://x1.nurturely.io/ambassador/commissions" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View Full History</a>
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
        <a href="https://x1.nurturely.io/ambassador/domains" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View My Domains</a>
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

export function generateBulkPurchaseConfirmationEmail(
  domains: string[],
  totalCost: number,
  purchaseCount: number,
  newCreditBalance: number
): string {
  const domainsList = domains.map(d => `<li style="margin: 5px 0;">${d}</li>`).join('');
  
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
      <h1 style="color: white; margin: 0; font-size: 28px;">Bulk Purchase Confirmed!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 0 0 25px;">
        <h2 style="margin: 0 0 10px; color: #166534; font-size: 20px;">✅ Purchase Complete</h2>
        <p style="margin: 0; color: #166534;"><strong>${purchaseCount} leads</strong> purchased for <strong>$${totalCost.toFixed(2)}</strong></p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">💳 <strong>New Credit Balance:</strong> ${newCreditBalance.toLocaleString()} credits</p>
      </div>

      <h3 style="color: #333; margin: 25px 0 15px;">Purchased Domains:</h3>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          ${domainsList}
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://x1.nurturely.io/ambassador/domains" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">View Your Domains →</a>
      </div>

      <p style="margin: 20px 0 0; color: #666; font-size: 14px;">Questions? Reply to this email.</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateSubscriptionWelcomeEmail(
  fullName: string,
  creditsAwarded: number,
  planName: string
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
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Nurturely!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Hi ${fullName},</h2>
      <p style="margin: 0 0 15px;">Your subscription is now active and you're all set to start purchasing leads!</p>
      
      <div style="background-color: #f0fdf4; border: 3px solid #22c55e; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
        <h3 style="margin: 0 0 10px; color: #166534; font-size: 22px;">✨ ${creditsAwarded.toLocaleString()} Credits Awarded</h3>
        <p style="margin: 0; color: #166534; font-size: 14px;">Your ${planName} plan is ready to use!</p>
      </div>

      <h3 style="color: #333; margin: 25px 0 15px;">Next Steps:</h3>
      <ol style="margin: 0 0 25px; padding-left: 20px; color: #666;">
        <li style="margin-bottom: 10px;">Browse the marketplace for high-quality leads</li>
        <li style="margin-bottom: 10px;">Use your credits to purchase leads that match your needs</li>
        <li style="margin-bottom: 10px;">Access contact details and start reaching out</li>
      </ol>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://x1.nurturely.io/buy-credits" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">Start Purchasing Leads →</a>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 10px; color: #666; font-weight: 600;">💡 Pro Tip:</p>
        <p style="margin: 0; color: #666; font-size: 14px;">Your monthly credits roll over, so you can accumulate them for larger purchases.</p>
      </div>

      <p style="margin: 20px 0 0; color: #666; font-size: 14px;">Questions? Our support team is here to help – just reply to this email.</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCreditPurchaseConfirmationEmail(
  fullName: string,
  creditsPurchased: number,
  amountPaid: number,
  newBalance: number
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
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">💳 Purchase Confirmed</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px;">Hi ${fullName},</h2>
      <p style="margin: 0 0 15px;">Your credit purchase was successful!</p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0;">
        <h3 style="margin: 0 0 10px; color: #166534; font-size: 18px;">Purchase Details</h3>
        <p style="margin: 0 0 8px; color: #166534;"><strong>Credits Purchased:</strong> ${creditsPurchased.toLocaleString()}</p>
        <p style="margin: 0; color: #166534;"><strong>Amount Paid:</strong> $${amountPaid.toFixed(2)}</p>
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">💰 <strong>New Balance:</strong> ${newBalance.toLocaleString()} credits</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://x1.nurturely.io/ambassador/marketplace" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600;">Browse Marketplace →</a>
      </div>

      <p style="margin: 20px 0 0; color: #666; font-size: 14px;">Questions? Reply to this email and we'll help you out.</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">© 2025 Nurturely. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
