'use client';

import { usePathname } from 'next/navigation';
import SignOutButton from './SignOutButton';

export default function AdminTopbarActions() {
  const pathname = usePathname();
  if (pathname !== '/admin/edit') return null;
  return <SignOutButton />;
}
