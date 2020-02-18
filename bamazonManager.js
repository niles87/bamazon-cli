// required npm modules and files
require("dotenv").config();
var key = require("./key");
var inquirer = require("inquirer");
var colors = require("colors/safe");
var mysql = require("mysql");
var Table = require("cli-table");

// connection for mysql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: key.keys.secret,
  database: "bamazonDB",
});

// run to add colors to terminal
colors.enable();

// connect to the database once app has been initialize
connection.connect(err => {
  if (err) throw err;
  console.log(colors.bgYellow.black(`connected as id ${connection.threadId}`));
  startPrompt();
});

// once app started display a menu to navigate through
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
          connection.end(err => {
            if (err) throw err;
            console.log(colors.red("\nDisconnected\n"));
          });
          break;
      }
    });
};

// displays all product in database
var displayProductInfo = () => {
  var tableHeaders = ["id", "  product  ", "  department  ", "price", "stock", " sales "];
  var table = new Table({ head: tableHeaders });
  var element;
  connection.query("SELECT * FROM products", (err, products) => {
    if (err) throw err;
    products.forEach(e => {
      element = new Array(
        e.id,
        e.product_name,
        e.department_name,
        e.price,
        e.stock_quantity,
        e.product_sales
      );
      table.push(element);
      console.log(table.toString());
    });
    startPrompt();
  });
};

// displays only products with a stock of 50 or below
var lowInventory = () => {
  var tableHeaders = ["id", "  product  ", "  department  ", "stock"];
  var table = new Table({ head: tableHeaders });
  var element;
  connection.query("SELECT * FROM products WHERE stock_quantity <= ?", [50], (err, lowI) => {
    if (err) throw err;
    lowI.forEach(e => {
      element = new Array(e.id, e.product_name, e.department_name, e.stock_quantity);
      table.push(element);
      console.log(table.toString());
    });
    startPrompt();
  });
};

// allows user to add stock inventory to a list of products that are low
var addInventory = () => {
  connection.query("SELECT * FROM products WHERE stock_quantity <= ?", [50], (err, response) => {
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
            response.forEach(element => {
              arr.push(element.product_name);
            });
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
            console.log(colors.green("\nStock Updated.\n"));
            startPrompt();
          }
        );
      });
  });
};

// allows user to add a new product to the products database
var addNewProduct = () => {
  connection.query("SELECT * FROM departments", (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "product",
          type: "input",
          message: "What is the name of the product?",
        },
        {
          name: "department",
          type: "list",
          message: "What department does it belong in?",
          choices: () => {
            var choiceArray = [];
            res.forEach(el => {
              choiceArray.push(el.department_name);
            });
            return choiceArray;
          },
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
            product_sales: 0,
          },
          err => {
            if (err) throw err;
            console.log(colors.green("\nYour Product was added\n"));
            startPrompt();
          }
        );
      });
  });
};
