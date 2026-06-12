import '../../styles/admin.scss';

export const metadata = {
  title: 'Admin — Sofia Artistry',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <span className="admin-topbar__brand">
          Sofia Artistry <em>Admin</em>
        </span>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
