import { NavLink, useNavigate } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="navigation">
      <div className="navigation-brand">
        <h2>FISAT</h2>
        <span>STORES</span>
      </div>

      <nav className="navigation-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `navigation-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">▦</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `navigation-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">▤</span>
          <span>Inventory</span>
        </NavLink>

        <NavLink
          to="/stock-in"
          className={({ isActive }) =>
            `navigation-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">＋</span>
          <span>Stock In</span>
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `navigation-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">₹</span>
          <span>Sales</span>
        </NavLink>

        <NavLink
          to="/statements"
          className={({ isActive }) =>
            `navigation-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">▤</span>
          <span>Statements</span>
        </NavLink>
      </nav>

      <div className="navigation-bottom">
        <button
          type="button"
          className="navigation-item logout-button"
          onClick={handleLogout}
        >
          <span className="nav-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Navigation;