import { useMemo, useState } from "react";
import "./StockIn.css";

// Product master data.
// Current stock will come from the backend later.
const products = [
  { id: 1, name: "Rough Record-without graph", category: "Lab Record", price: 50 },
  { id: 2, name: "Rough Record - with graph", category: "Lab Record", price: 60 },
  { id: 3, name: "Highlighter", category: "Highlighter", price: 20 },
  { id: 4, name: "Carbon Paper", category: "Carbon Paper", price: 3 },
  { id: 5, name: "CD", category: "CD", price: 12 },
  { id: 6, name: "CD Cover", category: "CD Cover", price: 2 },
  { id: 7, name: "Clutch-Compass-Pen", category: "Compass", price: 40 },
  { id: 8, name: "Drawing Sheet", category: "Sheet", price: 6 },
  { id: 9, name: "DVD", category: "DVD", price: 15 },
  { id: 10, name: "Notebook Crown", category: "Notebook", price: 60 },
  { id: 11, name: "A4-size Notebook", category: "Notebook", price: 65 },
  { id: 12, name: "Ruled Long-Notebook", category: "Notebook", price: 70 },
  { id: 13, name: "Lab-record - without graph", category: "Lab Record", price: 95 },
  { id: 14, name: "Lab Record - with graph", category: "Lab Record", price: 95 },
  { id: 15, name: "Assigment Record Low Stock", category: "Lab Record", price: 20 },
  { id: 16, name: "Physics Lab manual Low Stock", category: "Lab Record", price: 70 },
  { id: 17, name: "Chemistry lab manual", category: "Lab Record", price: 70 },
  { id: 18, name: "Band aid", category: "Band Aid", price: 2 },
  { id: 19, name: "Calculater Es plus", category: "Calculator", price: 1500 },
  { id: 20, name: "Double side Tape", category: "Tape", price: 10 },
  { id: 21, name: "Tape small", category: "Tape", price: 5 },
  { id: 22, name: "Gum Fevi Stick", category: "Gum", price: 15 },
  { id: 23, name: "Fevi-Gum", category: "Gum", price: 5 },
  { id: 24, name: "Gum Low Stock", category: "Gum", price: 10 },
  { id: 25, name: "Pinpoint Pen", category: "Pen", price: 10 },
  { id: 26, name: "Lexi Pen", category: "Pen", price: 5 },
  { id: 27, name: "Claro Pen", category: "Pen", price: 4 },
  { id: 28, name: "Correction Pen", category: "Pen", price: 20 },
  { id: 29, name: "PaperSoft-Pen", category: "Pen", price: 20 },
  { id: 30, name: "HB-Pencil", category: "Pencil", price: 10 },
  { id: 31, name: "Clutch-Pencil", category: "Pencil", price: 10 },
  { id: 32, name: "Clutch-Pencil-15", category: "Pencil", price: 15 },
  { id: 33, name: "Scale", category: "Scale", price: 5 },
  { id: 34, name: "Long Scale", category: "Scale", price: 12 },
  { id: 35, name: "Sharpner", category: "Sharpener", price: 3 },
  { id: 36, name: "Eraser", category: "Eraser", price: 3 },
  { id: 37, name: "Stick File", category: "File", price: 15 },
  { id: 38, name: "File Folder", category: "File", price: 15 },
  { id: 39, name: "Graph Sheet", category: "Sheet", price: 1 },
  { id: 40, name: "Semi-log Sheet", category: "Sheet", price: 1 },
  { id: 41, name: "Lead", category: "Lead", price: 5 },
  { id: 42, name: "Protracter", category: "Protractor", price: 10 },
  { id: 43, name: "Pen-Knife Low Stock", category: "Pen-Knife", price: 5 },
  { id: 44, name: "Pro-Circle", category: "Pro-circle", price: 20 },
  { id: 45, name: "Roll-N-Draw", category: "Roll-N-Draw", price: 50 },
  { id: 46, name: "CD Marker Low Stock", category: "Marker", price: 10 },
  { id: 47, name: "Permanent Marker Low Stock", category: "Marker", price: 20 },
  { id: 48, name: "A4-Paper", category: "A4-Paper", price: 1 },
  { id: 49, name: "Plastic-parts", category: "Plastic parts", price: 20 },
  { id: 50, name: "Lexi-Refill", category: "Refill", price: 4 },
  { id: 51, name: "FlowGel-Refill", category: "Refill", price: 5 },
  { id: 52, name: "PinPoint-Refill", category: "Refill", price: 5 },
  { id: 53, name: "Griper-Refill", category: "Refill", price: 4 },
  { id: 54, name: "Engineering Compass", category: "Compass", price: 60 },
  { id: 55, name: "Compass-Led", category: "Compass", price: 4 },
  { id: 56, name: "Mini Drafter", category: "Mini Drafter", price: 450 },
  { id: 57, name: "Tennis Ball", category: "Tennis Ball", price: 70 },
];

export default function StockIn() {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [retailerName, setRetailerName] = useState("");

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: "",
      quantity: "",
    },
  ]);

  const [savedBills, setSavedBills] = useState([]);

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const product = products.find(
        (product) => product.id === Number(item.productId)
      );

      const quantity = Number(item.quantity) || 0;

      return total + (product ? product.price * quantity : 0);
    }, 0);
  }, [items]);

  const handleProductChange = (rowId, productId) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === rowId
          ? {
              ...item,
              productId,
            }
          : item
      )
    );
  };

  const handleQuantityChange = (rowId, quantity) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === rowId
          ? {
              ...item,
              quantity,
            }
          : item
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
    return products.find(
      (product) => product.id === Number(productId)
    );
  };

  const handleAddToInventory = () => {
    if (!date || !invoiceNumber.trim() || !retailerName.trim()) {
      alert("Please enter date, invoice number and retailer name.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.productId &&
        Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    const billItems = validItems.map((item) => {
      const product = getProduct(item.productId);
      const quantity = Number(item.quantity);

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity,
        unitCost: product.price,
        amount: product.price * quantity,
      };
    });

    const bill = {
      id: Date.now(),
      date,
      invoiceNumber: invoiceNumber.trim(),
      retailerName: retailerName.trim(),
      products: billItems,
      totalAmount,
    };

    /*
      LATER:
      This exact bill object will be sent to the backend.

      Example:

      await fetch("/api/stock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bill),
      });

      Backend will:
      1. Save this stock-in bill.
      2. Increase current stock for each product.
      3. Inventory page will fetch the updated stock.
    */

    setSavedBills((currentBills) => [
      bill,
      ...currentBills,
    ]);

    alert("Stock-in bill prepared successfully.");

    setInvoiceNumber("");
    setRetailerName("");
    setItems([
      {
        id: Date.now(),
        productId: "",
        quantity: "",
      },
    ]);
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
            <td>${index + 1}</td>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>₹${item.unitCost.toLocaleString("en-IN")}</td>
            <td>₹${item.amount.toLocaleString("en-IN")}</td>
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
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #111;
            }

            .header {
              text-align: center;
              margin-bottom: 30px;
            }

            .header h1 {
              margin: 0;
              font-size: 26px;
            }

            .header p {
              margin: 5px 0;
              color: #666;
            }

            .details {
              margin-bottom: 25px;
              line-height: 1.8;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 10px;
            }

            th {
              background: #f3f3f3;
              text-align: left;
            }

            .total {
              text-align: right;
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>

          <div class="header">
            <h1>FISAT STORES</h1>
            <p>Stock In Record</p>
          </div>

          <div class="details">
            <strong>Date:</strong> ${new Date(
              bill.date
            ).toLocaleDateString("en-IN")}
            <br />

            <strong>Invoice Number:</strong>
            ${bill.invoiceNumber}
            <br />

            <strong>Retailer:</strong>
            ${bill.retailerName}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
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
      alert("No stock-in records available.");
      return;
    }

    savedBills.forEach((bill) => {
      downloadBill(bill);
    });
  };

  return (
    <div className="stockin-layout">

      {/* Sidebar */}
      <aside className="stockin-sidebar">

        <div className="stockin-logo">
          <h2>FISAT</h2>
          <span>STORES</span>
        </div>

        <nav className="stockin-nav">
          <a href="#dashboard">
            ▦ <span>Dashboard</span>
          </a>

          <a href="#inventory">
            ▤ <span>Inventory</span>
          </a>

          <a
            href="#stockin"
            className="active"
          >
            ＋ <span>Stock In</span>
          </a>

          <a href="#sales">
            ₹ <span>Sales</span>
          </a>

          <a href="#statements">
            ▤ <span>Statements</span>
          </a>
        </nav>

        <button
          className="stockin-logout"
          type="button"
        >
          ↪ &nbsp; Logout
        </button>

      </aside>

      {/* Main */}
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
              onChange={(e) =>
                setInvoiceNumber(e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Retailer's Name</label>

            <input
              type="text"
              placeholder="Enter retailer name"
              value={retailerName}
              onChange={(e) =>
                setRetailerName(e.target.value)
              }
            />
          </div>

        </section>

        {/* Products */}
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
              <span>Product</span>
              <span>Quantity</span>
              <span>Unit Cost</span>
              <span>Amount</span>
              <span></span>
            </div>

            {items.map((item) => {

              const product = getProduct(
                item.productId
              );

              const amount =
                product && Number(item.quantity)
                  ? product.price *
                    Number(item.quantity)
                  : 0;

              return (
                <div
                  className="product-row"
                  key={item.id}
                >

                  <select
                    value={item.productId}
                    onChange={(e) =>
                      handleProductChange(
                        item.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select product
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.id,
                        e.target.value
                      )
                    }
                  />

                  <div className="calculated-value">
                    {product
                      ? `₹${product.price.toLocaleString(
                          "en-IN"
                        )}`
                      : "—"}
                  </div>

                  <div className="calculated-value amount">
                    ₹{amount.toLocaleString("en-IN")}
                  </div>

                  <button
                    type="button"
                    className="remove-product-btn"
                    onClick={() =>
                      removeProductRow(item.id)
                    }
                    disabled={items.length === 1}
                    title="Remove product"
                  >
                    ×
                  </button>

                </div>
              );
            })}

          </div>

          {/* Total */}
          <div className="bill-total">

            <span>Total Amount</span>

            <strong>
              ₹{totalAmount.toLocaleString("en-IN")}
            </strong>

          </div>

        </section>

        {/* Add to Inventory */}
        <div className="submit-area">

          <button
            type="button"
            className="add-inventory-btn"
            onClick={handleAddToInventory}
          >
            Add to Inventory
          </button>

        </div>

        {/* Frontend-only records */}
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
                <span></span>
              </div>

              {savedBills.map((bill) => (

                <div
                  className="record-row"
                  key={bill.id}
                >

                  <span>
                    {new Date(
                      bill.date
                    ).toLocaleDateString("en-IN")}
                  </span>

                  <span>
                    {bill.invoiceNumber}
                  </span>

                  <span>
                    {bill.retailerName}
                  </span>

                  <span>
                    {bill.products.length}
                  </span>

                  <strong>
                    ₹{bill.totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      downloadBill(bill)
                    }
                    className="record-download-btn"
                  >
                    ↓
                  </button>

                </div>

              ))}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}