'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

type DetailPageLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function DetailPageLayout({ title, children }: DetailPageLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-textLight py-4 px-6 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button onClick={() => router.back()} className="bg-accent hover:bg-lightAccent text-textDark font-bold py-2 px-4 rounded-md shadow-sm">
          Back to Dashboard
        </button>
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
