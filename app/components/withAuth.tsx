
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';

const withAuth = (WrappedComponent: React.ComponentType<any>, allowedRoles: string[]) => {
  const AuthComponent = (props: any) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    if (!user) {
      router.push('/'); // Redirect to login page
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/'); // Or a generic unauthorized page
        return null;
    }
    

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
