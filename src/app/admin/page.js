import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/admin-auth';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = {
  title: 'Admin Login — Sofia Artistry',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (verifySessionToken(session?.value)) redirect('/admin/edit');
  return <LoginForm />;
}
