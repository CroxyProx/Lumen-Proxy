const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Enable logging
app.use(morgan('dev'));

// Proxy Middleware
app.use('/proxy', (req, res, next) => {
    try {
        if (!req.query.url) {
            return res.status(400).json({ error: 'Missing "url" query parameter' });
        }
        
        const targetUrl = new URL(req.query.url);
        req.targetUrl = targetUrl; // Store it for use in the proxy middleware
        next();
    } catch (error) {
        return res.status(400).json({ error: 'Invalid URL' });
    }
});

app.use('/proxy', createProxyMiddleware({
    target: 'http://localhost', // Default target (will be overridden dynamically)
    changeOrigin: true,
    router: (req) => `${req.targetUrl.protocol}//${req.targetUrl.host}`,
    pathRewrite: (path, req) => req.targetUrl.pathname + req.targetUrl.search,
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy request failed' });
    },
    onProxyReq: (proxyReq, req) => {
        console.log(`Proxying request to: ${req.targetUrl.href}`);
    }
}));

// Home Page
app.get('/', (req, res) => {
    res.send(`
        <h1>Bug-Free Potato Proxy!</h1>
        <form action="/proxy" method="get">
            <input type="text" name="url" placeholder="Enter URL..." required>
            <button type="submit">Go!</button>
        </form>
    `);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Proxy running at http://localhost:${PORT}`);
});
