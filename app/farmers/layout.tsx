
import AuthGuard from '@/app/components/AuthGuard';

export default function FarmersLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
