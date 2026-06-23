import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppContextProvider } from '@/store/app-context';
import { MainLayout } from '@/components/layout/main-layout';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'SentinelAI | Autonomous SOC Analyst',
  description: 'AI-powered cybersecurity observability, threat detection, and autonomous remediation platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        <AppContextProvider>
          <MainLayout>{children}</MainLayout>
        </AppContextProvider>
      </body>
    </html>
  );
}
