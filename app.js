const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroMongoose = require('@admin-bro/mongoose')
const uploadFeature = require('@admin-bro/upload')
const express = require('express');
const User = require('./models/users')
const Product = require('./models/product')
const Order = require('./models/order')

const createError = require('http-errors');
// const formidableMiddleware = require('express-formidable');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('handlebars');
const expressHbs = require('express-handlebars');
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);

const indexRouter = require('./routes/index');
const userRoutes = require('./routes/user');
// const adminRouter = require('./routes/admin.router');
const app = express();

mongoose
  .connect('mongodb://localhost:27017/shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));


AdminBro.registerAdapter(AdminBroMongoose)
app.use('/uploads', express.static('uploads'))

const AdminBroOptions = {
  rootPath: '/admin',
  resources: [
    {
      resource: User,
    },
    {
      resource: Product,
      options: {
        properties: { uploadFile: { isVisible: false } }
      },
      features: [
        uploadFeature({
          provider: { local: { bucket: 'uploads' } },
          properties: {
            key: 'uploadedFile.path',
            bucket: 'uploadedFile.folder',
            mimeType: 'uploadedFile.type',
            size: 'uploadedFile.size',
            filename: 'uploadedFile.filename',
            file: 'uploadedFile',
          },
        }),
      ],
    },
    {
      resource: Order,
    },
  ],
}

const adminBro = new AdminBro(AdminBroOptions)
const router = AdminBroExpress.buildRouter(adminBro)
app.use(adminBro.options.rootPath, router)
app.listen(8080, () => console.log('AdminBro is running...'))



// mongoose.connect('mongodb+srv://oup_client:e02pq1vJD4gKBVMH@cluster0.jtray.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB Connected...'))
//   .catch(err => console.log(err));

require('./config/passport');

// view engine setup
app.engine(
  '.hbs',
  expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    handlebars: allowInsecurePrototypeAccess(handlebars),
  })
);
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use('/admin', formidableMiddleware());
// app.use(/^\/(?!admin).*/, express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(
  session({
    secret: 'mysupersecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'uploads')));
// app.use(express.static('public'));

app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use('/user', userRoutes);
// app.use('/admin', adminRouter);
app.use('/', indexRouter);

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
