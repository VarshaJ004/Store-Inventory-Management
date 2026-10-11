import { useEffect, useMemo, useState } from "react";
import "./Sales.css";

const API_URL = "http://localhost:5000";

function Sales() {
  const [products, setProducts] = useState([]);
  const [frequentProducts, setFrequentProducts] = useState([]);

  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFrequent, setShowFrequent] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(true);
  const [completingSale, setCompletingSale] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [recentSales, setRecentSales] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState({
    amount: 0,
    paymentMethod: "cash",
  });

  // ========================================
  // FETCH RECENT SALES
  // ========================================

  const fetchRecentSales = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sales`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const salesList = Array.isArray(data)
        ? data
        : data?.sales || data?.data || [];
      setRecentSales(salesList);
    } catch (err) {
      console.error("Recent sales fetch error:", err);
    }
  };

  // ========================================
  // LOAD PRODUCTS & RECENT SALES
  // ========================================

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const rawProducts = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];
        const mappedProducts = rawProducts.map((product) => {
          const id = product.productId ?? product.id ?? product._id;
          return {
            ...product,
            _id: product._id ?? id,
            productId: product.productId ?? product.id ?? id,
            id: product.id ?? product.productId ?? id,
            stock: Number(product.stock) || 0,
          };
        });
        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Products error:", err);
        setError("Cannot load products from backend.");
        setLoading(false);
      });

    fetchRecentSales();

    const handleStockUpdate = () => {
      loadProducts();
      fetchRecentSales();
    };
    window.addEventListener("stockInUpdated", handleStockUpdate);
    return () => window.removeEventListener("stockInUpdated", handleStockUpdate);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching products...");

      const response = await fetch(
        `${API_URL}/api/products`
      );

      console.log("Response received:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      console.log("Products received:", result);

      if (Array.isArray(result)) {
        const mappedProducts = result.map((product) => {
          const id = product.productId ?? product.id ?? product._id;
          return {
            ...product,
            _id: product._id ?? id,
            productId: product.productId ?? product.id ?? id,
            id: product.id ?? product.productId ?? id,
            stock: Number(product.stock) || 0,
          };
        });
        setProducts(mappedProducts);
      } else {
        console.error("Unexpected response:", result);
        setError("Invalid product data received.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Products error:", err);
      setError("Cannot load products from backend.");
      setLoading(false);
    }
  };

  // ========================================
  // LOAD FREQUENTLY SOLD
  // ========================================

  const loadFrequentlySold = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/frequently-sold`
      );
  
      if (!response.ok) {
        throw new Error(
          "Failed to load frequently sold products"
        );
      }
  
      const result = await response.json();
  
      // Backend returns the products directly as an array
      if (Array.isArray(result)) {
        setFrequentProducts(result);
      }
  
    } catch (err) {
      console.error(
        "Frequently sold error:",
        err
      );
    }
  };

  // ========================================
  // SALES CATEGORY
  // ========================================

  const getSalesCategory = (product) => {
    const category =
      product.category?.toLowerCase() || "";

    const name =
      product.name?.toLowerCase() || "";

    if (
      category.includes("pen") ||
      category.includes("pencil") ||
      category.includes("marker") ||
      category.includes("refill")
    ) {
      return "Pens";
    }

    if (
      category.includes("notebook") ||
      category.includes("record") ||
      category.includes("manual") ||
      name.includes("notebook") ||
      name.includes("record")
    ) {
      return "Books";
    }

    return "Stationery";
  };

  // ========================================
  // FILTER PRODUCTS
  // ========================================

  const displayedProducts = useMemo(() => {
    let result = showFrequent
      ? frequentProducts
      : products;

    return result.filter((product) => {
      const matchesSearch =
        product.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        getSalesCategory(product) === category;

      return matchesSearch && matchesCategory;
    });
  }, [
    products,
    frequentProducts,
    search,
    category,
    showFrequent,
  ]);

  // ========================================
  // ADD TO CART
  // ========================================

  const addToCart = (product) => {
    setMessage("");
    setError("");

    if (product.stock <= 0) {
      setError(
        `${product.name} is out of stock.`
      );
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) =>
          item._id === product._id
      );

      if (existing) {
        if (
          existing.quantity >=
          product.stock
        ) {
          return currentCart;
        }

        return currentCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // ========================================
  // INCREASE QUANTITY
  // ========================================

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item._id !== id) {
          return item;
        }

        if (
          item.quantity >= item.stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  // ========================================
  // DECREASE QUANTITY
  // ========================================

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item._id !== id) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1,
          };
        })
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  // ========================================
  // REMOVE ITEM
  // ========================================

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item._id !== id
      )
    );
  };

  // ========================================
  // CLEAR CART
  // ========================================

  const clearCart = () => {
    setCart([]);
    setError("");
    setMessage("");
  };

  // ========================================
  // TOTALS
  // ========================================

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const grandTotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  // ========================================
  // COMPLETE SALE
  // ========================================

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setError(
        "Add at least one product."
      );
      return;
    }

    try {
      setCompletingSale(true);
      setError("");
      setMessage("");

      const normalizedPaymentMethod =
        paymentMethod.toLowerCase() === "gpay" ? "GPay" : "Cash";

      const todayStr = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `${API_URL}/api/sales`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            paymentMethod: normalizedPaymentMethod,

            grandTotal,

            totalAmount: grandTotal,

            date: todayStr,

            items: cart.map((item) => ({
              productId: item.productId ?? item.id,
              productName: item.name,
              category: item.category,
              price: item.price,
              quantity: item.quantity,
              amount: item.price * item.quantity,
            })),
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Sale could not be completed."
        );
        return;
      }

      const totalAmount =
        result.sale?.totalAmount ?? result.data?.totalAmount ?? grandTotal;

      setMessage(
        `Sale completed • ${result.sale?.invoiceNumber || result.data?.invoiceNumber || ""} • ₹${totalAmount}`
      );

      setCompletedSaleData({
        amount: totalAmount,
        paymentMethod: normalizedPaymentMethod,
      });
      setShowPopup(true);

      await loadProducts();
      await loadFrequentlySold();
      await fetchRecentSales();
      window.dispatchEvent(new Event("stockInUpdated"));

    } catch (err) {
      console.error(err);

      setError(
        "Could not complete the sale."
      );
    } finally {
      setCompletingSale(false);
    }
  };

  // ========================================
  // DELETE SALE & REVERT STOCK
  // ========================================

  const handleDeleteSale = async (saleId, invoiceNumber) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete transaction "${invoiceNumber || saleId}"?\n\nThis will automatically restore the sold items back to inventory stock.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/sales/${saleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRecentSales((prev) => prev.filter((s) => (s._id || s.id) !== saleId));
        await loadProducts();
        await loadFrequentlySold();
        window.dispatchEvent(new Event("stockInUpdated"));
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete sale: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting sale:", err);
      alert("Could not reach server to delete sale.");
    }
  };

  const completeSale = handleCompleteSale;

  const handleNewSale = () => {
    setShowPopup(false);
    setCart([]);
    setError("");
    setMessage("");
  };

  return (
    <div className="sales-container sales-layout">

      {/* ========================================
          PRODUCTS
      ======================================== */}

      <main className="sales-main">

        <section className="sales-products">

          <div className="sales-page-header">
            <h1>Sales</h1>
          </div>

          {/* SEARCH */}

          <div className="sales-search">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          {/* FILTERS */}

          <div className="sales-filters">

            <div className="category-buttons">

              {[
                "All",
                "Books",
                "Pens",
                "Stationery",
              ].map((item) => (

                <button
                  key={item}
                  type="button"
                  className={
                    category === item &&
                    !showFrequent
                      ? "filter-button active"
                      : "filter-button"
                  }
                  onClick={() => {
                    setCategory(item);
                    setShowFrequent(false);
                  }}
                >
                  {item}
                </button>

              ))}

            </div>

            <button
              type="button"
              className={
                showFrequent
                  ? "frequent-button active"
                  : "frequent-button"
              }
              onClick={() => {
                setShowFrequent(
                  !showFrequent
                );
                setCategory("All");
              }}
            >
              ✦ Frequently Sold
            </button>

          </div>

          {/* MESSAGE */}

          {message && (
            <div className="sales-success">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="sales-error">
              {error}
            </div>
          )}

          {/* PRODUCTS */}

          {loading ? (

            <div className="sales-empty">
              Loading products...
            </div>

          ) : displayedProducts.length === 0 ? (

            <div className="sales-empty">

              <strong>
                No products found
              </strong>

              <span>
                Try another search or category.
              </span>

            </div>

          ) : (

            <div className="sales-product-grid">

              {displayedProducts.map(
                (product) => {

                  const inCart =
                    cart.find(
                      (item) =>
                        item._id ===
                        product._id
                    );

                  const availableStock =
                    product.stock -
                    (inCart?.quantity || 0);

                  return (

                    <div
                      className="sales-product-card"
                      key={product._id}
                    >

                      <div className="product-card-top">

                        <span
                          className={
                            availableStock <= 0
                              ? "stock-badge stock-out"
                              : "stock-badge"
                          }
                        >
                          {availableStock <= 0
                            ? "Out of stock"
                            : `Stock ${availableStock}`}
                        </span>

                      </div>

                      <div className="product-icon">
                        {getSalesCategory(
                          product
                        ) === "Pens"
                          ? "✎"
                          : getSalesCategory(
                              product
                            ) === "Books"
                          ? "▤"
                          : "□"}
                      </div>

                      <div className="product-card-info">

                        <h3>
                          {product.name}
                        </h3>

                        <span>
                          {product.category}
                        </span>

                      </div>

                      <div className="product-card-bottom">

                        <strong>
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <button
                          type="button"
                          disabled={
                            availableStock <= 0
                          }
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          + Add
                        </button>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

        {/* ========================================
            RECENT TRANSACTIONS
        ======================================== */}

        <section className="records-card sales-recent-card">

          <div className="records-header">
            <h2>Recent Transactions</h2>
          </div>

          {recentSales.length === 0 ? (
            <p className="no-records-message">
              No recent transactions recorded yet.
            </p>
          ) : (
            <div className="records-table">

              <div className="records-table-head">
                <span>Date</span>
                <span>Invoice</span>
                <span>Total Items</span>
                <span>Payment</span>
                <span>Total Amount</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {recentSales.map((sale) => {
                const saleId = sale._id || sale.id;

                const totalItemsCount = Array.isArray(sale.items)
                  ? sale.items.reduce(
                      (sum, item) =>
                        sum + (Number(item.quantity ?? item.qty) || 1),
                      0
                    )
                  : Number(sale.totalItems) || 1;

                let formattedDate = sale.date;
                if (!formattedDate && sale.saleDate) {
                  formattedDate = new Date(sale.saleDate).toLocaleDateString("en-IN");
                } else if (formattedDate && formattedDate.includes("-")) {
                  const parts = formattedDate.split("-");
                  if (parts.length === 3 && parts[0].length === 4) {
                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  }
                }

                const paymentText =
                  String(sale.paymentMethod || "Cash").toLowerCase() === "gpay"
                    ? "GPay"
                    : "Cash";

                return (
                  <div className="record-row" key={saleId}>

                    <span>{formattedDate || "Today"}</span>

                    <span style={{ fontWeight: "600", fontSize: "12px", color: "#475569" }}>
                      {sale.invoiceNumber || String(saleId).slice(-8)}
                    </span>

                    <span>{totalItemsCount} items</span>

                    <span>
                      <span className={`payment-pill ${paymentText.toLowerCase()}`}>
                        {paymentText}
                      </span>
                    </span>

                    <strong style={{ color: "#0f172a" }}>
                      ₹{Number(sale.totalAmount || 0).toLocaleString("en-IN")}
                    </strong>

                    <div className="record-actions">
                      <button
                        type="button"
                        onClick={() => handleDeleteSale(saleId, sale.invoiceNumber)}
                        className="record-delete-btn"
                        title="Delete Sale & Revert Stock"
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

      {/* ========================================
          CURRENT SALE
      ======================================== */}

        <aside className="sales-cart">

          <div className="cart-header">

            <div className="cart-title">

              <div className="cart-icon">
                🛍
              </div>

              <div>

                <h2>
                  Current Sale
                </h2>

                <span>
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>

              </div>

            </div>

            {cart.length > 0 && (
              <button
                type="button"
                className="clear-cart"
                onClick={clearCart}
              >
                Clear
              </button>
            )}

          </div>

          {/* CART ITEMS */}

          <div className="cart-items">

            {cart.length === 0 ? (

              <div className="cart-empty">

                <div className="empty-cart-icon">
                  🛍
                </div>

                <strong>
                  Cart is empty
                </strong>

                <span>
                  Tap Add on a product to
                  start a sale.
                </span>

              </div>

            ) : (

              cart.map((item) => (

                <div
                  className="cart-item"
                  key={item._id}
                >

                  <div className="cart-item-info">

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      ₹{item.price} each
                    </span>

                  </div>

                  <div className="cart-item-right">

                    <div className="quantity-control">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item._id
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item._id
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <strong>
                      ₹
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() =>
                        removeFromCart(
                          item._id
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

          {/* CART FOOTER */}

          <div className="cart-footer">

            <div className="subtotal-row">
              <span>
                Subtotal
              </span>

              <span>
                ₹
                {grandTotal.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <div className="total-row">

              <span>
                GRAND TOTAL
              </span>

              <strong>
                ₹
                {grandTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* PAYMENT */}

            <div className="payment-section">

              <label>
                PAYMENT METHOD
              </label>

              <div className="payment-options">

                <button
                  type="button"
                  className={
                    paymentMethod === "cash"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "cash"
                    )
                  }
                >
                  <span>₹</span>
                  Cash
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "gpay"
                      ? "payment-option active"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "gpay"
                    )
                  }
                >
                  <span>▣</span>
                  GPay
                </button>

              </div>

            </div>

            {/* COMPLETE SALE */}

            <button
              type="button"
              className="complete-sale-button"
              disabled={
                cart.length === 0 ||
                completingSale
              }
              onClick={handleCompleteSale}
            >
              {completingSale
                ? "Completing..."
                : "✓ Complete Sale"}
            </button>

          </div>

        </aside>

        {/* ========================================
            SALE COMPLETED POPUP MODAL
        ======================================== */}

        {showPopup && (
          <div className="sale-popup-overlay">
            <div className="sale-popup-card">
              <div className="popup-check-icon">✓</div>
              <h2 className="popup-title">Sale Completed</h2>
              <p className="popup-payment-method">
                Payment Method: <strong>{completedSaleData?.paymentMethod}</strong>
              </p>

              <div className="popup-amount-box">
                <span className="popup-amount-label">AMOUNT</span>
                <strong className="popup-amount-value">
                  ₹{Number(completedSaleData?.amount || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <button
                type="button"
                className="popup-new-sale-button"
                onClick={handleNewSale}
              >
                New Sale
              </button>
            </div>
          </div>
        )}

    </div>
  );
}

export default Sales;