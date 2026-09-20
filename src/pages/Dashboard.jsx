import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE_URL = "http://localhost:5000/api";
const LOW_STOCK_LIMIT = 10;

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: [],
    todaysSales: 0,
    todaysRevenue: 0,
    recentSales: [],
  });

  // Fetch summary analytics from MongoDB
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData((prev) => ({
          ...prev,
          totalProducts: data.totalProducts || 0,
          totalStock: data.totalStock || 0,
          lowStockProducts: data.lowStockProducts || [],
        }));
      } else {
        console.error("Failed to load dashboard data from server");
      }
    } catch (err) {
      console.error("Backend error connecting to dashboard API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-update dashboard metrics whenever new stock is added
    window.addEventListener("stockInUpdated", fetchDashboardData);
    return () => {
      window.removeEventListener("stockInUpdated", fetchDashboardData);
    };
  }, []);

  const { totalProducts, totalStock, lowStockProducts, todaysSales, todaysRevenue, recentSales } = dashboardData;

  return (
    <div className="dashboard-main">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">STORE MANAGEMENT</p>
          <h1>Dashboard</h1>
        </div>

        <div className="user-info">
          <div className="user-avatar">A</div>
          <div>
            <strong>Admin</strong>
            <small>Store Manager</small>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">▤</div>
          <div>
            <p>Total Products</p>
            <h2>{loading ? "..." : totalProducts}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">▥</div>
          <div>
            <p>Total Stock</p>
            <h2>{loading ? "..." : totalStock}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">₹</div>
          <div>
            <p>Today's Sales</p>
            <h2>{todaysSales || "—"}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">₹</div>
          <div>
            <p>Today's Revenue</p>
            <h2>₹{todaysRevenue.toLocaleString("en-IN")}</h2>
          </div>
        </div>
      </section>

      {/* Dashboard Panels Grid */}
      <section className="dashboard-grid">
        {/* Low Stock Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">INVENTORY</p>
              <h3>Low Stock Alert ({lowStockProducts.length})</h3>
            </div>

            <button
              type="button"
              className="panel-link"
              onClick={() => navigate("/inventory")}
            >
              View All &rarr;
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading low stock alerts...</p>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="empty-state">
              <span>✓</span>
              <p>All items well stocked</p>
              <small>No products below the {LOW_STOCK_LIMIT} threshold.</small>
            </div>
          ) : (
            <div className="panel-list">
              {lowStockProducts.slice(0, 6).map((product) => {
                const currentId = product.productId || product.id;
                const stockCount = Number(product.stock || 0);

                return (
                  <div className="product-row" key={currentId}>
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.category}</small>
                    </div>
                    <span className={`stock-badge ${stockCount === 0 ? "out" : "low"}`}>
                      {stockCount === 0 ? "Out of Stock" : `${stockCount} left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sales Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">TRANSACTIONS</p>
              <h3>Recent Sales</h3>
            </div>

            <button
              type="button"
              className="panel-link"
              onClick={() => navigate("/sales")}
            >
              View All &rarr;
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="empty-state">
              <span>₹</span>
              <p>No recent sales</p>
              <small>Completed billing transactions will appear here.</small>
            </div>
          ) : (
            <div className="panel-list">
              {recentSales.map((sale) => (
                <div className="sale-row" key={sale.id}>
                  <div>
                    <strong>{sale.product}</strong>
                    <small>{sale.paymentMethod}</small>
                  </div>
                  <strong>₹{sale.amount}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;