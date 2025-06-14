import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendThankYouEmail(
  to: string,
  subject: string,
  content: string
) {
  try {
    console.log('Sending email:', to, subject, content);
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject,
      html: content,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}