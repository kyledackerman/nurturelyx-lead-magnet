// Mailgun Email Service Helper
// Uses Mailgun REST API v3 for sending emails

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
  const mailgunRegion = Deno.env.get('MAILGUN_REGION');

  if (!mailgunApiKey || !mailgunDomain || !mailgunRegion) {
    console.error('Missing Mailgun configuration');
    throw new Error('Email service not configured');
  }

  const fromAddress = options.from || `Nurturely <noreply@${mailgunDomain}>`;
  
  const formData = new FormData();
  formData.append('from', fromAddress);
  formData.append('to', options.to);
  formData.append('subject', options.subject);
  formData.append('html', options.html);
  
  if (options.replyTo) {
    formData.append('h:Reply-To', options.replyTo);
  }

  const url = `${mailgunRegion}/v3/${mailgunDomain}/messages`;
  
  console.log(`📧 Sending email to ${options.to}: ${options.subject}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailgun API error:', errorText);
      throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result.id);
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
}
