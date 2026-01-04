
import { useUser } from '@/app/context/UserContext';

export const useAuth = () => {
  const context = useUser();
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};
