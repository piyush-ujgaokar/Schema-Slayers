const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Core routes
const authRoutes = require('./routes/auth.routes');
const compileRoutes = require('./routes/compile.routes');
const aiRoutes = require('./routes/ai.routes');
const projectRoutes = require('./routes/project.routes');

app.use('/api/auth', authRoutes);
app.use('/api/compile', compileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Full Stack Visual Builder Service' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;