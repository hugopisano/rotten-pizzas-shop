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
  host: "db",
  user: "rps",
  password: "azerty",
  database: "rps"
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

app.use("/orders", orders);
app.use("/pizzas", pizzas);
app.use("/auth", auth);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
