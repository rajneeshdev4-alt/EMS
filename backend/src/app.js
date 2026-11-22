const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const { globalLimiter } = require('./middleware/rateLimiter');
const { csrfProtection } = require('./middleware/csrf');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const expenseRoutes = require('./modules/expenses/expense.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const reportRoutes = require('./modules/reports/report.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}
app.use(globalLimiter);
// app.use(csrfProtection);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const apiBase = '/api/v1';
app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/users`, userRoutes);
app.use(`${apiBase}/expenses`, expenseRoutes);
app.use(`${apiBase}/dashboard`, dashboardRoutes);
app.use(`${apiBase}/reports`, reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;