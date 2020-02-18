// required npm modules and files
require("dotenv").config();
const key = require("./key");
const inquirer = require("inquirer");
const colors = require("colors/safe");
const mysql = require("mysql");
const Table = require("cli-table");

// connection for mysql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: key.keys.secret,
  database: "bamazonDB",
});

// variables for table display
var tableHeaders = [
  "department id",
  "department name",
  "overhead costs",
  "product sales",
  "total profit",
];
var table = new Table({ head: tableHeaders });
var element;

connection.connect(err => {
  if (err) throw err;
  console.log(colors.bgYellow.black("\n Connected as id " + connection.threadId + " \n"));
  menuPrompt();
});

var menuPrompt = () => {
  inquirer
    .prompt([
      {
        name: "menu",
        type: "list",
        message: "What would you like to do?",
        choices: ["view product sales by department", "create new department", "EXIT"],
      },
    ])
    .then(answer => {
      switch (answer.menu) {
        case "view product sales by department":
          viewProductSales();
          break;

        case "create new department":
          createDepartment();
          break;

        default:
          connection.end(err => {
            if (err) throw err;
            console.log(colors.bgRed.black("              \n Disconnected \n              "));
          });
          break;
      }
    });
};

var viewProductSales = () => {
  connection.query(
    "SELECT departments.department_name, departments.department_id, departments.over_head_costs, SUM(products.product_sales) AS sales, (SUM(products.product_sales) - departments.over_head_costs) AS profit FROM	departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_id, departments.over_head_costs;",
    (err, res) => {
      if (err) throw err;
      res.forEach(e => {
        element = new Array(
          e.department_id,
          e.department_name,
          e.over_head_costs,
          e.sales,
          e.profit
        );
        table.push(element);
      });
      console.log("\n" + table.toString() + "\n");
      menuPrompt();
    }
  );
};

var createDepartment = () => {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "What is the new departments name?",
      },
      {
        name: "overhead",
        type: "input",
        message: "What is the overhead cost?",
      },
    ])
    .then(answers => {
      connection.query(
        "INSERT INTO departments SET ?",
        {
          department_name: answers.department,
          over_head_costs: parseFloat(answers.overhead),
        },
        err => {
          if (err) throw err;
          console.log(colors.bgGreen("                  \n Department Added \n                  "));
          menuPrompt();
        }
      );
    });
};
