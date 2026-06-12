import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Editor from '@/components/admin/Editor';

export const metadata = {
  title: 'Edit Content — Sofia Artistry',
  robots: { index: false, follow: false },
};

export default async function EditPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session?.value || session.value !== process.env.ADMIN_PASSWORD) {
    redirect('/admin');
  }
  return <Editor />;
}
