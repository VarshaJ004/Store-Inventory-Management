const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Enable CORS for all methods including DELETE
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 1. Connect to MongoDB Atlas
const MONGO_URI =
  "mongodb://varsha:toby@ac-yxikmiq-shard-00-00.6mkv1sb.mongodb.net:27017,ac-yxikmiq-shard-00-01.6mkv1sb.mongodb.net:27017,ac-yxikmiq-shard-00-02.6mkv1sb.mongodb.net:27017/fisat_stores?ssl=true&replicaSet=atlas-4fm5bt-shard-0&authSource=admin&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully");
    await seedInitialProducts();
  })
  .catch((err) => console.log("Database connection error:", err));

// 2. Mongoose Schemas & Models
const Product = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      productId: { type: Number, required: true, unique: true },
      name: { type: String, required: true },
      category: { type: String, required: true },
      price: { type: Number, required: true },
      stock: { type: Number, default: 0 },
    },
    { timestamps: true }
  )
);

const StockIn = mongoose.model(
  "StockIn",
  new mongoose.Schema(
    {
      date: String,
      invoiceNumber: String,
      retailerName: String,
      products: [
        {
          productId: Number,
          productName: String,
          category: String,
          quantity: Number,
          unitCost: Number,
          amount: Number,
        },
      ],
      totalAmount: Number,
    },
    { timestamps: true }
  )
);

// 3. Auto-Seed 57 items if database is empty
const SEED_PRODUCTS = [
  { productId: 1, name: "Rough Record-without graph", category: "Lab Record", price: 50, stock: 0 },
  { productId: 2, name: "Rough Record - with graph", category: "Lab Record", price: 60, stock: 0 },
  { productId: 3, name: "Highlighter", category: "Highlighter", price: 20, stock: 0 },
  { productId: 4, name: "Carbon Paper", category: "Carbon Paper", price: 3, stock: 0 },
  { productId: 5, name: "CD", category: "CD", price: 12, stock: 0 },
  { productId: 6, name: "CD Cover", category: "CD Cover", price: 2, stock: 0 },
  { productId: 7, name: "Clutch-Compass-Pen", category: "Compass", price: 40, stock: 0 },
  { productId: 8, name: "Drawing Sheet", category: "Sheet", price: 6, stock: 0 },
  { productId: 9, name: "DVD", category: "DVD", price: 15, stock: 0 },
  { productId: 10, name: "Notebook Crown", category: "Notebook", price: 60, stock: 0 },
  { productId: 11, name: "A4-size Notebook", category: "Notebook", price: 65, stock: 0 },
  { productId: 12, name: "Ruled Long-Notebook", category: "Notebook", price: 70, stock: 0 },
  { productId: 13, name: "Lab-record - without graph", category: "Lab Record", price: 95, stock: 0 },
  { productId: 14, name: "Lab Record - with graph", category: "Lab Record", price: 95, stock: 0 },
  { productId: 15, name: "Assigment Record Low Stock", category: "Lab Record", price: 20, stock: 0 },
  { productId: 16, name: "Physics Lab manual Low Stock", category: "Lab Record", price: 70, stock: 0 },
  { productId: 17, name: "Chemistry lab manual", category: "Lab Record", price: 70, stock: 0 },
  { productId: 18, name: "Band aid", category: "Band Aid", price: 2, stock: 0 },
  { productId: 19, name: "Calculater Es plus", category: "Calculator", price: 1500, stock: 0 },
  { productId: 20, name: "Double side Tape", category: "Tape", price: 10, stock: 0 },
  { productId: 21, name: "Tape small", category: "Tape", price: 5, stock: 0 },
  { productId: 22, name: "Gum Fevi Stick", category: "Gum", price: 15, stock: 0 },
  { productId: 23, name: "Fevi-Gum", category: "Gum", price: 5, stock: 0 },
  { productId: 24, name: "Gum Low Stock", category: "Gum", price: 10, stock: 0 },
  { productId: 25, name: "Pinpoint Pen", category: "Pen", price: 10, stock: 0 },
  { productId: 26, name: "Lexi Pen", category: "Pen", price: 5, stock: 0 },
  { productId: 27, name: "Claro Pen", category: "Pen", price: 4, stock: 0 },
  { productId: 28, name: "Correction Pen", category: "Pen", price: 20, stock: 0 },
  { productId: 29, name: "PaperSoft-Pen", category: "Pen", price: 20, stock: 0 },
  { productId: 30, name: "HB-Pencil", category: "Pencil", price: 10, stock: 0 },
  { productId: 31, name: "Clutch-Pencil", category: "Pencil", price: 10, stock: 0 },
  { productId: 32, name: "Clutch-Pencil-15", category: "Pencil", price: 15, stock: 0 },
  { productId: 33, name: "Scale", category: "Scale", price: 5, stock: 0 },
  { productId: 34, name: "Long Scale", category: "Scale", price: 12, stock: 0 },
  { productId: 35, name: "Sharpner", category: "Sharpener", price: 3, stock: 0 },
  { productId: 36, name: "Eraser", category: "Eraser", price: 3, stock: 0 },
  { productId: 37, name: "Stick File", category: "File", price: 15, stock: 0 },
  { productId: 38, name: "File Folder", category: "File", price: 15, stock: 0 },
  { productId: 39, name: "Graph Sheet", category: "Sheet", price: 1, stock: 0 },
  { productId: 40, name: "Semi-log Sheet", category: "Sheet", price: 1, stock: 0 },
  { productId: 41, name: "Lead", category: "Lead", price: 5, stock: 0 },
  { productId: 42, name: "Protracter", category: "Protractor", price: 10, stock: 0 },
  { productId: 43, name: "Pen-Knife Low Stock", category: "Pen-Knife", price: 5, stock: 0 },
  { productId: 44, name: "Pro-Circle", category: "Pro-circle", price: 20, stock: 0 },
  { productId: 45, name: "Roll-N-Draw", category: "Roll-N-Draw", price: 50, stock: 0 },
  { productId: 46, name: "CD Marker Low Stock", category: "Marker", price: 10, stock: 0 },
  { productId: 47, name: "Permanent Marker Low Stock", category: "Marker", price: 20, stock: 0 },
  { productId: 48, name: "A4-Paper", category: "A4-Paper", price: 1, stock: 0 },
  { productId: 49, name: "Plastic-parts", category: "Plastic parts", price: 20, stock: 0 },
  { productId: 50, name: "Lexi-Refill", category: "Refill", price: 4, stock: 0 },
  { productId: 51, name: "FlowGel-Refill", category: "Refill", price: 5, stock: 0 },
  { productId: 52, name: "PinPoint-Refill", category: "Refill", price: 5, stock: 0 },
  { productId: 53, name: "Griper-Refill", category: "Refill", price: 4, stock: 0 },
  { productId: 54, name: "Engineering Compass", category: "Compass", price: 60, stock: 0 },
  { productId: 55, name: "Compass-Led", category: "Compass", price: 4, stock: 0 },
  { productId: 56, name: "Mini Drafter", category: "Mini Drafter", price: 450, stock: 0 },
  { productId: 57, name: "Tennis Ball", category: "Tennis Ball", price: 70, stock: 0 },
];

async function seedInitialProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(SEED_PRODUCTS);
      console.log("Seeded 57 products with 0 stock successfully.");
    }
  } catch (err) {
    console.error("Error seeding products:", err);
  }
}

// 4. API Endpoints

// GET /api/products -> Fetch all inventory products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ productId: 1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stock-in -> Fetch past stock-in records
app.get("/api/stock-in", async (req, res) => {
  try {
    const records = await StockIn.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stock-in -> Save invoice AND increment stock in inventory
app.post("/api/stock-in", async (req, res) => {
  try {
    const { date, invoiceNumber, retailerName, products: itemsList, totalAmount } = req.body;

    if (!itemsList || itemsList.length === 0) {
      return res.status(400).json({ message: "No items provided." });
    }

    // A. Save the stock-in record
    const bill = await StockIn.create({
      date,
      invoiceNumber,
      retailerName,
      products: itemsList,
      totalAmount,
    });

    // B. Increment the stock for each product in the database
    for (const item of itemsList) {
      await Product.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { stock: Number(item.quantity) } }
      );
    }

    res.status(201).json({ message: "Stock saved and updated successfully!", bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stock-in/:id -> Delete invoice AND revert stock from inventory
app.delete("/api/stock-in/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Invalid ID parameter received." });
    }

    // Support both MongoDB _id and custom numeric id
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { id: id };

    // 1. Find the invoice first
    const bill = await StockIn.findOne(filter);
    if (!bill) {
      return res.status(404).json({ message: "Stock-in invoice record not found." });
    }

    // 2. Decrement the product stocks that were added with this invoice
    for (const item of bill.products) {
      const prod = await Product.findOne({ productId: item.productId });
      if (prod) {
        // Prevent stock from going below 0
        const updatedStock = Math.max(0, (prod.stock || 0) - Number(item.quantity));
        await Product.findOneAndUpdate(
          { productId: item.productId },
          { stock: updatedStock }
        );
      }
    }

    // 3. Delete the invoice from MongoDB
    await StockIn.findOneAndDelete(filter);

    res.status(200).json({ message: "Invoice deleted and stock reverted successfully!" });
  } catch (err) {
    console.error("Error deleting stock-in bill:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard -> Summary metrics for Dashboard
app.get("/api/dashboard", async (req, res) => {
  try {
    const allProducts = await Product.find();
    const totalProducts = allProducts.length;
    const totalStock = allProducts.reduce((sum, item) => sum + (item.stock || 0), 0);
    const lowStockProducts = allProducts.filter((p) => (p.stock || 0) <= 10);

    res.status(200).json({
      totalProducts,
      totalStock,
      lowStockProducts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});