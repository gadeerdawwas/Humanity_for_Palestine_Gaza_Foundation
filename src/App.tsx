import {
  useEffect,
} from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { LanguageProvider } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

import { HomePage } from '@/pages/HomePage';
import { GalleryPage } from '@/pages/GalleryPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { InitiativeDetailPage } from '@/pages/InitiativeDetailPage';

import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';

import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage';
import { AdminProjectDetailPage } from '@/pages/admin/AdminProjectDetailPage';
import { AdminInitiativesPage } from '@/pages/admin/AdminInitiativesPage';
import { AdminGalleryPage } from '@/pages/admin/AdminGalleryPage';
import { AdminServicesPage } from '@/pages/admin/AdminServicesPage';
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage';
import { AdminSubscribersPage } from '@/pages/admin/AdminSubscribersPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminPartnersPage } from '@/pages/admin/AdminPartnersPage';
import { AdminImpactStatsPage } from '@/pages/admin/AdminImpactStatsPage';

import {
  type ReactNode,
  useState,
} from 'react';

/* =========================
   SITE BRANDING
========================= */

function SiteBranding() {
  useEffect(() => {
    const loadBranding = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', [
          'site_logo_url',
          'organization_name_en',
        ]);

      if (error) {
        console.error(
          'LOAD SITE BRANDING ERROR:',
          error
        );
        return;
      }

      const values: Record<string, string> = {};

      (data || []).forEach(
        (item: {
          key: string;
          value: string | null;
        }) => {
          values[item.key] =
            item.value || '';
        }
      );

      const logoUrl =
        values.site_logo_url?.trim();

      const siteName =
        values.organization_name_en?.trim() ||
        'Humanity for Palestine – Gaza';

      document.title = siteName;

      if (logoUrl) {
        document
          .querySelectorAll(
            "link[rel='icon'], link[rel='shortcut icon']"
          )
          .forEach((element) =>
            element.remove()
          );

        const favicon =
          document.createElement('link');

        favicon.rel = 'icon';
        favicon.href =
          `${logoUrl}?v=${Date.now()}`;

        document.head.appendChild(
          favicon
        );

        document
          .querySelectorAll(
            "link[rel='apple-touch-icon']"
          )
          .forEach((element) =>
            element.remove()
          );

        const appleIcon =
          document.createElement('link');

        appleIcon.rel =
          'apple-touch-icon';

        appleIcon.href =
          `${logoUrl}?v=${Date.now()}`;

        document.head.appendChild(
          appleIcon
        );
      }
    };

    loadBranding();
  }, []);

  return null;
}

/* =========================
   PROTECTED ADMIN ROUTE
========================= */

function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
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
          color: '#073B2A',
          fontWeight: 600,
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

/* =========================
   APP
========================= */

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>

        <SiteBranding />

        <Routes>

          {/* PUBLIC WEBSITE */}

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/gallery"
            element={<GalleryPage />}
          />

          <Route
            path="/projects/:id"
            element={<ProjectDetailPage />}
          />

          <Route
            path="/initiatives/:id"
            element={<InitiativeDetailPage />}
          />

          {/* ADMIN LOGIN - PUBLIC */}

          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />

          {/* PROTECTED ADMIN */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <AdminProjectsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/:id"
            element={
              <ProtectedRoute>
                <AdminProjectDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/initiatives"
            element={
              <ProtectedRoute>
                <AdminInitiativesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <AdminGalleryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <AdminServicesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <AdminMessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/subscribers"
            element={
              <ProtectedRoute>
                <AdminSubscribersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/impact"
            element={
              <ProtectedRoute>
                <AdminImpactStatsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/partners"
            element={
              <ProtectedRoute>
                <AdminPartnersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}