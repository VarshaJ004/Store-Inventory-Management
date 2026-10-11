const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ======================================================
// MONGODB CONNECTION
// ======================================================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is missing in backend/.env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully");

    await seedInitialProducts();
    await seedInitialAdmin();
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// ======================================================
// PRODUCT MODEL
// ======================================================

const Product = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      productId: {
        type: Number,
        required: true,
        unique: true,
      },

      name: {
        type: String,
        required: true,
      },

      category: {
        type: String,
        required: true,
      },

      price: {
        type: Number,
        required: true,
      },

      stock: {
        type: Number,
        default: 0,
      },

      // Number of units sold.
      // Used for Frequently Sold products.
      salesCount: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  )
);

// ======================================================
// STOCK-IN MODEL
// ======================================================

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
    {
      timestamps: true,
    }
  )
);

// ======================================================
// SALES MODEL
// ======================================================

const Sale = mongoose.model(
  "Sale",
  new mongoose.Schema(
    {
      invoiceNumber: {
        type: String,
        required: true,
        unique: true,
      },

      items: [
        {
          productId: {
            type: Number,
            required: true,
          },

          productName: {
            type: String,
            required: true,
          },

          category: {
            type: String,
          },

          price: {
            type: Number,
            required: true,
          },

          quantity: {
            type: Number,
            required: true,
          },

          amount: {
            type: Number,
            required: true,
          },
        },
      ],

      totalAmount: {
        type: Number,
        required: true,
      },

      paymentMethod: {
        type: String,
        enum: ["Cash", "GPay", "cash", "gpay"],
        required: true,
      },

      date: {
        type: String, // YYYY-MM-DD
        default: () => new Date().toISOString().split("T")[0],
      },

      saleDate: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  )
);

// ======================================================
// USER / STAFF MODEL
// ======================================================

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
      },

      username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
      },

      password: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: ["Admin", "Staff"],
        default: "Staff",
      },

      faceData: {
        type: mongoose.Schema.Types.Mixed, // Stores base64 image or face descriptor array
        default: null,
      },
    },
    {
      timestamps: true,
    }
  )
);

// Function to seed default admin if not present
const seedInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await User.create({
        name: "Store Administrator",
        email: "admin@fisat.ac.in",
        username: "admin",
        password: hashedPassword,
        role: "Admin",
        faceData: null,
      });

      console.log("Default admin created: admin / admin123");
    }
  } catch (err) {
    console.error("Error seeding default admin:", err);
  }
};

// ======================================================
// INITIAL 57 PRODUCTS
// ======================================================

const SEED_PRODUCTS = [
  {
    productId: 1,
    name: "Rough Record-without graph",
    category: "Lab Record",
    price: 50,
    stock: 0,
  },

  {
    productId: 2,
    name: "Rough Record - with graph",
    category: "Lab Record",
    price: 60,
    stock: 0,
  },

  {
    productId: 3,
    name: "Highlighter",
    category: "Highlighter",
    price: 20,
    stock: 0,
  },

  {
    productId: 4,
    name: "Carbon Paper",
    category: "Carbon Paper",
    price: 3,
    stock: 0,
  },

  {
    productId: 5,
    name: "CD",
    category: "CD",
    price: 12,
    stock: 0,
  },

  {
    productId: 6,
    name: "CD Cover",
    category: "CD Cover",
    price: 2,
    stock: 0,
  },

  {
    productId: 7,
    name: "Clutch-Compass-Pen",
    category: "Compass",
    price: 40,
    stock: 0,
  },

  {
    productId: 8,
    name: "Drawing Sheet",
    category: "Sheet",
    price: 6,
    stock: 0,
  },

  {
    productId: 9,
    name: "DVD",
    category: "DVD",
    price: 15,
    stock: 0,
  },

  {
    productId: 10,
    name: "Notebook Crown",
    category: "Notebook",
    price: 60,
    stock: 0,
  },

  {
    productId: 11,
    name: "A4-size Notebook",
    category: "Notebook",
    price: 65,
    stock: 0,
  },

  {
    productId: 12,
    name: "Ruled Long-Notebook",
    category: "Notebook",
    price: 70,
    stock: 0,
  },

  {
    productId: 13,
    name: "Lab-record - without graph",
    category: "Lab Record",
    price: 95,
    stock: 0,
  },

  {
    productId: 14,
    name: "Lab Record - with graph",
    category: "Lab Record",
    price: 95,
    stock: 0,
  },

  {
    productId: 15,
    name: "Assigment Record Low Stock",
    category: "Lab Record",
    price: 20,
    stock: 0,
  },

  {
    productId: 16,
    name: "Physics Lab manual Low Stock",
    category: "Lab Record",
    price: 70,
    stock: 0,
  },

  {
    productId: 17,
    name: "Chemistry lab manual",
    category: "Lab Record",
    price: 70,
    stock: 0,
  },

  {
    productId: 18,
    name: "Band aid",
    category: "Band Aid",
    price: 2,
    stock: 0,
  },

  {
    productId: 19,
    name: "Calculater Es plus",
    category: "Calculator",
    price: 1500,
    stock: 0,
  },

  {
    productId: 20,
    name: "Double side Tape",
    category: "Tape",
    price: 10,
    stock: 0,
  },

  {
    productId: 21,
    name: "Tape small",
    category: "Tape",
    price: 5,
    stock: 0,
  },

  {
    productId: 22,
    name: "Gum Fevi Stick",
    category: "Gum",
    price: 15,
    stock: 0,
  },

  {
    productId: 23,
    name: "Fevi-Gum",
    category: "Gum",
    price: 5,
    stock: 0,
  },

  {
    productId: 24,
    name: "Gum Low Stock",
    category: "Gum",
    price: 10,
    stock: 0,
  },

  {
    productId: 25,
    name: "Pinpoint Pen",
    category: "Pen",
    price: 10,
    stock: 0,
  },

  {
    productId: 26,
    name: "Lexi Pen",
    category: "Pen",
    price: 5,
    stock: 0,
  },

  {
    productId: 27,
    name: "Claro Pen",
    category: "Pen",
    price: 4,
    stock: 0,
  },

  {
    productId: 28,
    name: "Correction Pen",
    category: "Pen",
    price: 20,
    stock: 0,
  },

  {
    productId: 29,
    name: "PaperSoft-Pen",
    category: "Pen",
    price: 20,
    stock: 0,
  },

  {
    productId: 30,
    name: "HB-Pencil",
    category: "Pencil",
    price: 10,
    stock: 0,
  },

  {
    productId: 31,
    name: "Clutch-Pencil",
    category: "Pencil",
    price: 10,
    stock: 0,
  },

  {
    productId: 32,
    name: "Clutch-Pencil-15",
    category: "Pencil",
    price: 15,
    stock: 0,
  },

  {
    productId: 33,
    name: "Scale",
    category: "Scale",
    price: 5,
    stock: 0,
  },

  {
    productId: 34,
    name: "Long Scale",
    category: "Scale",
    price: 12,
    stock: 0,
  },

  {
    productId: 35,
    name: "Sharpner",
    category: "Sharpener",
    price: 3,
    stock: 0,
  },

  {
    productId: 36,
    name: "Eraser",
    category: "Eraser",
    price: 3,
    stock: 0,
  },

  {
    productId: 37,
    name: "Stick File",
    category: "File",
    price: 15,
    stock: 0,
  },

  {
    productId: 38,
    name: "File Folder",
    category: "File",
    price: 15,
    stock: 0,
  },

  {
    productId: 39,
    name: "Graph Sheet",
    category: "Sheet",
    price: 1,
    stock: 0,
  },

  {
    productId: 40,
    name: "Semi-log Sheet",
    category: "Sheet",
    price: 1,
    stock: 0,
  },

  {
    productId: 41,
    name: "Lead",
    category: "Lead",
    price: 5,
    stock: 0,
  },

  {
    productId: 42,
    name: "Protracter",
    category: "Protractor",
    price: 10,
    stock: 0,
  },

  {
    productId: 43,
    name: "Pen-Knife Low Stock",
    category: "Pen-Knife",
    price: 5,
    stock: 0,
  },

  {
    productId: 44,
    name: "Pro-Circle",
    category: "Pro-circle",
    price: 20,
    stock: 0,
  },

  {
    productId: 45,
    name: "Roll-N-Draw",
    category: "Roll-N-Draw",
    price: 50,
    stock: 0,
  },

  {
    productId: 46,
    name: "CD Marker Low Stock",
    category: "Marker",
    price: 10,
    stock: 0,
  },

  {
    productId: 47,
    name: "Permanent Marker Low Stock",
    category: "Marker",
    price: 20,
    stock: 0,
  },

  {
    productId: 48,
    name: "A4-Paper",
    category: "A4-Paper",
    price: 1,
    stock: 0,
  },

  {
    productId: 49,
    name: "Plastic-parts",
    category: "Plastic parts",
    price: 20,
    stock: 0,
  },

  {
    productId: 50,
    name: "Lexi-Refill",
    category: "Refill",
    price: 4,
    stock: 0,
  },

  {
    productId: 51,
    name: "FlowGel-Refill",
    category: "Refill",
    price: 5,
    stock: 0,
  },

  {
    productId: 52,
    name: "PinPoint-Refill",
    category: "Refill",
    price: 5,
    stock: 0,
  },

  {
    productId: 53,
    name: "Griper-Refill",
    category: "Refill",
    price: 4,
    stock: 0,
  },

  {
    productId: 54,
    name: "Engineering Compass",
    category: "Compass",
    price: 60,
    stock: 0,
  },

  {
    productId: 55,
    name: "Compass-Led",
    category: "Compass",
    price: 4,
    stock: 0,
  },

  {
    productId: 56,
    name: "Mini Drafter",
    category: "Mini Drafter",
    price: 450,
    stock: 0,
  },

  {
    productId: 57,
    name: "Tennis Ball",
    category: "Tennis Ball",
    price: 70,
    stock: 0,
  },
];

// ======================================================
// SEED PRODUCTS
// ======================================================

async function seedInitialProducts() {
  try {
    const count = await Product.countDocuments();

    if (count === 0) {
      await Product.insertMany(SEED_PRODUCTS);

      console.log(
        "Seeded 57 products with 0 stock successfully."
      );
    }
  } catch (err) {
    console.error(
      "Error seeding products:",
      err
    );
  }
}

// ======================================================
// GET ALL PRODUCTS
// ======================================================

app.get(
  "/api/products",
  async (req, res) => {
    try {
      const products =
        await Product.find().sort({
          productId: 1,
        });

      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// GET STOCK-IN RECORDS
// ======================================================

app.get(
  "/api/stock-in",
  async (req, res) => {
    try {
      const records =
        await StockIn.find().sort({
          createdAt: -1,
        });

      res.status(200).json(records);
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// POST STOCK-IN
// Saves invoice AND increases inventory
// ======================================================

app.post(
  "/api/stock-in",
  async (req, res) => {
    try {
      const {
        date,
        invoiceNumber,
        retailerName,
        products: itemsList,
        totalAmount,
      } = req.body;

      if (
        !itemsList ||
        !Array.isArray(itemsList) ||
        itemsList.length === 0
      ) {
        return res.status(400).json({
          message: "No items provided.",
        });
      }

      // Save stock-in record
      const bill =
        await StockIn.create({
          date,
          invoiceNumber,
          retailerName,
          products: itemsList,
          totalAmount,
        });

      // Increase product stock
      for (const item of itemsList) {
        await Product.findOneAndUpdate(
          {
            productId:
              Number(item.productId),
          },
          {
            $inc: {
              stock:
                Number(item.quantity),
            },
          }
        );
      }

      res.status(201).json({
        message:
          "Stock saved and updated successfully!",
        bill,
      });
    } catch (err) {
      console.error(
        "Stock-in error:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// DELETE STOCK-IN
// Deletes invoice AND reverts stock
// ======================================================

app.delete(
  "/api/stock-in/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !id ||
        id === "undefined" ||
        id === "null"
      ) {
        return res.status(400).json({
          message:
            "Invalid ID parameter received.",
        });
      }

      const filter =
        mongoose.Types.ObjectId.isValid(id)
          ? { _id: id }
          : { id: id };

      const bill =
        await StockIn.findOne(filter);

      if (!bill) {
        return res.status(404).json({
          message:
            "Stock-in invoice record not found.",
        });
      }

      // Revert stock
      for (const item of bill.products) {
        const product =
          await Product.findOne({
            productId:
              Number(item.productId),
          });

        if (product) {
          const updatedStock =
            Math.max(
              0,
              (product.stock || 0) -
                Number(item.quantity)
            );

          await Product.findOneAndUpdate(
            {
              productId:
                Number(item.productId),
            },
            {
              stock: updatedStock,
            }
          );
        }
      }

      // Delete invoice
      await StockIn.findOneAndDelete(
        filter
      );

      res.status(200).json({
        message:
          "Invoice deleted and stock reverted successfully!",
      });
    } catch (err) {
      console.error(
        "Error deleting stock-in bill:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// GET FREQUENTLY SOLD PRODUCTS
// ======================================================

app.get(
  "/api/frequently-sold",
  async (req, res) => {
    try {
      const products =
        await Product.find({
          stock: { $gt: 0 },
          salesCount: { $gt: 0 },
        })
          .sort({
            salesCount: -1,
            name: 1,
          })
          .limit(8);

      res.status(200).json(products);
    } catch (err) {
      console.error(
        "Frequently sold error:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// POST SALE
//
// Complete Sale:
// 1. Check products
// 2. Check stock
// 3. Calculate total
// 4. Reduce stock
// 5. Increase salesCount
// 6. Save sale
// ======================================================

app.post(
  "/api/sales",
  async (req, res) => {
    try {
      const {
        items,
        paymentMethod,
        date,
        grandTotal,
        totalAmount: reqTotal,
      } = req.body;

      // ------------------------------------------
      // VALIDATE ITEMS
      // ------------------------------------------

      if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "No products added to the sale.",
        });
      }

      // ------------------------------------------
      // VALIDATE PAYMENT
      // ------------------------------------------

      const methodClean = String(paymentMethod || "").trim().toLowerCase();
      if (
        methodClean !== "cash" &&
        methodClean !== "gpay"
      ) {
        return res.status(400).json({
          message:
            "Payment method must be Cash or GPay.",
        });
      }

      const normalizedPaymentMethod =
        methodClean === "gpay" ? "GPay" : "Cash";

      const todayString =
        new Date().toISOString().split("T")[0];

      const saleDateString =
        typeof date === "string" && date.trim().length >= 10
          ? date.trim().slice(0, 10)
          : todayString;

      const saleItems = [];

      // ------------------------------------------
      // CHECK EVERY PRODUCT AND STOCK
      // ------------------------------------------

      for (const item of items) {
        const product =
          await Product.findOne({
            productId:
              Number(item.productId),
          });

        if (!product) {
          return res.status(404).json({
            message:
              `Product ${item.productId} not found.`,
          });
        }

        const quantity =
          Number(item.quantity);

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          return res.status(400).json({
            message:
              `Invalid quantity for ${product.name}.`,
          });
        }

        if (
          product.stock < quantity
        ) {
          return res.status(400).json({
            message:
              `${product.name} has only ${product.stock} in stock.`,
          });
        }

        saleItems.push({
          productId:
            product.productId,

          productName:
            product.name,

          category:
            product.category,

          price:
            product.price,

          quantity,

          amount:
            product.price * quantity,
        });
      }

      // ------------------------------------------
      // CALCULATE TOTAL
      // ------------------------------------------

      const calculatedTotal =
        saleItems.reduce(
          (total, item) =>
            total + item.amount,
          0
        );

      const totalAmount =
        Number(reqTotal || grandTotal || calculatedTotal);

      // ------------------------------------------
      // CREATE INVOICE NUMBER
      // ------------------------------------------

      const invoiceNumber =
        `SALE-${Date.now()}`;

      // ------------------------------------------
      // UPDATE INVENTORY (STOCK DEDUCTION)
      // ------------------------------------------

      for (const item of saleItems) {
        await Product.findOneAndUpdate(
          {
            productId:
              item.productId,
          },

          {
            $inc: {
              stock:
                -item.quantity,

              salesCount:
                item.quantity,
            },
          }
        );
      }

      // ------------------------------------------
      // SAVE SALE
      // ------------------------------------------

      const sale =
        await Sale.create({
          invoiceNumber,

          items: saleItems,

          totalAmount,

          paymentMethod:
            normalizedPaymentMethod,

          date:
            saleDateString,

          saleDate: new Date(),
        });

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------

      res.status(201).json({
        message:
          "Sale completed successfully.",

        status: "success",

        sale: {
          id: sale._id,

          invoiceNumber,

          items: sale.items,

          totalAmount,

          paymentMethod:
            sale.paymentMethod,

          date:
            sale.date,

          saleDate:
            sale.saleDate,
        },

        data: sale,
      });
    } catch (err) {
      console.error(
        "Complete sale error:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// GET SALES
// ======================================================

app.get(
  "/api/sales",
  async (req, res) => {
    try {
      const {
        paymentMethod,
        from,
        to,
        date,
      } = req.query;

      const filter = {};

      // Payment filter
      if (paymentMethod) {
        filter.paymentMethod =
          new RegExp(`^${paymentMethod}$`, "i");
      }

      // Date filter
      if (date) {
        filter.date = date;
      }

      // Date range filter
      if (from || to) {
        filter.saleDate = {};

        if (from) {
          const fromDate =
            new Date(from);

          fromDate.setHours(
            0,
            0,
            0,
            0
          );

          filter.saleDate.$gte =
            fromDate;
        }

        if (to) {
          const toDate =
            new Date(to);

          toDate.setHours(
            23,
            59,
            59,
            999
          );

          filter.saleDate.$lte =
            toDate;
        }
      }

      const sales =
        await Sale.find(filter)
          .sort({
            createdAt: -1,
            saleDate: -1,
          });

      const formattedSales = sales.map((s) => {
        const obj = s.toObject ? s.toObject() : s;
        if (!obj.date) {
          if (obj.saleDate) {
            obj.date = new Date(obj.saleDate).toISOString().split("T")[0];
          } else if (obj.createdAt) {
            obj.date = new Date(obj.createdAt).toISOString().split("T")[0];
          } else {
            obj.date = new Date().toISOString().split("T")[0];
          }
        }
        return obj;
      });

      res.status(200).json(formattedSales);
    } catch (err) {
      console.error(
        "Sales fetch error:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// DELETE SALE
// Deletes sale record AND reverts stock back to inventory
// ======================================================

app.delete(
  "/api/sales/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !id ||
        id === "undefined" ||
        id === "null"
      ) {
        return res.status(400).json({
          message:
            "Invalid ID parameter received.",
        });
      }

      const filter =
        mongoose.Types.ObjectId.isValid(id)
          ? { _id: id }
          : { id: id };

      const sale =
        await Sale.findOne(filter);

      if (!sale) {
        return res.status(404).json({
          message:
            "Sale record not found.",
        });
      }

      // Revert stock: loop through sale.items and increment stock back into Product collection
      if (Array.isArray(sale.items)) {
        for (const item of sale.items) {
          const productId = Number(item.productId ?? item.id);
          const quantity = Number(item.qty !== undefined ? item.qty : (item.quantity ?? 0));

          if (!isNaN(productId) && productId > 0 && quantity > 0) {
            await Product.findOneAndUpdate(
              { productId },
              {
                $inc: {
                  stock: quantity,
                  salesCount: -quantity,
                },
              }
            );
          } else if (item.productId && quantity > 0) {
            await Product.findOneAndUpdate(
              { _id: item.productId },
              {
                $inc: {
                  stock: quantity,
                  salesCount: -quantity,
                },
              }
            );
          }
        }
      }

      // Delete Sale document from database
      await Sale.findOneAndDelete(filter);

      res.status(200).json({
        message:
          "Sale deleted and stock reverted successfully!",
        deletedId: id,
      });
    } catch (err) {
      console.error(
        "Error deleting sale:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// DASHBOARD
// ======================================================

app.get(
  "/api/dashboard",
  async (req, res) => {
    try {
      const allProducts =
        await Product.find();

      const totalProducts =
        allProducts.length;

      const totalStock =
        allProducts.reduce(
          (sum, item) =>
            sum + (item.stock || 0),
          0
        );

      const lowStockProducts =
        allProducts.filter(
          (product) =>
            (product.stock || 0) <= 10
        );

      // Fetch all records from the Sale collection
      const allSales =
        await Sale.find().sort({
          createdAt: -1,
          saleDate: -1,
        });

      // Calculate totalRevenue by summing totalAmount of all sales
      const totalRevenue =
        allSales.reduce(
          (sum, sale) =>
            sum + (Number(sale.totalAmount) || 0),
          0
        );

      // Calculate total sales transaction count
      const totalSalesToday =
        allSales.length;

      const totalSales =
        allSales.length;

      // Today's specific sales
      const todayStr =
        new Date().toISOString().split("T")[0];

      const todaysSalesList =
        allSales.filter((s) => {
          if (s.date && s.date.startsWith(todayStr)) return true;
          if (s.saleDate) {
            const dStr =
              new Date(s.saleDate).toISOString().split("T")[0];
            if (dStr === todayStr) return true;
          }
          return false;
        });

      const todaysSales =
        todaysSalesList.length;

      const todaysRevenue =
        todaysSalesList.reduce(
          (sum, sale) =>
            sum + (Number(sale.totalAmount) || 0),
          0
        );

      // Format recent sales for dashboard panel
      const recentSales =
        allSales.slice(0, 6).map((sale) => {
          const firstItem =
            Array.isArray(sale.items) && sale.items.length > 0
              ? sale.items[0]
              : null;

          const productTitle =
            firstItem
              ? `${firstItem.productName || firstItem.name || "Item"}${
                  sale.items.length > 1
                    ? ` (+${sale.items.length - 1} more)`
                    : ""
                }`
              : "Counter Sale";

          return {
            id: sale._id || sale.id || sale.invoiceNumber,
            product: productTitle,
            paymentMethod: sale.paymentMethod || "Cash",
            amount: Number(sale.totalAmount || 0).toLocaleString("en-IN"),
            date: sale.date || todayStr,
          };
        });

      res.status(200).json({
        totalProducts,
        totalStock,
        totalRevenue,
        totalSalesToday,
        totalSales,
        todaysSales,
        todaysRevenue,
        lowStockProducts,
        recentSales,
      });
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// USER / STAFF MANAGEMENT ROUTES
// ======================================================

// LOGIN AUTHENTICATION (Username & Password)
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: trimmedUsername });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Login successful.",
      user: userObj,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 1. GET ALL USERS (Exclude password)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET SINGLE USER BY ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
    const user = await User.findOne(filter).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. REGISTER / CREATE NEW USER
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        message: "Name, email, username, and password are required.",
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check unique username and email
    const existingUser = await User.findOne({
      $or: [{ username: trimmedUsername }, { email: trimmedEmail }],
    });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        return res.status(400).json({ message: "Username already taken." });
      }
      if (existingUser.email === trimmedEmail) {
        return res.status(400).json({ message: "Email already registered." });
      }
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      username: trimmedUsername,
      password: hashedPassword,
      role: role || "Staff",
      faceData: null,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      message: "Staff user registered successfully.",
      user: userObj,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE USER
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, password, role } = req.body;

    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
    const user = await User.findOne(filter);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (username) {
      const trimmedUsername = username.trim().toLowerCase();
      const existing = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Username is already in use." });
      }
      user.username = trimmedUsername;
    }

    if (email) {
      const trimmedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = trimmedEmail;
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "User updated successfully.",
      user: userObj,
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE USER
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };

    const deletedUser = await User.findOneAndDelete(filter);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User deleted successfully.",
      deletedId: id,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6. UPDATE USER FACE DATA (BIOMETRIC REGISTRATION)
app.post("/api/users/:id/face", async (req, res) => {
  try {
    const { id } = req.params;
    const { faceData, faceImage } = req.body;
    const dataToStore = faceData || faceImage;

    if (!dataToStore) {
      return res.status(400).json({
        message: "No face image or descriptor data received.",
      });
    }

    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
    const user = await User.findOne(filter);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.faceData = dataToStore;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Face enrolled successfully.",
      user: userObj,
    });
  } catch (err) {
    console.error("Register face error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.send(
    "FISAT Stores Backend is Running"
  );
});

// ======================================================
// START SERVER
// ======================================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Backend server running on http://localhost:${PORT}`
  );
});