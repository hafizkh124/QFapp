import type { Metadata } from 'next';
// import { GeistSans } from 'geist/font/sans'; // Removed due to missing 'geist' package
// import { GeistMono } from 'geist/font/mono';   // Removed due to missing 'geist' package
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/app-logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { BellIcon, SettingsIcon } from 'lucide-react';

// Comment related to GeistSans and GeistMono removed as they are no longer imported.

export const metadata: Metadata = {
  title: 'Quoriam Foods',
  description: 'Restaurant Management App by Quoriam Foods',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Removed GeistSans.variable and GeistMono.variable from className */}
      <body className="antialiased" suppressHydrationWarning={true}>
        <SidebarProvider defaultOpen={true} collapsible="icon">
          <Sidebar side="left" variant="sidebar" className="flex flex-col">
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-2">
                <AppLogo className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">Quoriam Foods</h1>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex-1 overflow-y-auto">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
              {/* Placeholder for footer items like user profile or settings */}
              <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
                <SettingsIcon className="w-5 h-5" />
                <span className="ml-2 group-data-[collapsible=icon]:hidden">Settings</span>
              </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <div className="hidden font-medium md:block">
                {/* Could show current page title here */}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <BellIcon className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
                {/* User Avatar/Menu Placeholder */}
              </div>
            </header>
            <main className="flex-1 p-4 overflow-auto md:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
