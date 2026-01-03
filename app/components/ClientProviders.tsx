
'use client';

// All of the client-side providers that we need to wrap our app in
// We can't put these in the root layout because they are client components
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
