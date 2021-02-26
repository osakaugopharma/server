const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroMongoose = require('@admin-bro/mongoose')
const uploadFeature = require('@admin-bro/upload')
const User = require('../models/users')
const Product = require('../models/product')
const Order = require('../models/order')
const express = require('express')
const path = require('path')
// const bcrypt = require('bcrypt-nodejs');
const app = express()

AdminBro.registerAdapter(AdminBroMongoose)
// const router = express.Router()

// app.use('/uploads', express.static('uploads'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
// const ADMIN = {
//   email: 'oup@admin.com',
//   password: 'admin',
// }

const router = AdminBroExpress.buildRouter(adminBro)

// const router = AdminBroExpress.buildAuthenticatedRouter(
//   adminBro,
//   {
//     authenticate: async (email, password) => {
//       const user = await User.findOne({ email })
//       if(user) {
//         const matched = bcrypt.compareSync(password, user.password)
//         if(matched) {
//           return user
//         }
//       }
//       return false
//     },
//     cookiePassword: 'somePassword',
//   },
// )
app.use(adminBro.options.rootPath, router)
app.listen(8080, () => console.log('AdminBro is running...'))

// const AdminBroOptions = {
//   databases: [mongoose],
//   rootPath: '/admin',
//   resources: [
//     { resource: User },
//     {
//       resource: Product,
//       features: [
//         uploadFeature({
//           provider: { local: { bucket: 'uploads' } },
//           properties: {
//             key: 'uploadedFile.path',
//             bucket: 'uploadedFile.folder',
//             mimeType: 'uploadedFile.type',
//             size: 'uploadedFile.size',
//             filename: 'uploadedFile.filename',
//             file: 'uploadedFile',
//           },
//         }),
//       ],
//     },
//     {
//       resource: Order,
//       options: {
//         filterProperties: ['orderDate'],
//         properties: {
//           cart: { type: 'string' },
//         },
//       },
//     },
//   ],
//   branding: {
//     logo: '/images/logo.png',
//     companyName: '',
//   },
//   locale: {
//     translations: {
//       labels: {
//         User: 'Registered Users',
//         Product: 'Product Listing',
//         Order: 'User Orders',
//       },
//     },
//   },
// }

// const adminBro = new AdminBro(AdminBroOptions)

// AdminBroExpress.buildAuthenticatedRouter(
//   adminBro,
//   {
//     authenticate: async (email, password) => {
//       if (ADMIN.password === password && ADMIN.email === email) {
//         return ADMIN
//       }
//       return null
//     },
//     cookieName: 'adminbro',
//     cookiePassword: 'somePassword',
//   },
//   router,
//   {
//     resave: false,
//     saveUninitialized: false,
//   }
// )

module.exports = router
