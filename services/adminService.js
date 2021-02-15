const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


const adminService = {
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

  //類別
  getCategories: (req, res, callback) => {
    return Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then((category) => {
              callback({ categories: categories, category: category.toJSON() })
            })
        } else {
          callback({ categories: categories })
        }
      })
      .catch(err => res.sendStatus(500))
  }
}

module.exports = adminService