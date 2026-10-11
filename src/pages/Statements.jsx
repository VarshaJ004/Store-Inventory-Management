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

  /**
   * Universal sales reports handler to fetch from GET /api/sales
   * and process data for all report types:
   * - Daily Sales (filtered to today's date)
   * - Monthly Sales (filtered to current month)
   * - Cash Only Sales (paymentMethod === "Cash")
   * - GPay Only Sales (paymentMethod === "GPay")
   * - Category-Wise Data (revenue and volume by category)
   * - Product Sales Volume (total quantity sold per product)
   */
  const handleDownloadSalesReport = async (type) => {
    const rawType = String(type || "").toLowerCase();

    if (rawType === "1" || rawType.includes("inventory")) {
      return handleDownloadCurrentInventory();
    }
    if (rawType === "2" || rawType.includes("low")) {
      return handleDownloadLowStocks();
    }

    try {
      setDownloadingId(type);
      const res = await fetch(`${API_BASE_URL}/sales`);
      if (!res.ok) {
        throw new Error(`Failed to fetch sales: ${res.status}`);
      }
      const data = await res.json();
      const allSales = Array.isArray(data) ? data : data?.sales || data?.data || [];

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
      const currentDay = String(now.getDate()).padStart(2, "0");
      const localToday = `${currentYear}-${currentMonth}-${currentDay}`;
      const localCurrentMonth = `${currentYear}-${currentMonth}`;
      const utcToday = now.toISOString().split("T")[0];
      const utcCurrentMonth = now.toISOString().slice(0, 7);

      const getSaleDateStr = (sale) => {
        if (sale.date && typeof sale.date === "string" && sale.date.includes("-")) {
          return sale.date.trim().slice(0, 10);
        }
        if (sale.saleDate) {
          const d = new Date(sale.saleDate);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          }
        }
        if (sale.createdAt) {
          const d = new Date(sale.createdAt);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          }
        }
        return localToday;
      };

      // 4. Daily Sales
      if (rawType.includes("daily") || rawType === "4") {
        const dailySales = allSales.filter((sale) => {
          const d = getSaleDateStr(sale);
          return d === localToday || d === utcToday;
        });

        const headers = [
          "Invoice Number",
          "Date",
          "Payment Method",
          "Total Items",
          "Total Amount (₹)",
          "Items Summary",
        ];

        const rows = dailySales.map((sale) => [
          sale.invoiceNumber || sale._id,
          getSaleDateStr(sale),
          sale.paymentMethod || "Cash",
          Array.isArray(sale.items)
            ? sale.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
            : 0,
          sale.totalAmount ?? 0,
          Array.isArray(sale.items)
            ? sale.items
                .map((i) => `${i.productName || i.name || "Item"} (x${i.quantity || 1})`)
                .join("; ")
            : "",
        ]);

        downloadCSV(`FISAT_Daily_Sales_${localToday}.csv`, headers, rows);
      }
      // 3. Monthly Sales
      else if (rawType.includes("month") || rawType === "3") {
        const monthlySales = allSales.filter((sale) => {
          const d = getSaleDateStr(sale);
          return d.startsWith(localCurrentMonth) || d.startsWith(utcCurrentMonth);
        });

        const headers = [
          "Invoice Number",
          "Date",
          "Payment Method",
          "Total Items",
          "Total Amount (₹)",
          "Items Summary",
        ];

        const rows = monthlySales.map((sale) => [
          sale.invoiceNumber || sale._id,
          getSaleDateStr(sale),
          sale.paymentMethod || "Cash",
          Array.isArray(sale.items)
            ? sale.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
            : 0,
          sale.totalAmount ?? 0,
          Array.isArray(sale.items)
            ? sale.items
                .map((i) => `${i.productName || i.name || "Item"} (x${i.quantity || 1})`)
                .join("; ")
            : "",
        ]);

        downloadCSV(`FISAT_Monthly_Sales_${localCurrentMonth}.csv`, headers, rows);
      }
      // 5. Cash Only Sales
      else if (rawType.includes("cash") || rawType === "5") {
        const cashSales = allSales.filter(
          (sale) => String(sale.paymentMethod || "").trim().toLowerCase() === "cash"
        );

        const headers = [
          "Invoice Number",
          "Date",
          "Payment Method",
          "Total Items",
          "Total Amount (₹)",
          "Items Summary",
        ];

        const rows = cashSales.map((sale) => [
          sale.invoiceNumber || sale._id,
          getSaleDateStr(sale),
          "Cash",
          Array.isArray(sale.items)
            ? sale.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
            : 0,
          sale.totalAmount ?? 0,
          Array.isArray(sale.items)
            ? sale.items
                .map((i) => `${i.productName || i.name || "Item"} (x${i.quantity || 1})`)
                .join("; ")
            : "",
        ]);

        downloadCSV(`FISAT_Cash_Only_Sales_${localToday}.csv`, headers, rows);
      }
      // 6. GPay Only Sales
      else if (rawType.includes("gpay") || rawType.includes("upi") || rawType === "6") {
        const gpaySales = allSales.filter((sale) => {
          const method = String(sale.paymentMethod || "").trim().toLowerCase();
          return method === "gpay" || method === "upi";
        });

        const headers = [
          "Invoice Number",
          "Date",
          "Payment Method",
          "Total Items",
          "Total Amount (₹)",
          "Items Summary",
        ];

        const rows = gpaySales.map((sale) => [
          sale.invoiceNumber || sale._id,
          getSaleDateStr(sale),
          "GPay",
          Array.isArray(sale.items)
            ? sale.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
            : 0,
          sale.totalAmount ?? 0,
          Array.isArray(sale.items)
            ? sale.items
                .map((i) => `${i.productName || i.name || "Item"} (x${i.quantity || 1})`)
                .join("; ")
            : "",
        ]);

        downloadCSV(`FISAT_GPay_Only_Sales_${localToday}.csv`, headers, rows);
      }
      // 7. Category-Wise Data
      else if (rawType.includes("cat") || rawType === "7") {
        let productCategoryMap = {};
        try {
          const prodRes = await fetch(`${API_BASE_URL}/products`);
          if (prodRes.ok) {
            const prodList = await prodRes.json();
            if (Array.isArray(prodList)) {
              prodList.forEach((p) => {
                const id = p.productId ?? p.id;
                if (id) productCategoryMap[id] = p.category;
                if (p.name) productCategoryMap[p.name] = p.category;
              });
            }
          }
        } catch (e) {}

        const categoryMap = {};

        allSales.forEach((sale) => {
          if (Array.isArray(sale.items)) {
            sale.items.forEach((item) => {
              const cat =
                item.category ||
                productCategoryMap[item.productId] ||
                productCategoryMap[item.productName] ||
                "Stationery";
              const qty = Number(item.quantity) || 1;
              const rev = Number(
                item.amount || (item.price ? item.price * qty : 0)
              );

              if (!categoryMap[cat]) {
                categoryMap[cat] = {
                  category: cat,
                  totalVolume: 0,
                  totalRevenue: 0,
                };
              }

              categoryMap[cat].totalVolume += qty;
              categoryMap[cat].totalRevenue += rev;
            });
          }
        });

        // Ensure default categories present if no sales
        if (Object.keys(categoryMap).length === 0) {
          const defaultCats = [
            "Lab Record",
            "Notebook",
            "Pen",
            "Pencil",
            "Scale",
            "Sheet",
            "File",
            "Marker",
            "Tape",
          ];
          defaultCats.forEach((cat) => {
            categoryMap[cat] = { category: cat, totalVolume: 0, totalRevenue: 0 };
          });
        }

        const headers = [
          "Category",
          "Total Units Sold",
          "Total Sales Revenue (₹)",
        ];

        const rows = Object.values(categoryMap)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .map((cat) => [cat.category, cat.totalVolume, cat.totalRevenue]);

        downloadCSV(`FISAT_Category_Wise_Sales_${localToday}.csv`, headers, rows);
      }
      // 8. Product Sales Volume
      else if (
        rawType.includes("volume") ||
        rawType.includes("prod") ||
        rawType === "8"
      ) {
        const productMap = {};

        allSales.forEach((sale) => {
          if (Array.isArray(sale.items)) {
            sale.items.forEach((item) => {
              const key = item.productId || item.productName || item.name;
              const qty = Number(item.quantity) || 1;
              const amount = Number(
                item.amount || (item.price ? item.price * qty : 0)
              );

              if (!productMap[key]) {
                productMap[key] = {
                  productId: item.productId ?? "",
                  name: item.productName || item.name || "Product",
                  category: item.category || "",
                  price: item.price || 0,
                  totalQuantity: 0,
                  totalRevenue: 0,
                };
              }

              productMap[key].totalQuantity += qty;
              productMap[key].totalRevenue += amount;
            });
          }
        });

        // Also merge with catalogue items from /api/products
        try {
          const prodRes = await fetch(`${API_BASE_URL}/products`);
          if (prodRes.ok) {
            const prodList = await prodRes.json();
            if (Array.isArray(prodList)) {
              prodList.forEach((p) => {
                const id = p.productId ?? p.id;
                const key = id || p.name;
                if (!productMap[key]) {
                  productMap[key] = {
                    productId: id ?? "",
                    name: p.name ?? "",
                    category: p.category ?? "",
                    price: p.price ?? 0,
                    totalQuantity: Number(p.salesCount) || 0,
                    totalRevenue:
                      (Number(p.salesCount) || 0) * (Number(p.price) || 0),
                  };
                } else {
                  if (!productMap[key].category)
                    productMap[key].category = p.category;
                  if (!productMap[key].price) productMap[key].price = p.price;
                }
              });
            }
          }
        } catch (e) {}

        const headers = [
          "Product ID",
          "Item Name",
          "Category",
          "Unit Price (₹)",
          "Total Quantity Sold",
          "Total Revenue (₹)",
        ];

        const rows = Object.values(productMap)
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .map((prod) => [
            prod.productId,
            prod.name,
            prod.category,
            prod.price,
            prod.totalQuantity,
            prod.totalRevenue,
          ]);

        downloadCSV(`FISAT_Product_Sales_Volume_${localToday}.csv`, headers, rows);
      }
    } catch (err) {
      console.error(`Sales report CSV export error for ${type}:`, err);
      alert(`Error downloading sales report. Please verify that the backend is running.`);
    } finally {
      setDownloadingId(null);
    }
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
      badge: "Available",
      isLive: true,
      icon: "📅",
      description:
        "Monthly revenue summaries, completed register orders, and transaction aggregates across billing cycles.",
      action: () => handleDownloadSalesReport("monthly"),
      buttonLabel: "Download CSV",
    },
    {
      id: 4,
      title: "4. Daily Sales",
      badge: "Available",
      isLive: true,
      icon: "📊",
      description:
        "Itemized daily counter receipts, shift transaction logs, and daily gross billing totals.",
      action: () => handleDownloadSalesReport("daily"),
      buttonLabel: "Download CSV",
    },
    {
      id: 5,
      title: "5. Cash Only Sales",
      badge: "Available",
      isLive: true,
      icon: "💵",
      description:
        "All transactions fulfilled and verified strictly using physical cash payments and drawer reconciliations.",
      action: () => handleDownloadSalesReport("cash"),
      buttonLabel: "Download CSV",
    },
    {
      id: 6,
      title: "6. GPay Only Sales",
      badge: "Available",
      isLive: true,
      icon: "📱",
      description:
        "All register sales completed through UPI and Google Pay with payment reference records.",
      action: () => handleDownloadSalesReport("gpay"),
      buttonLabel: "Download CSV",
    },
    {
      id: 7,
      title: "7. Category-wise Sales & Stock",
      badge: "Available",
      isLive: true,
      icon: "🏷️",
      description:
        "Analytical distribution grouping units sold and remaining volumes across books, pens, and stationery.",
      action: () => handleDownloadSalesReport("category"),
      buttonLabel: "Download CSV",
    },
    {
      id: 8,
      title: "8. Product Sales Volume",
      badge: "Available",
      isLive: true,
      icon: "📈",
      description:
        "Popularity breakdown ranking store items by total units purchased and sales velocity.",
      action: () => handleDownloadSalesReport("volume"),
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
              disabled={downloadingId === report.id || downloadingId === report.title}
            >
              {downloadingId === report.id || downloadingId === report.title
                ? "Generating CSV..."
                : `↓ ${report.buttonLabel}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
