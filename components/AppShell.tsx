import Nav from './Nav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen bg-clinic-bg">
        {children}
      </main>
    </div>
  );
}
