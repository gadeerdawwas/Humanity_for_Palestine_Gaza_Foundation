import {
  ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  Navigate,
  useLocation,
} from 'react-router-dom';

import { supabase } from '@/lib/supabase';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

  const [loading, setLoading] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setAuthenticated(!!session);
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setAuthenticated(!!session);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F6F7F4',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
}