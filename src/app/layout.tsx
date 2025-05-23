
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { Toaster } from "@/components/ui/toaster";
import React from 'react'; // React import might still be needed for JSX

export const metadata: Metadata = {
  title: 'Quoriam Foods',
  description: 'Restaurant Management App by Quoriam Foods',
  icons: {
    icon: '/favicon.ico', // Standard path for favicon
    // You can also add other icon types like apple-touch-icon
    // apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
