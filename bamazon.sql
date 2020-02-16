DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products(
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2),
    stock_quantity INT,
    PRIMARY KEY (id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES ("shampoo", "self care", 5.00, 100),
 ("toothbrush", "self care", 3.50, 200),
 ("milk", "grocery", 4.00, 20),
 ("eggs", "grocery", 3.75, 500),
 ("cereal", "grocery", 2.50, 100),
 ("jeans", "clothes", 50.00, 500),
 ("t-shirt", "clothes", 15.00, 150),
 ("bamazon tv", "electronics", 500.00, 50),
 ("bPhone", "electronics", 1000.00, 60),
 ("bMac", "electronics", 2500.00, 40);