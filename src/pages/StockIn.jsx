import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StockIn.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function StockIn() {
  const navigate = useNavigate();

  const [productsList, setProductsList] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [retailerName, setRetailerName] = useState("");
  const [savedBills, setSavedBills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: "",
      quantity: "",
    },
  ]);

  // Load records from MongoDB
  const fetchRecords = () => {
    fetch(`${API_BASE_URL}/stock-in`)
      .then((res) => res.json())
      .then((data) => setSavedBills(data))
      .catch((err) => console.error("Error loading stock records:", err));
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProductsList(data))
      .catch((err) => console.error("Error loading products:", err));

    fetchRecords();
  }, []);

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const product = productsList.find(
        (p) => p.productId === Number(item.productId) || p.id === Number(item.productId)
      );
      const quantity = Number(item.quantity) || 0;
      return total + (product ? product.price * quantity : 0);
    }, 0);
  }, [items, productsList]);

  const handleProductChange = (rowId, productId) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === rowId ? { ...item, productId } : item
      )
    );
  };

  const handleQuantityChange = (rowId, quantity) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === rowId ? { ...item, quantity } : item
      )
    );
  };

  const addProductRow = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now() + Math.random(),
        productId: "",
        quantity: "",
      },
    ]);
  };

  const removeProductRow = (rowId) => {
    if (items.length === 1) return;
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== rowId)
    );
  };

  const getProduct = (productId) => {
    return productsList.find(
      (p) => p.productId === Number(productId) || p.id === Number(productId)
    );
  };

  // Add stock
  const handleAddToInventory = async () => {
    if (!date || !invoiceNumber.trim() || !retailerName.trim()) {
      alert("Please enter date, invoice number, and retailer name.");
      return;
    }

    const validItems = items.filter(
      (item) => item.productId && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please select at least one product with a valid quantity.");
      return;
    }

    const billItems = validItems.map((item) => {
      const product = getProduct(item.productId);
      const quantity = Number(item.quantity);

      return {
        productId: product.productId || product.id,
        productName: product.name,
        category: product.category,
        quantity,
        unitCost: product.price,
        amount: product.price * quantity,
      };
    });

    const billData = {
      date,
      invoiceNumber: invoiceNumber.trim(),
      retailerName: retailerName.trim(),
      products: billItems,
      totalAmount,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/stock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      if (response.ok) {
        alert("Stock added and saved in MongoDB!");
        setInvoiceNumber("");
        setRetailerName("");
        setItems([{ id: Date.now(), productId: "", quantity: "" }]);
        window.dispatchEvent(new Event("stockInUpdated"));
        navigate("/inventory");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to save stock."}`);
      }
    } catch (err) {
      console.error("Backend error:", err);
      alert("Cannot connect to server. Ensure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete invoice & revert stock
  const handleDeleteInvoice = async (billId, invoiceNo) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Invoice "${invoiceNo}"?\n\nThis will automatically deduct the added stocks back out of your Inventory.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/stock-in/${billId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Invoice deleted and inventory stock reverted successfully!");
        // Update local state immediately
        setSavedBills((prev) => prev.filter((b) => (b._id || b.id) !== billId));
        // Notify Inventory & Dashboard to update their stock numbers
        window.dispatchEvent(new Event("stockInUpdated"));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete invoice: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Could not reach server to delete invoice.");
    }
  };

  const downloadBill = (bill) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the bill.");
      return;
    }

    const rows = bill.products
      .map(
        (item, index) => `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${item.productName}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₹${item.unitCost.toLocaleString("en-IN")}</td>
            <td style="text-align: right;">₹${item.amount.toLocaleString("en-IN")}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stock In - ${bill.invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #111; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 26px; }
            .header p { margin: 5px 0; color: #666; font-size: 13px; }
            .details { margin-bottom: 25px; line-height: 1.8; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 10px; }
            th { background: #f3f3f3; text-align: left; }
            .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FISAT STORES</h1>
            <p>Stock In Record</p>
          </div>
          <div class="details">
            <strong>Date:</strong> ${new Date(bill.date).toLocaleDateString("en-IN")}<br />
            <strong>Invoice Number:</strong> ${bill.invoiceNumber}<br />
            <strong>Retailer:</strong> ${bill.retailerName}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Cost</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="total">
            Total: ₹${bill.totalAmount.toLocaleString("en-IN")}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const downloadAllBills = () => {
    if (savedBills.length === 0) {
      alert("No stock-in records available to download.");
      return;
    }
    savedBills.forEach((bill) => downloadBill(bill));
  };

  return (
    <main className="stockin-main">
      {/* Header */}
      <header className="stockin-header">
        <h1>Stock In</h1>

        <button
          type="button"
          className="download-records-btn"
          onClick={downloadAllBills}
        >
          ↓ &nbsp; Download Stock Records
        </button>
      </header>

      {/* Bill Details */}
      <section className="bill-details-card">
        <div className="form-field">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Invoice Number</label>
          <input
            type="text"
            placeholder="Enter invoice number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Retailer's Name</label>
          <input
            type="text"
            placeholder="Enter retailer name"
            value={retailerName}
            onChange={(e) => setRetailerName(e.target.value)}
          />
        </div>
      </section>

      {/* Products Table Card */}
      <section className="products-card">
        <div className="products-header">
          <h2>Products</h2>

          <button
            type="button"
            className="add-product-btn"
            onClick={addProductRow}
          >
            + Add Product
          </button>
        </div>

        <div className="product-table">
          <div className="product-table-head">
            <span>PRODUCT</span>
            <span>QUANTITY</span>
            <span>UNIT COST</span>
            <span>AMOUNT</span>
            <span></span>
          </div>

          {items.map((item) => {
            const product = getProduct(item.productId);
            const amount =
              product && Number(item.quantity)
                ? product.price * Number(item.quantity)
                : 0;

            return (
              <div className="product-row" key={item.id}>
                <select
                  value={item.productId}
                  onChange={(e) =>
                    handleProductChange(item.id, e.target.value)
                  }
                >
                  <option value="">Select product</option>
                  {productsList.map((prod) => (
                    <option
                      key={prod.productId || prod.id}
                      value={prod.productId || prod.id}
                    >
                      {prod.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                />

                <div className="calculated-value">
                  {product
                    ? `₹${product.price.toLocaleString("en-IN")}`
                    : "—"}
                </div>

                <div className="calculated-value amount">
                  ₹{amount.toLocaleString("en-IN")}
                </div>

                <button
                  type="button"
                  className="remove-product-btn"
                  onClick={() => removeProductRow(item.id)}
                  disabled={items.length === 1}
                  title="Remove product"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Total Amount */}
        <div className="bill-total">
          <span>Total Amount</span>
          <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
        </div>
      </section>

      {/* Submit Button */}
      <div className="submit-area">
        <button
          type="button"
          className="add-inventory-btn"
          onClick={handleAddToInventory}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add to Inventory"}
        </button>
      </div>

      {/* Recent Records */}
      {savedBills.length > 0 && (
        <section className="records-card">
          <div className="records-header">
            <h2>Recent Stock Records</h2>
          </div>

          <div className="records-table">
            <div className="records-table-head">
              <span>Date</span>
              <span>Invoice</span>
              <span>Retailer</span>
              <span>Products</span>
              <span>Total</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>

            {savedBills.map((bill) => {
              const billId = bill._id || bill.id;
              return (
                <div className="record-row" key={billId}>
                  <span>
                    {new Date(bill.date).toLocaleDateString("en-IN")}
                  </span>
                  <span style={{ fontWeight: "600" }}>{bill.invoiceNumber}</span>
                  <span>{bill.retailerName}</span>
                  <span>{bill.products.length} items</span>
                  <strong>
                    ₹{bill.totalAmount.toLocaleString("en-IN")}
                  </strong>

                  <div className="record-actions">
                    <button
                      type="button"
                      onClick={() => downloadBill(bill)}
                      className="record-download-btn"
                      title="Print Invoice"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteInvoice(billId, bill.invoiceNumber)}
                      className="record-delete-btn"
                      title="Delete Invoice & Revert Stock"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}