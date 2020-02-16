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

connection.connect(err => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}`);
  startPrompt();
});

var startPrompt = () => {
  inquirer
    .prompt({
      name: "question",
      type: "list",
      message: "What would you like to do?",
      choices: ["View Products", "View Low Inventory", "Add Inventory", "Add New Product", "EXIT"],
    })
    .then(answer => {
      switch (answer.question) {
        case "View Products":
          displayProductInfo();
          break;

        case "View Low Inventory":
          lowInventory();
          break;

        case "Add Inventory":
          addInventory();
          break;

        case "Add New Product":
          addNewProduct();
          break;
        default:
          connection.end();
          break;
      }
    });
};

var displayProductInfo = () => {
  connection.query("SELECT * FROM products", (err, products) => {
    if (err) throw err;
    console.log(products);
    startPrompt();
  });
};

var lowInventory = () => {
  connection.query("SELECT * FROM products WHERE stock_quantity <=?", [50], (err, products) => {
    if (err) throw err;
    console.log("\n");
    console.log(products);
    console.log("\n");
    startPrompt();
  });
};

var addInventory = () => {
  connection.query("SELECT * FROM products WHERE stock_quantity <=?", [50], (err, response) => {
    if (err) throw err;
    console.log("\n");
    inquirer
      .prompt([
        {
          name: "product",
          type: "list",
          message: "Which product needs more in stock?",
          choices: () => {
            var arr = [];
            for (var i = 0; i < response.length; i++) {
              arr.push(response[i].product_name);
            }
            return arr;
          },
        },
        {
          name: "quantity",
          type: "input",
          message: "How much is being added?",
        },
      ])
      .then(answers => {
        var productToUpdate;
        for (var j = 0; j < response.length; j++) {
          if (response[j].product_name === answers.product) {
            productToUpdate = response[j];
          }
        }
        var newQuantity = parseInt(productToUpdate.stock_quantity) + parseInt(answers.quantity);
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [{ stock_quantity: newQuantity }, { product_name: productToUpdate.product_name }],
          err => {
            if (err) throw err;
            console.log("\nStock Updated.\n");
            startPrompt();
          }
        );
      });
  });
};

var addNewProduct = () => {
  inquirer
    .prompt([
      {
        name: "product",
        type: "input",
        message: "What is the name of the product?",
      },
      {
        name: "department",
        type: "input",
        message: "What department does it belong in?",
      },
      {
        name: "price",
        type: "input",
        message: "How much are we selling it for?",
      },
      {
        name: "quantity",
        type: "input",
        message: "How many are we going to have in stock?",
      },
    ])
    .then(reply => {
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: reply.product,
          department_name: reply.department,
          price: parseFloat(reply.price),
          stock_quantity: parseInt(reply.quantity),
        },
        err => {
          if (err) throw err;
          console.log("\nYour Product was added\n");
          startPrompt();
        }
      );
    });
};
