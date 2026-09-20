import "./Dashboard.css";

function Dashboard() {
  const dashboardData = {
    totalProducts: null,
    totalStock: null,
    todaysSales: null,
    todaysRevenue: null,
  };

  const lowStockProducts = [];
  const recentSales = [];

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <h2>FISAT</h2>
          <span>STORES</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="active">
            <span>▦</span>
            Dashboard
          </a>

          <a href="#">
            <span>▤</span>
            Inventory
          </a>

          <a href="#">
            <span>＋</span>
            Stock In
          </a>

          <a href="#">
            <span>₹</span>
            Sales
          </a>

          <a href="#">
            <span>▤</span>
            Statements
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button">
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <p className="dashboard-label">STORE MANAGEMENT</p>
            <h1>Dashboard</h1>
          </div>

          <div className="user-info">
            <div className="user-avatar">
              A
            </div>

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
              <h2>
                {dashboardData.totalProducts ?? "—"}
              </h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">▥</div>

            <div>
              <p>Total Stock</p>
              <h2>
                {dashboardData.totalStock ?? "—"}
              </h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">₹</div>

            <div>
              <p>Today's Sales</p>
              <h2>
                {dashboardData.todaysSales ?? "—"}
              </h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">₹</div>

            <div>
              <p>Today's Revenue</p>
              <h2>
                {dashboardData.todaysRevenue ?? "—"}
              </h2>
            </div>
          </div>

        </section>

        {/* Dashboard Sections */}
        <section className="dashboard-grid">

          {/* Low Stock */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">INVENTORY</p>
                <h3>Low Stock</h3>
              </div>

              <button className="panel-link">
                View All
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="empty-state">
                <span>▤</span>
                <p>No low-stock products</p>
                <small>
                  Inventory information will appear here.
                </small>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  className="product-row"
                  key={product.id}
                >
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.category}</small>
                  </div>

                  <span>
                    {product.quantity}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Recent Sales */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">TRANSACTIONS</p>
                <h3>Recent Sales</h3>
              </div>

              <button className="panel-link">
                View All
              </button>
            </div>

            {recentSales.length === 0 ? (
              <div className="empty-state">
                <span>₹</span>
                <p>No recent sales</p>
                <small>
                  Completed sales will appear here.
                </small>
              </div>
            ) : (
              recentSales.map((sale) => (
                <div
                  className="sale-row"
                  key={sale.id}
                >
                  <div>
                    <strong>{sale.product}</strong>
                    <small>{sale.paymentMethod}</small>
                  </div>

                  <strong>
                    ₹{sale.amount}
                  </strong>
                </div>
              ))
            )}
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;