import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/admin-auth';
import Editor from '@/components/admin/Editor';

export const metadata = {
  title: 'Edit Content — Sofia Artistry',
  robots: { index: false, follow: false },
};

export default async function EditPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  const user = verifySessionToken(session?.value);
  if (!user) redirect('/admin');
  const hasGoogleReviews = !!(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);
  return <Editor hasGoogleReviews={hasGoogleReviews} role={user.role} />;
}
