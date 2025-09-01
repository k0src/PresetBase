import { Routes, Route } from "react-router-dom";
import * as Pages from "./pages";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import BrowseRoute from "./components/BrowseRoute/BrowseRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Static Pages */}
      <Route path="/" element={<Pages.HomePage />} />
      <Route path="/about-us" element={<Pages.AboutPage />} />
      <Route path="/privacy-policy" element={<Pages.PrivacyPolicy />} />
      <Route path="/copyright" element={<Pages.Copyright />} />
      <Route path="/upload-tos" element={<Pages.UploadTos />} />
      <Route path="/stats" element={<Pages.StatsPage />} />
      <Route path="/search" element={<Pages.SearchPage />} />

      {/* Protected Routes */}
      <Route path="/submit/*" element={<ProtectedRoute />}>
        <Route index element={<Pages.SubmitPage />} />
        <Route path="example" element={<Pages.SubmitExamplePage />} />
      </Route>
      <Route
        path="/me"
        element={
          <ProtectedRoute>
            <Pages.AccountInfoPage />
          </ProtectedRoute>
        }
      />

      {/* Content Routes */}
      <Route path="/song/:id" element={<Pages.SongPage />} />
      <Route path="/album/:id" element={<Pages.AlbumPage />} />
      <Route path="/artist/:id" element={<Pages.ArtistPage />} />
      <Route path="/synth/:id" element={<Pages.SynthPage />} />

      {/* Browse Routes */}
      <Route path="/browse" element={<BrowseRoute />}>
        <Route index element={<Pages.BrowsePage />} />
        <Route path="songs" element={<Pages.BrowseSongs />} />
        <Route path="artists" element={<Pages.BrowseArtists />} />
        <Route path="albums" element={<Pages.BrowseAlbums />} />
        <Route path="synths" element={<Pages.BrowseSynths />} />
        <Route path="presets" element={<Pages.BrowsePresets />} />
        <Route path="genres" element={<Pages.BrowseGenres />} />
        <Route path="popular" element={<Pages.BrowsePopular />} />
        <Route path="hot" element={<Pages.BrowseHot />} />
        <Route path="recent" element={<Pages.BrowseRecent />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Pages.LoginPage />} />
      <Route path="/register" element={<Pages.RegisterPage />} />
      <Route path="/auth/oauth-success" element={<Pages.OAuthSuccessPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<Pages.AdminApprovals />} />
        <Route path="approvals" element={<Pages.AdminApprovals />} />
        <Route path="upload" element={<Pages.AdminUpload />} />
        <Route path="manage-db" element={<Pages.AdminManageDb />} />
        <Route path="manage-users" element={<Pages.AdminManageUsers />} />
        <Route path="manage-db/:table" element={<Pages.AdminManageDb />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Pages.NotFound />} />
    </Routes>
  );
}
