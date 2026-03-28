import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPostFormPage from "./pages/AdminPostFormPage";

export default function App() {
  return (
    <div className="min-h-screen text-ink">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slugOrId" element={<PostDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/novo"
            element={
              <ProtectedRoute>
                <AdminPostFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/editar/:id"
            element={
              <ProtectedRoute>
                <AdminPostFormPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
