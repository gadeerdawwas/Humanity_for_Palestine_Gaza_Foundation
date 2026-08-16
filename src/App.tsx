import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/context/LanguageContext';
import { HomePage } from '@/pages/HomePage';
import { GalleryPage } from '@/pages/GalleryPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
