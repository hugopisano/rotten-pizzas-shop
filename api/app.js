/**
 * 🚨 Attention, le code présent dans ce fichier contient volontairement de nombreuses imperfections :
 * 🚨 erreurs de conception, mauvaises pratiques de développement logiciel, failles de sécurité et de performance.
 * 🚨 Ce code servira de support à un exercice de refactoring.
 */
const express = require("express");
const app = express();
const port = 3000;

const orders = require("./routes/orders");
const pizzas = require("./routes/pizzas");
const auth = require("./routes/auth");

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(function (err) {
  if (err) {
    console.error("Error connecting: " + err.stack);
    process.exit(1);
  }

  console.log("Connected as id " + connection.threadId);
});

app.use((req, res, next) => {
  req.db = connection;
  next();
});


app.use("/orders", orders);
app.use("/pizzas", pizzas);
app.use("/auth", auth);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});