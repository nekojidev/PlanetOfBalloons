import express from 'express';
const router = express.Router();

router.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});

router.get('/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS is working properly',
    origin: req.headers.origin || 'No origin header found',
    headers: {
      sent: req.headers,
      allowed: res.getHeaders()
    }
  });
});

export default router;
