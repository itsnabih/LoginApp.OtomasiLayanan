const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Login app is running' });
});

// Login page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Page New</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 50px; }
                .login-form { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
                input { width: 100%; padding: 10px; margin: 10px 0; }
                button { width: 100%; padding: 10px; background: #007cba; color: white; border: none; }
            </style>
        </head>
        <body>
            <div class="login-form">
                <h2>Login new 2025</h2>
                <form action="/login" method="POST">
                    <input type="text" name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple authentication (in real app, use proper auth)
    if (username === 'admin' && password === 'password') {
        res.send('<h2>Login Successful!</h2><a href="/">Back to Login</a>');
    } else {
        res.send('<h2>Login Failed!</h2><a href="/">Try Again</a>');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
