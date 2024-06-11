const express = require('express');
const mysql = require('mysql');
const dbconfig = require('./dbconf.js');
const connection = mysql.createConnection(dbconfig);
const app = express();

app.get('/', (req, res) => { res.send('<h1> Edelweiss<\h1>');
});

// 원본 메뉴 항목 조회 (업데이트 전, stock)
app.get('/od.menu', (req, res) => {
    connection.query('SELECT * FROM OriginalMenu', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        let str = "<table border='1'><tr><th>MenuID</th><th>CategoryName</th><th>ItemName</th><th>Price</th><th>Stock</th></tr>";
        for (let i = 0; i < results.length; i++) {
            const stockColor = results[i].Stock <= 25 ? 'red' : 'green';  // 25 이하일 때 빨간색, 그 이상일 때 녹색
            str += `<tr><td>${results[i].MenuID}</td><td>${results[i].CategoryName}</td><td>${results[i].ItemName}</td><td>${results[i].Price}</td><td style="color:${stockColor}">${results[i].Stock}</td></tr>`;
        }
        str += "</table>";
        res.send(str);
    });
});


// 업데이트된 메뉴 조회(remainingstock)
app.get('/new.menu', (req, res) => {
    const updateMenuSql = `
    UPDATE Menu m
    JOIN OrderDetails od ON m.ItemName = od.ItemName
    SET m.Stock = od.RemainingStock;
    `;
    connection.query(updateMenuSql, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error during menu update');
        }

        connection.query('SELECT * FROM Menu', (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            let str = "<table border='1'><tr><th>MenuID</th><th>CategoryName</th><th>ItemName</th><th>Price</th><th>Stock</th></tr>";
            results.forEach(result => {
                const stockColor = result.Stock <= 25 ? 'red' : 'green';
                str += `<tr><td>${result.MenuID}</td><td>${result.CategoryName}</td><td>${result.ItemName}</td><td>${result.Price}</td><td style="color:${stockColor}">${result.Stock}</td></tr>`;
            });
            str += "</table>";
            res.send(str);
        });
    });
});

// 주문 내역 조회
app.get('/orders', (req, res) => {
    const sql = `
    SELECT OrderID, ItemName, OrderCount, DATE_FORMAT(OrderDate, '%Y-%m-%d') AS OrderDate
    FROM Orders;
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        let str = "<table border='1'><tr><th>OrderID</th><th>ItemName</th><th>OrderCount</th><th>OrderDate</th></tr>";
        for (let i = 0; i < results.length; i++) {
            str += `<tr><td>${results[i].OrderID}</td><td>${results[i].ItemName}</td><td>${results[i].OrderCount}</td><td>${results[i].OrderDate}</td></tr>`;
        }
        str += "</table>";
        res.send(str);
    });
});


// 총 정산 (하루 판매금액, 목록등)
app.get('/orderdetails', (req, res) => {
    const sql = `
    SELECT od.OrderDetailID, m.ItemName, od.count, od.TotalPrice, od.RemainingStock, DATE_FORMAT(o.OrderDate, "%Y-%m-%d") AS OrderDate
    FROM OrderDetails od
    JOIN Menu m ON m.ItemName = od.ItemName
    JOIN Orders o ON o.ItemName = od.ItemName
    ORDER BY od.OrderDetailID
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        const totalAmount = results.reduce((acc, cur) => acc + parseFloat(cur.TotalPrice), 0);
        let str = "<table border='1'><tr><th>OrderDetailID</th><th>ItemName</th><th>Count</th><th>TotalPrice</th><th>RemainingStock</th></tr>";
        results.forEach(result => {
            const stockColor = result.RemainingStock <= 25 ? 'red' : 'green';
            str += `<tr><td>${result.OrderDetailID}</td><td>${result.ItemName}</td><td>${result.count}</td><td>${result.TotalPrice}</td><td style="color:${stockColor}">${result.RemainingStock}</td></tr>`;
        });
        str += `<tr><td colspan="2">Order Date</td><td colspan="3">${results[0]?.OrderDate || ''}</td></tr>`;
        str += `<tr><td colspan="2">Total Amount</td><td colspan="3">${totalAmount.toFixed(2)}</td></tr>`;
        str += "</table>";
        res.send(str);
    });
});

app.listen(3000, () => {
    console.log("Server starting at http://localhost:3000");
});
