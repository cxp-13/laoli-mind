import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendThankYouEmail(
  to: string,
  title: string,
  introduction: string,
  link: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `Welcome aboard | 🖐️ Please find attached Lantianlaoli's document titled ${title}`,
      react: EmailTemplate({ title, introduction, link })
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