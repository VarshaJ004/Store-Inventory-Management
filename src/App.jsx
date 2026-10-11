import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Navigation from "./pages/Navigation";

import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import StockIn from "./pages/StockIn";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Statements from "./pages/Statements";
import Settings from "./pages/Settings";

function MainLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8f8f6",
      }}
    >
      <Navigation />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedLayout() {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
}

function RootRedirect() {
  const user = localStorage.getItem("user");
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Login Screen (No Sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Application Routes (With Sidebar) */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/stock-in" element={<StockIn />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/statements" element={<Statements />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Root and Fallback Navigation */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}