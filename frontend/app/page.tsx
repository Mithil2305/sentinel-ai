'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/store/app-context';

export default function Home() {
  const router = useRouter();
  const { setSelectedPage } = useApp();

  useEffect(() => {
    setSelectedPage('dashboard');
    router.replace('/dashboard');
  }, [router, setSelectedPage]);

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-xs text-muted font-semibold tracking-wider">LOADING SENTINELAI SOC SYSTEM...</span>
      </div>
    </div>
  );
}
