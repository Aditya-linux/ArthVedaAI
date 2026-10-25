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
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'ArthVeda AI — Financial NLP Intelligence',
  description: 'Financial Natural Language Processing & Algorithmic Market Sentiment Prediction Platform',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
      <body className={`${dmSans.className} ${outfit.variable} antialiased`}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(18, 18, 20, 0.95)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#FFFFFF',
                secondary: '#000000',
              },
            },
            error: {
              iconTheme: {
                primary: '#FFFFFF',
                secondary: '#000000',
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
