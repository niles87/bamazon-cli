require("dotenv").config();
var key = require("./key");
var inquirer = require("inquirer");
var colors = require("colors/safe");
var mysql = require("mysql");
var Table = require("cli-table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: key.keys.secret,
  database: "bamazonDB",
});

colors.enable();

var tableHeaders = ["id", "  product  ", "  department  ", "price", "stock"];
var table = new Table({ head: tableHeaders });
var element;

connection.connect(err => {
  if (err) throw err;
  console.log(colors.yellow(`connected as id ${connection.threadId}`));
  displayProductInfo();
});

var displayProductInfo = () => {
  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    res.forEach(e => {
      element = new Array(e.id, e.product_name, e.department_name, e.price, e.stock_quantity);
      table.push(element);
      console.log(table.toString());
    });
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
        var productSales = res[0].product_sales + customerCost;
        if (answers.quantity <= res[0].stock_quantity) {
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [{ stock_quantity: newStockQuantity }, { id: answers["product-id"] }],
            err => {
              if (err) throw err;
              console.log(colors.green.underline("\nAmount owed: $" + customerCost));
              console.log(colors.green("\nThanks for your business!\n"));
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [{ product_sales: productSales }, { id: answers["product-id"] }],
                err => {
                  if (err) throw err;
                  connection.end();
                }
              );
            }
          );
        } else {
          console.log(colors.red("\nWe don't have enough in stock\n"));
          addToShoppingCart();
        }
      });
    });
};
