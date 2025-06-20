import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Hardcoded testimonial texts to be paired with real user data
const testimonialTexts = [
  "These Notion docs helped me launch my MVP in just a week. Amazing!",
  "The SaaS templates are a game-changer. Saved me countless hours of design and development work.",
  "Actionable, insightful, and beautifully organized. The AI resources are top-notch and exactly what my team needed.",
  "The best curated collection of startup resources I've found online. A must-have for any aspiring founder.",
  "The marketing playbooks are pure gold. Our user acquisition has doubled since we implemented them.",
  "Finally, a set of resources that respects your time. Concise, yet incredibly powerful.",
];

// Helper function to format email addresses into a more presentable name and initials
function formatEmail(email: string) {
  const emailUser = email.split('@')[0].replace(/[\._-]/g, ' ');
  const nameParts = emailUser.split(' ');

  let name = '';
  let initials = '';

  if (nameParts.length > 1) {
    name = `${nameParts[0].charAt(0).toUpperCase()}${nameParts[0].slice(1)} ${nameParts[1].charAt(0).toUpperCase()}.`;
    initials = `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
  } else {
    name = `${emailUser.charAt(0).toUpperCase()}${emailUser.slice(1)}`;
    initials = `${emailUser.charAt(0)}${emailUser.charAt(1) || ''}`.toUpperCase();
  }

  return { name, initials };
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {


    // Fetch the last 20 granted permissions
    const { data: permissions, error } = await supabase
      .from('email_permissions')
      .select('email')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ success: true, testimonials: [] });
    }

    // Combine fetched user data with hardcoded testimonial texts
    const testimonials = permissions.map((permission, index) => {
      const { name, initials } = formatEmail(permission.email);
      return {
        name,
        initials,
        text: testimonialTexts[index % testimonialTexts.length], // Cycle through testimonial texts
      };
    });

    return NextResponse.json({ success: true, testimonials });

  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}