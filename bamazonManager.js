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
  connection.query("", (err, inventory) => {
    if (err) throw err;
    console.log(inventory);
    startPrompt();
  });
};

var addInventory = () => {
  connection.query("", (err, response) => {
    if (err) throw err;
    console.log(response);
    startPrompt();
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
          console.log("Your Product was added");
          startPrompt();
        }
      );
    });
};
