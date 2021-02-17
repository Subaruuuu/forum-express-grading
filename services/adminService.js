const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')


const adminService = {

  getUsers: (req, res, callback) => {
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        callback({ users: users })
      })
      .catch(err => res.sendStatus(500))
  },

  toggleAdmin: (req, res, callback) => {
    return User.findByPk(req.params.id)
      .then(user => {
        user.update({ isAdmin: !user.isAdmin })
          .then(() => {
            callback({ status: 'success', message: 'user was succesfully update' })
          })
          .catch(err => res.sendStatus(500))
      })
      .catch(err => res.sendStatus(500))
  },

  //所有餐廳
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => {
        callback({ restaurants: restaurants })
      })
      .catch(err => res.sendStatus(500))
  },

  //單個餐廳
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    }).then(restaurant => {
      callback({ restaurant: restaurant })
    })
      .catch(err => res.sendStatus(500))
  },

  //get create restaurant page
  createRestaurant: (req, res, callback) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        callback({ categories: categories })
      })
      .catch(err => res.sendStatus(500))
  },

  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      helpers.imgurUploadPromise(file, IMGUR_CLIENT_ID)
        .then(img => {
          return Restaurant.create({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: file ? img.data.link : null,
            CategoryId: req.body.categoryId
          }).then((restaurant) => {
            callback({ status: 'success', message: 'restaurant was successfully created' })
          })
            .catch(err => console.log(err))
        })
    }
    else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {
        callback({ status: 'success', message: 'restaurant was successfully created' })
      })
        .catch(err => console.log(err))
    }
  },

  //get edit restaurant detail
  editRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true })
      .then(restaurant => {
        Category.findAll({ raw: true, nest: true })
          .then(categories => {
            callback({ restaurant: restaurant, categories: categories })
          })
      })
      .catch(err => res.sendStatus(500))
  },


  //修改餐廳資料
  putRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      helpers.imgurUploadPromise(file, IMGUR_CLIENT_ID)
        .then(img => {
          return Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
              restaurant.update({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                image: file ? img.data.link : restaurant.image,
                CategoryId: req.body.categoryId
              })
                .then((restaurant) => {
                  callback({ status: 'success', message: 'restaurant was successfully created' })
                })
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        })
    }
    else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          })
            .then((restaurant) => {
              callback({ status: 'success', message: 'restaurant was successfully created' })
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    }
  },


  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          })
          .catch(err => res.sendStatus(500))
      })
      .catch(err => res.sendStatus(500))
  }
}

module.exports = adminService