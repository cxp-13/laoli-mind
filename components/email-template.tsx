import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  documentTitle: string;
  documentIntroduction: string;
  documentLink: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  documentTitle,
  documentIntroduction,
  documentLink,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#222' }}>
    <p>Dear friend,</p>
    <p>
      Thank you so much for recognizing my experience in the Web3 industry! 😎<br />
      At this moment, you have taken an important step into the world of Web3.
    </p>
    <p>
      I am Lantian Laoli, and I'm delighted to meet you in this wave of the times.<br />
      Your comment and access permission have been granted. Here is your portal:
    </p>
    <p>
      <strong>Document:</strong> {documentTitle}<br />
      <strong>Introduction:</strong> {documentIntroduction}<br />
      👉 <a href={documentLink} target="_blank" rel="noopener noreferrer">Portal</a>
    </p>
    <p>
      Believe this:<br />
      The future belongs to those who bravely explore. 🦾
    </p>
    <p>
      If you encounter any problems during your learning journey, or want to have a deeper conversation, feel free to DM me on Xiaohongshu.
    </p>
    <p>
      Thank you again for your trust.<br />
      I look forward to meeting a stronger you in the vast Web3 universe! 🌟
    </p>
    <p>
      <strong>⏰ Upcoming exclusive services:</strong><br />
      - Monthly updates: Latest hackathons 🛠️, open-source projects 🔥, interview experiences, and more, updated on the 15th of each month.<br />
      - Hackathon support: If you are preparing for a hackathon or looking for teammates, I will provide targeted assistance. 🎯
    </p>
    <p>
      Best regards,<br />
      Lantian Laoli
    </p>
  </div>
);