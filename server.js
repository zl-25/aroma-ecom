const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données', err);
    } else {
        console.log('Connecté à la base de données SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            bundle TEXT,
            total_price TEXT,
            status TEXT DEFAULT 'En attente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL,
            stock INTEGER,
            image TEXT,
            status TEXT DEFAULT 'Actif',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS visitors (
            session_id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Active visitors tracking
const activeVisitorsMap = {};


// API Routes

// Create a new order
app.post('/api/orders', (req, res) => {
    const { firstName, lastName, phone, address, city, bundle, totalPrice } = req.body;
    
    if (!firstName || !lastName || !phone || !address || !city) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const query = `INSERT INTO orders (first_name, last_name, phone, address, city, bundle, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [firstName, lastName, phone, address, city, bundle, totalPrice], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
        }
        res.status(201).json({ message: 'Commande créée avec succès', orderId: this.lastID });
    });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' });
        }
        res.json(rows);
    });
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
        }
        res.json({ message: 'Statut mis à jour avec succès' });
    });
});

// Track visits
app.post('/api/visit', (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.json({ success: false });

    // Update active timestamp
    activeVisitorsMap[sessionId] = Date.now();

    // Insert into DB if it doesn't exist
    db.run(`INSERT OR IGNORE INTO visitors (session_id) VALUES (?)`, [sessionId], (err) => {
        res.json({ success: true });
    });
});


// Get Dashboard Stats
app.get('/api/stats', (req, res) => {
    db.all(`SELECT * FROM orders`, [], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
        }
        
        db.all(`SELECT COUNT(*) as count FROM visitors`, [], (err, vResult) => {
            let totalVisitors = vResult && vResult[0] ? vResult[0].count : 0;
            
            let totalRevenue = 0;
            let totalOrders = orders.length;

            const salesByDate = {};
            orders.forEach(o => {
                const priceStr = o.total_price ? String(o.total_price) : '0';
                const priceNum = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
                if (o.status !== 'Annulée') {
                    totalRevenue += priceNum;
                    const d = new Date(o.created_at).toLocaleDateString('fr-FR');
                    salesByDate[d] = (salesByDate[d] || 0) + priceNum;
                }
            });

            // Generate last 7 days for the chart
            const labels = [];
            const chartDataArray = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('fr-FR');
                labels.push(dateStr.substring(0, 5)); // e.g. "14/05"
                chartDataArray.push(salesByDate[dateStr] || 0);
            }

            // Real active visitors (last 15 seconds)
            const now = Date.now();
            let activeVisitors = 0;
            for (const [sessId, lastSeen] of Object.entries(activeVisitorsMap)) {
                if (now - lastSeen < 15000) {
                    activeVisitors++;
                } else {
                    delete activeVisitorsMap[sessId]; // cleanup
                }
            }
            
            const conversionRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : "0.0";

            res.json({
                totalRevenue,
                totalOrders,
                totalVisitors,
                activeVisitors,
                conversionRate,
                chartData: {
                    labels: labels,
                    data: chartDataArray
                }
            });
        });
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erreur.' });
        res.json(rows);
    });
});

// Create product
app.post('/api/products', (req, res) => {
    const { name, price, stock, image } = req.body;
    db.run(`INSERT INTO products (name, price, stock, image) VALUES (?, ?, ?, ?)`, 
        [name, price, stock, image], 
        function(err) {
            if (err) return res.status(500).json({ error: 'Erreur.' });
            res.json({ id: this.lastID, name, price, stock, image });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Accessible sur le réseau local via l'adresse IP de votre machine (ex: http://192.168.X.X:${PORT})`);
});
