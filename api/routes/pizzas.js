/**
 * 🚨 Attention, le code présent dans ce fichier contient volontairement de nombreuses imperfections :
 * 🚨 erreurs de conception, mauvaises pratiques de développement logiciel, failles de sécurité et de performance.
 * 🚨 Ce code servira de support à un exercice de refactoring.
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.use(express.json());

//CREATE
router.post("/", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");
    req.db.query(
      `INSERT INTO pizzas (name, price, available) VALUES ("${req.body.name}", ${req.body.price}, ${req.body.available})`,
      (err, rows, fields) => {
        if (err) console.log(err);

        res.json("created");
      }
    );
  });
});

//READ ALL
router.get("/", function (req, res) {
  //FILTER BY NAME
  if (req.query.name) {
    const query = `SELECT * FROM pizzas WHERE name = "${req.query.name}"`;

    req.db.query(query, (err, rows, fields) => {
      if (err) console.log(err);

      res.json(rows);
    });
  } else if (req.query.available) {
    const query = `SELECT * FROM pizzas WHERE available = ${req.query.available}`;

    req.db.query(query, (err, rows, fields) => {
      if (err) console.log(err);

      res.json(rows);
    });
  } else {
    req.db.query(
      "SELECT * FROM pizzas WHERE available = 1",
      (err, rows, fields) => {
        if (err) console.log(err);

        res.json(rows);
      }
    );
  }
});

//UPDATE ONE BY ID
router.put("/:id", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");

    const query = `UPDATE pizzas SET id = ${req.body.id}, name = "${req.body.name}", price = ${req.body.price}, available = ${req.body.available} WHERE id = ${req.body.id}`;

    req.db.query(query, (err, rows, fields) => {
      if (err) console.log(err);

      res.json("updated");
    });
  });
});

//READ ONE BY ID
router.get("/:id", function (req, res) {
  const query = `SELECT * FROM pizzas WHERE available = 1 AND id =${req.params.id}`;

  req.db.query(query, (err, rows, fields) => {
    if (err) console.log(err);

    res.json(rows);
  });
});

//DELETE
router.delete("/:id", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");

    req.db.query(
      `DELETE FROM pizzas WHERE id = ${req.params.id}`,
      (err, rows, fields) => {
        if (err) console.log(err);

        res.json("deleted");
      }
    );
  });
});

module.exports = router;
