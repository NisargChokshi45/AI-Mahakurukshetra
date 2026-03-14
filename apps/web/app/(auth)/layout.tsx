import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description:
    'Sign in or create an account to access the supply chain workspace.',
};

export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(244,247,245,1),_rgba(234,241,236,1))]">
      {children}
    </main>
  );
}
