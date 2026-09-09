import Navbar from '@/components/Navbar';
import '@/styles/globals.css';

export const metadata = {
  title: 'SIH26043 Challenge Platform',
  description: 'Full-stack challenge platform for Smart India Hackathon 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
