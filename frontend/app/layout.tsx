import { Montserrat } from 'next/font/google';
import './globals.css';
import { AppContextProvider } from '@/store/app-context';
import { MainLayout } from '@/components/layout/main-layout';

const montserrat = Montserrat({
  variable: '--font-sans',
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
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        <AppContextProvider>
          <MainLayout>{children}</MainLayout>
        </AppContextProvider>
      </body>
    </html>
  );
}
