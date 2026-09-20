import { useState, useMemo } from "react";

const initialProducts = [
  { id: 1, name: "Rough Record-without graph", category: "Lab Record", price: 50, stock: 4 },
  { id: 2, name: "Rough Record - with graph", category: "Lab Record", price: 60, stock: 0 },
  { id: 3, name: "Highlighter", category: "Highlighter", price: 20, stock: 15 },
  { id: 4, name: "Carbon Paper", category: "Carbon Paper", price: 3, stock: 25 },
  { id: 5, name: "CD", category: "CD", price: 12, stock: 8 },
  { id: 6, name: "CD Cover", category: "CD Cover", price: 2, stock: 50 },
  { id: 7, name: "Clutch-Compass-Pen", category: "Compass", price: 40, stock: 2 },
  { id: 8, name: "Drawing Sheet", category: "Sheet", price: 6, stock: 40 },
  { id: 9, name: "DVD", category: "DVD", price: 15, stock: 0 },
  { id: 10, name: "Notebook Crown", category: "Notebook", price: 60, stock: 18 },
  { id: 11, name: "A4-size Notebook", category: "Notebook", price: 65, stock: 5 },
  { id: 12, name: "Ruled Long-Notebook", category: "Notebook", price: 70, stock: 20 },
  { id: 13, name: "Lab-record - without graph", category: "Lab Record", price: 95, stock: 14 },
  { id: 14, name: "Lab Record - with graph", category: "Lab Record", price: 95, stock: 3 },
  { id: 15, name: "Assigment Record Low Stock", category: "Lab Record", price: 20, stock: 0 },
  { id: 16, name: "Physics Lab manual Low Stock", category: "Lab Record", price: 70, stock: 2 },
  { id: 17, name: "Chemistry lab manual", category: "Lab Record", price: 70, stock: 12 },
  { id: 18, name: "Band aid", category: "Band Aid", price: 2, stock: 80 },
  { id: 19, name: "Calculater Es plus", category: "Calculator", price: 1500, stock: 1 },
  { id: 20, name: "Double side Tape", category: "Tape", price: 10, stock: 15 },
  { id: 21, name: "Tape small", category: "Tape", price: 5, stock: 6 },
  { id: 22, name: "Gum Fevi Stick", category: "Gum", price: 15, stock: 22 },
  { id: 23, name: "Fevi-Gum", category: "Gum", price: 5, stock: 4 },
  { id: 24, name: "Gum Low Stock", category: "Gum", price: 10, stock: 0 },
  { id: 25, name: "Pinpoint Pen", category: "Pen", price: 10, stock: 35 },
  { id: 26, name: "Lexi Pen", category: "Pen", price: 5, stock: 50 },
  { id: 27, name: "Claro Pen", category: "Pen", price: 4, stock: 9 },
  { id: 28, name: "Correction Pen", category: "Pen", price: 20, stock: 12 },
  { id: 29, name: "PaperSoft-Pen", category: "Pen", price: 20, stock: 0 },
  { id: 30, name: "HB-Pencil", category: "Pencil", price: 10, stock: 30 },
  { id: 31, name: "Clutch-Pencil", category: "Pencil", price: 10, stock: 7 },
  { id: 32, name: "Clutch-Pencil-15", category: "Pencil", price: 15, stock: 16 },
  { id: 33, name: "Scale", category: "Scale", price: 5, stock: 40 },
  { id: 34, name: "Long Scale", category: "Scale", price: 12, stock: 15 },
  { id: 35, name: "Sharpner", category: "Sharpener", price: 3, stock: 8 },
  { id: 36, name: "Eraser", category: "Eraser", price: 3, stock: 45 },
  { id: 37, name: "Stick File", category: "File", price: 15, stock: 24 },
  { id: 38, name: "File Folder", category: "File", price: 15, stock: 18 },
  { id: 39, name: "Graph Sheet", category: "Sheet", price: 1, stock: 120 },
  { id: 40, name: "Semi-log Sheet", category: "Sheet", price: 1, stock: 6 },
  { id: 41, name: "Lead", category: "Lead", price: 5, stock: 25 },
  { id: 42, name: "Protracter", category: "Protractor", price: 10, stock: 10 },
  { id: 43, name: "Pen-Knife Low Stock", category: "Pen-Knife", price: 5, stock: 2 },
  { id: 44, name: "Pro-Circle", category: "Pro-circle", price: 20, stock: 14 },
  { id: 45, name: "Roll-N-Draw", category: "Roll-N-Draw", price: 50, stock: 3 },
  { id: 46, name: "CD Marker Low Stock", category: "Marker", price: 10, stock: 0 },
  { id: 47, name: "Permanent Marker Low Stock", category: "Marker", price: 20, stock: 5 },
  { id: 48, name: "A4-Paper", category: "A4-Paper", price: 1, stock: 500 },
  { id: 49, name: "Plastic-parts", category: "Plastic parts", price: 20, stock: 8 },
  { id: 50, name: "Lexi-Refill", category: "Refill", price: 4, stock: 40 },
  { id: 51, name: "FlowGel-Refill", category: "Refill", price: 5, stock: 30 },
  { id: 52, name: "PinPoint-Refill", category: "Refill", price: 5, stock: 0 },
  { id: 53, name: "Griper-Refill", category: "Refill", price: 4, stock: 15 },
  { id: 54, name: "Engineering Compass", category: "Compass", price: 60, stock: 9 },
  { id: 55, name: "Compass-Led", category: "Compass", price: 4, stock: 25 },
  { id: 56, name: "Mini Drafter", category: "Mini Drafter", price: 450, stock: 3 },
  { id: 57, name: "Tennis Ball", category: "Tennis Ball", price: 70, stock: 12 }
];

const LOW_STOCK_LIMIT = 10;

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [viewMode, setViewMode] = useState("cards");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(initialProducts.map((p) => p.category)))];
  }, []);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesLowStock = !onlyLowStock || product.stock <= LOW_STOCK_LIMIT;
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [search, category, onlyLowStock]);

  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    });
    return groups;
  }, [filteredProducts]);

  const totalLowStockCount = useMemo(() => {
    return initialProducts.filter((p) => p.stock <= LOW_STOCK_LIMIT).length;
  }, []);

  const triggerPdfDownload = (targetItems, title) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the PDF report.");
      return;
    }

    const rowsHtml = targetItems
      .map((item, index) => {
        const isLow = item.stock <= LOW_STOCK_LIMIT;
        return `
          <tr style="${isLow ? "background-color: #fee2e2; color: #991b1b; font-weight: 600;" : ""}">
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.category}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toLocaleString("en-IN")}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              ${item.stock} ${item.stock === 0 ? "(Out of stock)" : isLow ? "(Low stock)" : ""}
            </td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - FISAT STORES</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #111; }
            .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 18px; }
            h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
            .subtitle { font-size: 12px; color: #666; margin: 4px 0 0; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; padding: 10px; background: #f3f4f6; border-bottom: 2px solid #d1d5db; text-transform: uppercase; font-size: 11px; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>FISAT STORES</h1>
              <p class="subtitle">${title} &bull; Generated on ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
            </div>
            <div style="font-size: 13px; text-align: right;">
              Total Items: <strong>${targetItems.length}</strong>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Product Name</th>
                <th>Category</th>
                <th style="text-align: right; width: 100px;">Price</th>
                <th style="text-align: center; width: 130px;">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fisat-layout">
      <style>{`
        .fisat-layout {
          display: flex;
          min-height: 100vh;
          background: #f6f6f4;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
        }
        .fisat-layout * {
          box-sizing: border-box;
        }

        /* Sidebar */
        .fisat-sidebar {
          width: 240px;
          background: #111;
          color: #fff;
          padding: 32px 18px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .fisat-logo {
          padding: 0 10px;
          margin-bottom: 40px;
        }
        .fisat-logo h2 {
          margin: 0;
          font-size: 24px;
          letter-spacing: 2px;
          font-weight: 700;
        }
        .fisat-logo span {
          font-size: 10px;
          letter-spacing: 3px;
          color: #888;
        }
        .fisat-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .fisat-nav a {
          color: #888;
          text-decoration: none;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }
        .fisat-nav a:hover {
          background: #222;
          color: #fff;
        }
        .fisat-nav a.active {
          background: #fff;
          color: #111;
          font-weight: 600;
        }
        .fisat-logout {
          margin-top: auto;
          background: none;
          border: none;
          color: #888;
          padding: 12px 14px;
          text-align: left;
          font-size: 13px;
          cursor: pointer;
          border-radius: 8px;
        }
        .fisat-logout:hover {
          background: #222;
          color: #fff;
        }

        /* Main Area */
        .fisat-main {
          flex: 1;
          padding: 35px 45px;
          min-width: 0;
        }

        /* Top Header */
        .fisat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .fisat-title {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .fisat-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-download-low {
          height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .btn-download-low:hover {
          background: #fee2e2;
        }
        .low-badge-count {
          background: #dc2626;
          color: #fff;
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 10px;
          font-weight: 700;
        }
        .btn-download-all {
          height: 40px;
          padding: 0 18px;
          border-radius: 8px;
          border: 1px solid #111;
          background: #111;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .btn-download-all:hover {
          background: #2b2b2b;
        }

        /* Controls */
        .fisat-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }
        .controls-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 320px;
        }
        .search-box {
          height: 42px;
          background: #fff;
          border: 1px solid #dededb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          flex: 1;
          max-width: 320px;
        }
        .search-box span {
          color: #888;
          font-size: 18px;
          margin-right: 8px;
        }
        .search-box input {
          border: none;
          outline: none;
          font-size: 13px;
          width: 100%;
          background: transparent;
        }
        .category-dropdown {
          height: 42px;
          border: 1px solid #dededb;
          background: #fff;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 13px;
          outline: none;
          min-width: 170px;
        }
        .btn-low-toggle {
          height: 42px;
          padding: 0 14px;
          background: #fff;
          border: 1px solid #dededb;
          border-radius: 8px;
          font-size: 13px;
          color: #555;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .btn-low-toggle .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f87171;
        }
        .btn-low-toggle.active {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #991b1b;
          font-weight: 600;
        }
        .btn-low-toggle.active .dot {
          background: #dc2626;
        }

        /* View Mode Switcher */
        .view-switcher {
          display: flex;
          background: #eaeae7;
          padding: 3px;
          border-radius: 8px;
          gap: 2px;
        }
        .switch-btn {
          border: none;
          background: transparent;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          cursor: pointer;
        }
        .switch-btn.active {
          background: #fff;
          color: #111;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        /* Cards Layout */
        .categories-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .cat-group-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #e5e5e0;
          padding-bottom: 6px;
        }
        .cat-group-header h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: #222;
        }
        .cat-counter {
          font-size: 11px;
          background: #eaeae6;
          color: #666;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 14px;
        }
        .p-card {
          background: #fff;
          border: 1px solid #e8e8e4;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 130px;
        }
        .p-card.is-low-stock {
          background: #fef2f2 !important;
          border-color: #fca5a5 !important;
        }
        .p-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .p-card-id {
          font-size: 11px;
          color: #999;
          font-weight: 500;
        }
        .p-card.is-low-stock .p-card-id {
          color: #b91c1c;
        }
        .p-card-name {
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 16px;
          line-height: 1.35;
          color: #1a1a1a;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .p-card.is-low-stock .p-card-name {
          color: #7f1d1d;
        }
        .p-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid #f1f1ed;
          padding-top: 10px;
        }
        .p-card.is-low-stock .p-card-bottom {
          border-top-color: #fecaca;
        }
        .p-card-price {
          font-size: 15px;
          font-weight: 700;
          color: #111;
        }
        .p-card.is-low-stock .p-card-price {
          color: #991b1b;
        }
        .p-card-stock {
          text-align: right;
          display: flex;
          flex-direction: column;
        }
        .p-card-stock label {
          font-size: 9px;
          text-transform: uppercase;
          color: #888;
          letter-spacing: 0.5px;
        }
        .p-card.is-low-stock .p-card-stock label {
          color: #b91c1c;
        }
        .p-card-stock span {
          font-size: 13px;
          font-weight: 700;
          color: #222;
        }
        .p-card.is-low-stock .p-card-stock span {
          color: #dc2626;
        }
        .tag {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 7px;
          border-radius: 5px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .tag-ok {
          background: #ecfdf5;
          color: #065f46;
        }
        .tag-danger {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
        }

        /* Table Layout */
        .table-wrap {
          background: #fff;
          border: 1px solid #e5e5e2;
          border-radius: 12px;
          overflow-x: auto;
        }
        .fisat-table {
          width: 100%;
          border-collapse: collapse;
        }
        .fisat-table thead {
          background: #fafaf8;
        }
        .fisat-table th {
          padding: 14px 18px;
          text-align: left;
          font-size: 11px;
          color: #777;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
          border-bottom: 1px solid #e8e8e5;
        }
        .fisat-table td {
          padding: 14px 18px;
          border-bottom: 1px solid #eeeeeb;
          font-size: 13px;
        }
        .fisat-table tr.row-danger {
          background: #fef2f2 !important;
        }
        .fisat-table tr.row-danger td {
          border-bottom-color: #fecaca;
        }
        .cat-pill {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 5px;
          background: #f2f2f0;
          color: #555;
          font-size: 11px;
        }
        .fisat-footer {
          margin: 16px 2px 0;
          color: #888;
          font-size: 12px;
        }
        .empty-box {
          padding: 50px 20px;
          text-align: center;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e5e2;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="fisat-sidebar">
        <div className="fisat-logo">
          <h2>FISAT</h2>
          <span>STORES</span>
        </div>

        <nav className="fisat-nav">
          <a href="#dashboard">▦ <span>Dashboard</span></a>
          <a href="#inventory" className="active">▤ <span>Inventory</span></a>
          <a href="#stockin">＋ <span>Stock In</span></a>
          <a href="#sales">₹ <span>Sales</span></a>
          <a href="#statements">▤ <span>Statements</span></a>
        </nav>

        <button className="fisat-logout" type="button">
          ↪ &nbsp; Logout
        </button>
      </aside>

      {/* Main Container */}
      <main className="fisat-main">
        {/* Clean Header */}
        <header className="fisat-header">
          <h1 className="fisat-title">Inventory</h1>

          <div className="fisat-actions">
            <button
              type="button"
              className="btn-download-low"
              onClick={() =>
                triggerPdfDownload(
                  initialProducts.filter((p) => p.stock <= LOW_STOCK_LIMIT),
                  "Low Stock Items Report"
                )
              }
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
              <span>Download Low Stock</span>
              <span className="low-badge-count">{totalLowStockCount}</span>
            </button>

            <button
              type="button"
              className="btn-download-all"
              onClick={() => triggerPdfDownload(initialProducts, "Full Inventory Report")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Download Current Inventory</span>
            </button>
          </div>
        </header>

        {/* Filter Controls */}
        <section className="fisat-controls">
          <div className="controls-group">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-dropdown"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={`btn-low-toggle ${onlyLowStock ? "active" : ""}`}
              onClick={() => setOnlyLowStock(!onlyLowStock)}
            >
              <span className="dot" />
              Low Stock Only ({totalLowStockCount})
            </button>
          </div>

          <div className="view-switcher">
            <button
              type="button"
              className={`switch-btn ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </button>
            <button
              type="button"
              className={`switch-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
          </div>
        </section>

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="categories-container">
            {Object.keys(groupedProducts).length > 0 ? (
              Object.entries(groupedProducts).map(([catTitle, items]) => (
                <div key={catTitle}>
                  <div className="cat-group-header">
                    <h2>{catTitle}</h2>
                    <span className="cat-counter">{items.length} items</span>
                  </div>

                  <div className="cards-grid">
                    {items.map((item) => {
                      const isLowStock = item.stock <= LOW_STOCK_LIMIT;
                      return (
                        <div
                          key={item.id}
                          className={`p-card ${isLowStock ? "is-low-stock" : ""}`}
                        >
                          <div className="p-card-top">
                            <span className="p-card-id">#{item.id}</span>
                            {isLowStock ? (
                              <span className="tag tag-danger">
                                {item.stock === 0 ? "Out of Stock" : `Low: ${item.stock} left`}
                              </span>
                            ) : (
                              <span className="tag tag-ok">In Stock</span>
                            )}
                          </div>

                          <h3 className="p-card-name" title={item.name}>{item.name}</h3>

                          <div className="p-card-bottom">
                            <div className="p-card-price">₹{item.price.toLocaleString("en-IN")}</div>
                            <div className="p-card-stock">
                              <label>Stock</label>
                              <span>{item.stock}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-box">
                <h3>No products found</h3>
                <p style={{ color: "#888", fontSize: "13px" }}>
                  Try changing your search keywords or resetting the category filter.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="table-wrap">
            <table className="fisat-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "center" }}>Current Stock</th>
                  <th style={{ textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const isLow = product.stock <= LOW_STOCK_LIMIT;
                  return (
                    <tr key={product.id} className={isLow ? "row-danger" : ""}>
                      <td style={{ color: "#888" }}>{index + 1}</td>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td>
                        <span className="cat-pill">{product.category}</span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>
                        {product.stock}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {isLow ? (
                          <span className="tag tag-danger">
                            {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                          </span>
                        ) : (
                          <span className="tag tag-ok">In Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="empty-box">
                <h3>No products found</h3>
              </div>
            )}
          </div>
        )}

        <p className="fisat-footer">
          Showing {filteredProducts.length} of {initialProducts.length} items
        </p>
      </main>
    </div>
  );
}