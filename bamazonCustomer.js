require("dotenv").config();
var key = require("./key");
var inquirer = require("inquirer");
var colors = require("colors/safe");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: key.keys.secret,
  database: "bamazonDB",
});

colors.enable();

connection.connect(err => {
  if (err) throw err;
  console.log(colors.yellow(`connected as id ${connection.threadId}`));
  displayProductInfo();
});

var displayProductInfo = () => {
  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    console.log(res);
    addToShoppingCart();
  });
};

var addToShoppingCart = () => {
  inquirer
    .prompt([
      {
        message: "Enter the ID of the product you'd like to add to your cart.",
        name: "product-id",
        validate: value => {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },
      {
        message: "Please enter the quantity desired.",
        name: "quantity",
        validate: value => {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },
    ])
    .then(answers => {
      connection.query("SELECT * FROM products WHERE id=?", [answers["product-id"]], (err, res) => {
        if (err) throw err;
        var newStockQuantity = res[0].stock_quantity - answers.quantity;
        var customerCost = res[0].price * answers.quantity;
        if (answers.quantity <= res[0].stock_quantity) {
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [{ stock_quantity: newStockQuantity }, { id: answers["product-id"] }],
            err => {
              if (err) throw err;
              console.log(colors.green.underline("\nAmount owed: $" + customerCost));
              console.log(colors.green("\nThanks for your business!\n"));
              connection.end();
            }
          );
        } else {
          console.log(colors.red("\nWe don't have enough in stock\n"));
          addToShoppingCart();
        }
      });
    });
};
