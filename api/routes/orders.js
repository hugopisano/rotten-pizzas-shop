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
      `INSERT INTO orders (user_id, amount, createdAt) VALUES (${req.body.id}, ${req.body.amount}, NOW())`,
      (err, rows, fields) => {
        if (err) console.log(err);

        const Id_commande = rows.insertId;

        for (let pizzaId of req.body.pizzas) {
          req.db.query(
            `INSERT INTO orders_pizzas (order_id, pizza_id, quantity) VALUES (${Id_commande},${pizzaId},1)`,
            (err, rows, fields) => {
              if (err) console.log(err);
            }
          );
        }
      }
    );
  });
});

//READ ALL
router.get("/", function (req, res) {
  //FILTER BY USER ID
  if (req.query.user_id) {
    const query = `SELECT * FROM orders WHERE user_id = "${req.query.user_id}"`;

    req.db.query(query, (err, rows, fields) => {
      if (err) console.log(err);

      res.json(rows);
    });
  } else if (req.query.status) {
    const query = `SELECT * FROM orders WHERE status = ${req.query.status}`;

    req.db.query(query, (err, rows, fields) => {
      if (err) console.log(err);

      res.json(rows);
    });
  } else {
    req.db.query("SELECT * FROM orders", (err, rows, fields) => {
      if (err) console.log(err);

      res.json(rows);
    });
  }
});

//UPDATE ONE BY ID
router.put("/:id", function (req, res) {
  let token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
    if (err) res.json("unauthorized");

    const query = `UPDATE orders SET id = ${req.body.id}, user_id=${req.body.user_id} status = "${req.body.status}", amount = ${req.body.amount}, updatedAt=NOW() WHERE id = ${req.body.id}`;

    req.db.query(query, (err, rows, fields) => {
      if (err) console.log(err);

      res.json("updated");
    });
  });
});

const queryDB = (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

//UPDATE STATUS BY ID
router.patch("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (!decoded) {
      return res.json("unauthorized");
    }

    const orderId = req.params.id;

    if (req.body.status === "validated") {
      // TODO: Check if there's enough stock
      const pizzasInOrder = await queryDB(req.db, "SELECT * FROM orders_pizzas WHERE order_id = ?", [orderId]);

      for (const pizza of pizzasInOrder) {
        const ingredients = await queryDB(
          req.db,
          `
          SELECT * FROM ingredients as ig 
          INNER JOIN pizzas_ingredients as pi 
          ON pi.ingredient_id = ig.id AND pi.pizza_id = ?;
        `,
          [pizza.pizza_id]
        );

        for (const ingredient of ingredients) {
          await queryDB(
            req.db,
            `
            UPDATE ingredients 
            SET stock = ? 
            WHERE id = ?;
          `,
            [ingredient.stock - 10, ingredient.id]
          );
        }
      }

      const orders = await queryDB(req.db, "SELECT * FROM orders WHERE id = ?", [orderId]);
      const userId = orders[0].user_id;

      const loyaltyPoints = 10; // This is just a placeholder. You should define how you calculate this.
      await queryDB(req.db, "UPDATE users SET loyaltyPoints = ? WHERE id = ?", [loyaltyPoints, userId]);
    }

    await queryDB(
      req.db,
      `
      UPDATE orders 
      SET id = ?, status = ?, updatedAt = NOW() 
      WHERE id = ?;
    `,
      [orderId, req.body.status, orderId]
    );

    res.json("updated");
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
});


//READ ONE BY ID
router.get("/:id", function (req, res) {
  const query = `SELECT * FROM orders WHERE id =${req.params.id}`;

  req.db.query(query, (err, rows, fields) => {
    if (err) console.log(err);

    res.json(rows);
  });
});

module.exports = router;
