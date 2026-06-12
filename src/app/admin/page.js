import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = {
  title: 'Admin Login — Sofia Artistry',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value && session.value === process.env.ADMIN_PASSWORD) {
    redirect('/admin/edit');
  }
  return <LoginForm />;
}
