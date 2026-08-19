import {
  useEffect,
} from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
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

      /* PAGE TITLE */
      document.title = siteName;

      /* FAVICON */
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

        /* APPLE ICON */
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

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>

        {/* يعمل على الموقع ولوحة التحكم */}
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
            element={
              <ProjectDetailPage />
            }
          />

          <Route
            path="/initiatives/:id"
            element={
              <InitiativeDetailPage />
            }
          />

          {/* ADMIN */}

          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />

          <Route
            path="/admin"
            element={
              <AdminDashboardPage />
            }
          />

          <Route
            path="/admin/projects"
            element={
              <AdminProjectsPage />
            }
          />

          <Route
            path="/admin/projects/:id"
            element={
              <AdminProjectDetailPage />
            }
          />

          <Route
            path="/admin/initiatives"
            element={
              <AdminInitiativesPage />
            }
          />

          <Route
            path="/admin/gallery"
            element={
              <AdminGalleryPage />
            }
          />

          <Route
            path="/admin/services"
            element={
              <AdminServicesPage />
            }
          />

          <Route
            path="/admin/messages"
            element={
              <AdminMessagesPage />
            }
          />

          <Route
            path="/admin/subscribers"
            element={
              <AdminSubscribersPage />
            }
          />

          <Route
            path="/admin/impact"
            element={
              <AdminImpactStatsPage />
            }
          />

          <Route
            path="/admin/partners"
            element={
              <AdminPartnersPage />
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminSettingsPage />
            }
          />

        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}