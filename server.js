require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layout"); 

const authRoutes = require("./routes/auth");
const portfolioRoutes = require("./routes/portfolio");
const connectDB = require("./config/db"); 

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.JWT_SECRET || "default_secret", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }
  })
);

app.get("/", (req, res) => {
  res.render("index", { title: "Home Page" });
});

app.use("/auth", authRoutes);
app.use("/portfolio", portfolioRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: "Page not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
