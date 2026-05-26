import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import MobileDrawer from '@/components/layout/MobileDrawer';
import ToastContainer from '@/components/ui/Toast';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VedaAI – Assessment Creator',
  description: 'AI-powered assessment creation for teachers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${bricolage.variable} ${inter.variable}`}>
      <body className="min-h-full flex bg-[#f0f0f0]">
        <Sidebar />
        <MobileDrawer />
        {/* Offset for fixed sidebar on desktop; bottom padding clears mobile nav */}
        <div className="flex-1 lg:ml-[220px] min-h-screen flex flex-col pb-28 lg:pb-0">
          {children}
        </div>
        <MobileNav />
        <ToastContainer />
      </body>
    </html>
  );
}
