import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import Categories from "../pages/Categories/List";
import TransactionsList from "../pages/Transactions/List";
import TransactionForm from "../pages/Transactions/TransactionForm";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";
import AdminUsers from "../pages/AdminUsers";
import Dashboard from "../pages/Dashboard";
import { useAuth } from "../context/AuthContext";
import { Outlet } from "react-router-dom";

function AdminRoute() {
  const { user } = useAuth();
  return user?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsList />} />
        <Route path="/transactions/new" element={<TransactionForm />} />
        <Route path="/transactions/:id/edit" element={<TransactionForm />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/profile" element={<Profile />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
