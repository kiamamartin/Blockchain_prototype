const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain'); // Adjust to your actual blockchain class
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT authentication
const emailValidator = require('email-validator'); // To validate email formats
require('dotenv').config();

const app = express();
const PORT = 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key'; // Keep secret in .env file
const saltRounds = 10;

// Create a blockchain instance
let votingBlockchain = new Blockchain();

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kiamamartinsql@92',
    database: 'voting_system'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend static files

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Endpoint to register a new user
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Email format validation
    if (!emailValidator.validate(email)) {
        return res.json({ success: false, message: 'Invalid email format' });
    }

    // Password strength check
    const strongPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!strongPassword.test(password)) {
        return res.json({ success: false, message: 'Password must be at least 8 characters long and include 1 uppercase letter and 1 number' });
    }

    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.json({ success: false, message: 'Error hashing password' });
        }

        // Generate public/private keys for the user
        const keys = votingBlockchain.generateKeyPair();

        // Insert user into the MySQL database
        const query = 'INSERT INTO users (username, email, password_hash, public_key, private_key) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [username, email, hash, keys.publicKey, keys.privateKey], (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Error registering user' });
            }
            res.json({ success: true, message: 'User registered successfully' });
        });
    });
});

// Endpoint for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Retrieve user by username from the database
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare password
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid username or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ success: true, message: 'Login successful', token });
        });
    });
});

// Endpoint to check if user is registered
app.get('/is-registered', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const user = results[0];
        // Check if user has public/private keys (indicating registration)
        if (user.public_key && user.private_key) {
            return res.json({ isRegistered: true });
        } else {
            return res.json({ isRegistered: false });
        }
    });
});

// Endpoint to cast a vote (protected with JWT authentication)
app.post('/vote', authenticateToken, (req, res) => {
    const { candidate } = req.body;
    const userId = req.user.id;

    // Retrieve user's public and private keys from the database
    const query = 'SELECT public_key, private_key FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.json({ success: false, message: 'User not found or error occurred' });
        }

        const { public_key, private_key } = results[0];

        // Encrypt the vote and add it to the blockchain
        votingBlockchain.addBlock(public_key, private_key, { candidate });
        res.json({ success: true, message: 'Vote submitted successfully' });
    });
});

// Endpoint to fetch the blockchain
app.get('/blockchain', (req, res) => {
    res.json(votingBlockchain);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
