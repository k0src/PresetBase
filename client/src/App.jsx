import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";

import HomePage from "./pages/static/HomePage/HomePage";
import AboutPage from "./pages/static/AboutPage/AboutPage";
import PrivacyPolicy from "./pages/static/PrivacyPolicy/PrivacyPolicy";
import Copyright from "./pages/static/Copyright/Copyright";
import UploadTos from "./pages/static/UploadTos/UploadTos";
import StatsPage from "./pages/static/StatsPage/StatsPage";
import SearchPage from "./pages/static/SearchPage/SearchPage";
import SubmitPage from "./pages/static/SubmitPage/SubmitPage";
import SubmitExamplePage from "./pages/static/SubmitPage/SubmitExamplePage";

import SongPage from "./pages/entries/SongPage";
import AlbumPage from "./pages/entries/AlbumPage";
import ArtistPage from "./pages/entries/ArtistPage";
import SynthPage from "./pages/entries/SynthPage";

import BrowsePage from "./pages/browse/BrowsePage/BrowsePage";
import BrowseSongs from "./pages/browse/BrowseSongs";
import BrowseArtists from "./pages/browse/BrowseArtists";
import BrowseAlbums from "./pages/browse/BrowseAlbums";
import BrowseSynths from "./pages/browse/BrowseSynths";
import BrowsePresets from "./pages/browse/BrowsePresets";
import BrowseGenres from "./pages/browse/BrowseGenres";
import BrowsePopular from "./pages/browse/BrowsePopular";
import BrowseHot from "./pages/browse/BrowseHot";
import BrowseRecent from "./pages/browse/BrowseRecent";

import LoginPage from "./pages/auth/LoginPage/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage/RegisterPage";
import AccountInfoPage from "./pages/auth/AccountInfoPage/AccountInfoPage";
import OAuthSuccessPage from "./pages/auth/OAuthSuccessPage/OAuthSuccessPage";

import AdminApprovals from "./pages/admin/AdminApprovals/AdminApprovals";
import AdminUpload from "./pages/admin/AdminUpload/AdminUpload";
import AdminManageUsers from "./pages/admin/AdminManageUsers/AdminManageUsers";
import AdminManageDb from "./pages/admin/AdminManageDb";

import NotFound from "./pages/static/NotFound/NotFound";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Static routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/copyright" element={<Copyright />} />
          <Route path="/upload-tos" element={<UploadTos />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/search" element={<SearchPage />} />

          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit/example"
            element={
              <ProtectedRoute>
                <SubmitExamplePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <AccountInfoPage />
              </ProtectedRoute>
            }
          />

          {/* Entry routes */}
          <Route path="/song/:id" element={<SongPage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/synth/:id" element={<SynthPage />} />

          {/* Browse routes */}
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/browse/songs" element={<BrowseSongs />} />
          <Route path="/browse/artists" element={<BrowseArtists />} />
          <Route path="/browse/albums" element={<BrowseAlbums />} />
          <Route path="/browse/synths" element={<BrowseSynths />} />
          <Route path="/browse/presets" element={<BrowsePresets />} />
          <Route path="/browse/genres" element={<BrowseGenres />} />
          <Route path="/browse/popular" element={<BrowsePopular />} />
          <Route path="/browse/hot" element={<BrowseHot />} />
          <Route path="/browse/recent" element={<BrowseRecent />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/oauth-success" element={<OAuthSuccessPage />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminApprovals />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <AdminRoute>
                <AdminApprovals />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <AdminRoute>
                <AdminUpload />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage-db"
            element={
              <AdminRoute>
                <AdminManageDb />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <AdminRoute>
                <AdminManageUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage-db/:table"
            element={
              <AdminRoute>
                <AdminManageDb />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
