DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products(
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2),
    stock_quantity INT,
    product_sales DECIMAL(15,2),
    PRIMARY KEY (id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity, product_sales)
VALUES ("shampoo", "self care", 5.00, 100, 3000.00),
 ("toothbrush", "self care", 3.50, 200, 1000.00),
 ("milk", "grocery", 4.00, 20, 2000.00),
 ("eggs", "grocery", 3.75, 500, 2000.00),
 ("cereal", "grocery", 2.50, 100, 1500.00),
 ("jeans", "clothes", 50.00, 500, 1000.00),
 ("t-shirt", "clothes", 15.00, 150, 1000.00),
 ("bamazon TV", "electronics", 500.00, 50, 4000.00),
 ("bPhone", "electronics", 1000.00, 60, 40000.00),
 ("bComp", "electronics", 2500.00, 40, 10000.00);

CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs DECIMAL(15,2),
    PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("clothes", 10000.00),
 ("electronics", 20000.00),
 ("grocery", 9000.00),
 ("self care", 5000.00);