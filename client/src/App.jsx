import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import HomePage from "./pages/static/HomePage";
import AboutPage from "./pages/static/AboutPage";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import Copyright from "./pages/static/Copyright";
import UploadTos from "./pages/static/UploadTos";
import StatsPage from "./pages/static/StatsPage";
import SearchPage from "./pages/static/SearchPage";
import SubmitPage from "./pages/static/SubmitPage";

import SongPage from "./pages/entries/SongPage";
import AlbumPage from "./pages/entries/AlbumPage";
import ArtistPage from "./pages/entries/ArtistPage";
import SynthPage from "./pages/entries/SynthPage";

import BrowsePage from "./pages/browse/BrowsePage";
import BrowseSongs from "./pages/browse/BrowseSongs";
import BrowseArtists from "./pages/browse/BrowseArtists";
import BrowseAlbums from "./pages/browse/BrowseAlbums";
import BrowseSynths from "./pages/browse/BrowseSynths";
import BrowsePresets from "./pages/browse/BrowsePresets";
import BrowseGenres from "./pages/browse/BrowseGenres";
import BrowsePopular from "./pages/browse/BrowsePopular";
import BrowseHot from "./pages/browse/BrowseHot";
import BrowseRecent from "./pages/browse/BrowseRecent";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminUpload from "./pages/admin/AdminUpload";
import AdminTagEditor from "./pages/admin/AdminTagEditor";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminManageUsers from "./pages/admin/AdminManageUsers";
import AdminManageDb from "./pages/admin/AdminManageDb";

import NotFound from "./pages/static/NotFound";
import DbError from "./pages/static/DbError";

function App() {
  return (
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
        <Route path="/submit" element={<SubmitPage />} />

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

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
        <Route path="/admin/tag-editor" element={<AdminTagEditor />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/manage-users" element={<AdminManageUsers />} />
        <Route path="/admin/manage-db" element={<AdminManageDb />} />

        {/* Errors */}
        <Route path="*" element={<NotFound />} />
        <Route path="/db-error" element={<DbError />} />
      </Routes>
    </Router>
  );
}

export default App;
