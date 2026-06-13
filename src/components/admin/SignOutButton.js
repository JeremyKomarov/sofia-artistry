'use client';

import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  return (
    <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={handleSignOut}>
      Sign out
    </button>
  );
}
