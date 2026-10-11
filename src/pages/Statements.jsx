import { useState } from "react";
import "./Statements.css";

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Helper function to generate and trigger download of a formatted CSV file
 */
function downloadCSV(filename, headers, rows) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ];

  const blob = new Blob([csvRows.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Statements() {
  const [downloadingId, setDownloadingId] = useState(null);

  // 1. Current Inventory Report
  const handleDownloadCurrentInventory = async () => {
    try {
      setDownloadingId(1);
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      const data = await res.json();
      const products = Array.isArray(data) ? data : data?.products || data?.data || [];

      const headers = [
        "Product ID",
        "Item Name",
        "Category",
        "Unit Price (₹)",
        "In Stock",
        "Total Sold",
      ];

      const rows = products.map((item) => [
        item.productId ?? item.id ?? "",
        item.name ?? "",
        item.category ?? "",
        item.price ?? 0,
        item.stock ?? 0,
        item.salesCount ?? 0,
      ]);

      const dateStr = new Date().toISOString().split("T")[0];
      downloadCSV(`FISAT_Current_Inventory_${dateStr}.csv`, headers, rows);
    } catch (err) {
      console.error("Current Inventory CSV generation failed:", err);
      alert("Error generating Current Inventory CSV. Please check that the backend server is running.");
    } finally {
      setDownloadingId(null);
    }
  };

  // 2. Low Stocks Report (Stock <= 10)
  const handleDownloadLowStocks = async () => {
    try {
      setDownloadingId(2);
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      const data = await res.json();
      const products = Array.isArray(data) ? data : data?.products || data?.data || [];

      const lowStockProducts = products.filter(
        (item) => Number(item.stock || 0) <= 10
      );

      const headers = [
        "Product ID",
        "Item Name",
        "Category",
        "Unit Price (₹)",
        "Remaining Stock",
        "Stock Status",
      ];

      const rows = lowStockProducts.map((item) => [
        item.productId ?? item.id ?? "",
        item.name ?? "",
        item.category ?? "",
        item.price ?? 0,
        item.stock ?? 0,
        Number(item.stock || 0) <= 0 ? "Out of Stock" : "Low Stock (<=10)",
      ]);

      const dateStr = new Date().toISOString().split("T")[0];
      downloadCSV(`FISAT_Low_Stocks_${dateStr}.csv`, headers, rows);
    } catch (err) {
      console.error("Low Stocks CSV generation failed:", err);
      alert("Error generating Low Stocks CSV. Please check that the backend server is running.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Remaining Sales Reports Alert
  const handlePendingReport = (reportTitle) => {
    alert("Backend sales endpoint is pending.");
  };

  const reportCards = [
    {
      id: 1,
      title: "1. Current Inventory",
      badge: "Available",
      isLive: true,
      icon: "📦",
      description:
        "Full list of store inventory with item titles, categories, unit prices, and active on-hand quantities.",
      action: handleDownloadCurrentInventory,
      buttonLabel: "Download CSV",
    },
    {
      id: 2,
      title: "2. Low Stocks",
      badge: "Available",
      isLive: true,
      icon: "⚠️",
      description:
        "Filtered inventory report showing items with 10 or fewer units in stock requiring restocking.",
      action: handleDownloadLowStocks,
      buttonLabel: "Download CSV",
    },
    {
      id: 3,
      title: "3. Monthly Sales",
      badge: "Pending",
      isLive: false,
      icon: "📅",
      description:
        "Monthly revenue summaries, completed register orders, and transaction aggregates across billing cycles.",
      action: () => handlePendingReport("Monthly Sales"),
      buttonLabel: "Download CSV",
    },
    {
      id: 4,
      title: "4. Daily Sales",
      badge: "Pending",
      isLive: false,
      icon: "📊",
      description:
        "Itemized daily counter receipts, shift transaction logs, and daily gross billing totals.",
      action: () => handlePendingReport("Daily Sales"),
      buttonLabel: "Download CSV",
    },
    {
      id: 5,
      title: "5. Cash Only Sales",
      badge: "Pending",
      isLive: false,
      icon: "💵",
      description:
        "All transactions fulfilled and verified strictly using physical cash payments and drawer reconciliations.",
      action: () => handlePendingReport("Cash Only Sales"),
      buttonLabel: "Download CSV",
    },
    {
      id: 6,
      title: "6. GPay Only Sales",
      badge: "Pending",
      isLive: false,
      icon: "📱",
      description:
        "All register sales completed through UPI and Google Pay with payment reference records.",
      action: () => handlePendingReport("GPay Only Sales"),
      buttonLabel: "Download CSV",
    },
    {
      id: 7,
      title: "7. Category-wise Sales & Stock",
      badge: "Pending",
      isLive: false,
      icon: "🏷️",
      description:
        "Analytical distribution grouping units sold and remaining volumes across books, pens, and stationery.",
      action: () => handlePendingReport("Category-wise Sales & Stock"),
      buttonLabel: "Download CSV",
    },
    {
      id: 8,
      title: "8. Product Sales Volume",
      badge: "Pending",
      isLive: false,
      icon: "📈",
      description:
        "Popularity breakdown ranking store items by total units purchased and sales velocity.",
      action: () => handlePendingReport("Product Sales Volume"),
      buttonLabel: "Download CSV",
    },
  ];

  return (
    <div className="statements-main">
      {/* Header */}
      <header className="statements-header">
        <div>
          <p className="statements-label">STORE MANAGEMENT</p>
          <h1>Statements & Reports</h1>
          <p className="statements-subtitle">
            Generate and export CSV reports for inventory counts, stock alerts, and financial sales statements.
          </p>
        </div>
      </header>

      {/* Grid of 8 Report Cards */}
      <div className="statements-grid">
        {reportCards.map((report) => (
          <div className="statement-card" key={report.id}>
            <div>
              <div className="statement-card-top">
                <div className="statement-icon">{report.icon}</div>
                <span
                  className={`statement-badge ${
                    report.isLive ? "live" : "pending"
                  }`}
                >
                  {report.badge}
                </span>
              </div>

              <div className="statement-card-body">
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>
            </div>

            <button
              type="button"
              className={`statement-btn ${report.isLive ? "live" : "pending"}`}
              onClick={report.action}
              disabled={downloadingId === report.id}
            >
              {downloadingId === report.id ? "Generating CSV..." : `↓ ${report.buttonLabel}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
