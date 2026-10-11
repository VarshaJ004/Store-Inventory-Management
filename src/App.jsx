import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Navigation from "./pages/Navigation";

import Inventory from "./pages/Inventory";
import StockIn from "./pages/StockIn";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";

import Statements from "./pages/Statements";

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/inventory"
            element={<Inventory />}
          />

          <Route
            path="/stock-in"
            element={<StockIn />}
          />

          <Route
            path="/sales"
            element={<Sales />}
          />

          <Route
            path="/statements"
            element={<Statements />}
          />

        </Route>

        <Route
          path="/"
          element={
            <Navigate
              to="/inventory"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/inventory"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}