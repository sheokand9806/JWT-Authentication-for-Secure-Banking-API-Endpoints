// app.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Secret key for JWT
const SECRET_KEY = "myjwtsecretkey";

// Dummy user and balance
let user = {
  username: "user1",
  password: "password123",
  balance: 1000,
};

// --- Login Route ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// --- Middleware to Verify Token ---
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
}

// --- Protected Routes ---
app.get("/balance", verifyToken, (req, res) => {
  res.json({ balance: user.balance });
});

app.post("/deposit", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Invalid deposit amount" });
  user.balance += amount;
  res.json({ message: `Deposited $${amount}`, newBalance: user.balance });
});

app.post("/withdraw", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Invalid withdrawal amount" });
  if (amount > user.balance)
    return res.status(400).json({ message: "Insufficient balance" });
  user.balance -= amount;
  res.json({ message: `Withdrew $${amount}`, newBalance: user.balance });
});

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("Welcome to Secure Banking API 🔐. Use /login to authenticate.");
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${3000}`));
