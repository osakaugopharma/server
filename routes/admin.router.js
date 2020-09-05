const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
const AdminBroMongoose = require('admin-bro-mongoose');
const User = require('../models/users');
const Product = require('../models/product');
const Order = require('../models/order');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

AdminBro.registerAdapter(AdminBroMongoose);
const AdminBroOptions = {
  databases: [mongoose],
  rootPath: '/admin',
  resources: [
    { resource: User },
    { resource: Product },
    {
      resource: Order, options: {
        filterProperties: ['orderDate'],
        properties: {
          cart: { type: 'string' }
        }
      }
    },
  ],
  branding: {
    logo: '/images/logo.png',
    companyName: ''
  },
  locale: {
    translations: {
      labels: {
        User: 'Registered Users',
        Product: 'Product Listing',
        Order: 'User Orders',
      }
    }
  },
}

const adminBro = new AdminBro(AdminBroOptions);

const ADMIN = {
  email: 'oup@admin.com',
  password: 'admin'
}

AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: 'adminbro',
  cookiePassword: 'somePassword',
}, router, {
  resave: false,
  saveUninitialized: false,
});

module.exports = router;
