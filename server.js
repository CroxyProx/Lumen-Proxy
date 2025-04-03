const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Universal Proxy Middleware
app.use('/proxy', createProxyMiddleware({
    target: '', // Will be dynamically set
    changeOrigin: true,
    router: req => {
        if (!req.query.url) return 'http://localhost';  
        const targetUrl = new URL(req.query.url);
        return `${targetUrl.protocol}//${targetUrl.host}`;
    },
    pathRewrite: (path, req) => new URL(req.query.url).pathname + new URL(req.query.url).search
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
