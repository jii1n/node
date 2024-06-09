
DROP TABLE IF EXISTS OrderDetails;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Menu;
DROP TABLE IF EXISTS Categories;

-- 메뉴 테이블 
CREATE TABLE Menu (
    MenuID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100),
    ItemName VARCHAR(100),
    Price DECIMAL(5,2),
    Stock INT,
    UNIQUE KEY (ItemName)
);

INSERT INTO Menu (ItemName, Price, CategoryName, Stock) VALUES
('Americano', 4.00, 'Coffee', 50),
('Latte', 4.50, 'Coffee', 100),
('Green Tea', 4.00, 'Tea', 30),
('Fruit Smoothie', 5.00, 'Smoothie', 20),
('Chocolate Chip Cookie', 1.00, 'Snack', 25);


-- 주문 테이블(하루동안 판매된 주문 내역) 
CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    ItemName VARCHAR(100),
    OrderCount INT,
    OrderDate DATE
);

INSERT INTO Orders (ItemName, OrderCount, OrderDate) VALUES 
('Americano', 17, CURDATE()), 
('Latte', 21, CURDATE()), 
('Green Tea', 8, CURDATE()), 
('Fruit Smoothie', 8, CURDATE()), 
('Chocolate Chip Cookie', 25, CURDATE());

-- 정산 시 참고될 수 있는 총금액, 하루 동안 판매한 음료별 개수 테이블 
CREATE TABLE OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    ItemName VARCHAR(100),
    count INT,
    TotalPrice DECIMAL(10,2),
    RemainingStock INT,
    FOREIGN KEY (ItemName) REFERENCES Menu(ItemName)
);

INSERT INTO OrderDetails (ItemName, count, TotalPrice, RemainingStock)
SELECT o.ItemName, o.OrderCount, (m.Price * o.OrderCount) AS TotalPrice, (m.Stock - o.OrderCount) AS RemainingStock
FROM Orders o
JOIN Menu m ON m.ItemName = o.ItemName;


UPDATE Menu m
JOIN OrderDetails od ON m.ItemName = od.ItemName
SET m.Stock = od.RemainingStock;


