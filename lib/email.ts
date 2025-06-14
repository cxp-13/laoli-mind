import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendThankYouEmail(
  to: string,
  subject: string,
  content: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@lantianlaoli.com',
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