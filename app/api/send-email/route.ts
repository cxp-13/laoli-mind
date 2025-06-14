import { sendThankYouEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { to, subject, content } = await req.json();
  const result = await sendThankYouEmail(to, subject, content);
  return Response.json(result);
}