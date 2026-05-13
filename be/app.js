var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { sequelize, checkConnect } = require('./config/database');
var db = require('./models');
var cors = require('cors');

checkConnect();

// Đồng bộ hóa cấu trúc Database (Bỏ alter: true để tránh lỗi ER_TOO_MANY_KEYS)
db.sequelize.sync()
  .then(() => console.log('✅ Database đã được đồng bộ hóa thành công.'))
  .catch(err => console.error('❌ Lỗi đồng bộ hóa Database:', err));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var rolesRouter = require('./routes/roles');
var employeesRouter = require('./routes/employees');
var authRouter = require('./routes/auth');
var uploadsRouter = require('./routes/uploads');
var locationsRouter = require('./routes/locations');
var promotionsRouter = require('./routes/promotions');
var paymentsRouter = require('./routes/payments');
var discountTypesRouter = require('./routes/discount_types');
var ticketPricesRouter = require('./routes/ticket_prices');
var ticketTypesRouter = require('./routes/ticket_types');
var discountFieldsRouter = require('./routes/discount_fields');
var discountRegistrationsRouter = require('./routes/discount_registrations');
var ticketsRouter = require('./routes/tickets');
var ticketScanRouter = require('./routes/ticket_scan');
var ticketLogsRouter = require('./routes/ticket_logs');
var ticketCategoriesRouter = require('./routes/ticket_categories');
var ticketTypeLocationsRouter = require('./routes/ticket_type_locations');
var paymentMethodsRouter = require('./routes/payment_methods');
var vouchersRouter = require('./routes/vouchers');
var zaloPayRouter = require('./routes/zalopay');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/temp_uploads', express.static(path.join(__dirname, 'temp_uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);
app.use('/employees', employeesRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadsRouter);
app.use('/locations', locationsRouter);
app.use('/promotions', promotionsRouter);
app.use('/payments', paymentsRouter);
app.use('/payment-methods', paymentMethodsRouter);
app.use('/discount-types', discountTypesRouter);
app.use('/ticket-prices', ticketPricesRouter);
app.use('/ticket-types', ticketTypesRouter);
app.use('/discount-fields', discountFieldsRouter);
app.use('/discount-registrations', discountRegistrationsRouter);
app.use('/tickets', ticketsRouter);
app.use('/ticket-scan', ticketScanRouter);
app.use('/ticket-logs', ticketLogsRouter);
app.use('/ticket-categories', ticketCategoriesRouter);
app.use('/ticket-type-locations', ticketTypeLocationsRouter);
app.use('/vouchers', vouchersRouter);
app.use('/zalopay', zaloPayRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
