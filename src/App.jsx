import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navigation from "./pages/Navigation";

// Import your page components
import Inventory from "./pages/Inventory";
import StockIn from "./pages/StockIn";
import Dashboard from "./pages/Dashboard";

// Placeholder pages for Dashboard, Sales, and Statements until implemented


const Sales = () => (
  <div style={{ padding: "40px" }}>
    <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px" }}>Sales</h1>
    <p style={{ color: "#777" }}>Billing and store transactions.</p>
  </div>
);

const Statements = () => (
  <div style={{ padding: "40px" }}>
    <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px" }}>Statements</h1>
    <p style={{ color: "#777" }}>Financial reports and statement records.</p>
  </div>
);

// Main Master Layout: Navigation stays fixed on the left, pages render on the right
function MainLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f8f6" }}>
      <Navigation />
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All main store routes wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/stock-in" element={<StockIn />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/statements" element={<Statements />} />
        </Route>

        {/* Default redirect: visits to "/" go directly to "/inventory" or "/dashboard" */}
        <Route path="/" element={<Navigate to="/inventory" replace />} />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/inventory" replace />} />
      </Routes>
    </BrowserRouter>
  );
}