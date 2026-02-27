import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/context/ThemeContext';
import { SimulatorProvider } from '@/context/SimulatorContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'], variable: '--font-outfit' });

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'ArthVeda AI',
  description: 'Financial Intelligence Platform',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ArthVeda AI",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} ${outfit.variable}`}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: 'var(--green)',
                secondary: 'var(--bg-surface)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--red)',
                secondary: 'var(--bg-surface)',
              },
            },
          }}
        />

        <ThemeProvider>
          <AuthProvider>
            <SimulatorProvider>
              <LayoutProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </LayoutProvider>
            </SimulatorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
