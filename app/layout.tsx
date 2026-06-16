import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/themes/ThemeProvider";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { getMongoUser } from "@/lib/helpers/auth";
import { getUserDashboardData } from "@/lib/actions/workspace.actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollabKit | The minimal workspace",
  description: "CollabKit bundles chat, task boards, and lightweight docs into a single premium toolkit.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getMongoUser();
  const data = await getUserDashboardData(userId);
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full min-h-screen font-sans`}
      >
        <body
          suppressHydrationWarning
          className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20"
        >
          <WorkspaceProvider data={data}>

            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Navbar />
              <main className="mt-16 w-full flex flex-col flex-1 relative z-0">
                {children}
              </main>
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: 'var(--color-card)',
                    color: 'var(--color-foreground)',
                    border: '1px solid var(--color-border)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '100px', /* Pill shape toasts */
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    padding: '12px 24px',
                    fontWeight: 500,
                    fontSize: '14px'
                  }
                }}
              />
            </ThemeProvider>
          </WorkspaceProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}