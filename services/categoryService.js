const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


const categoryService = {
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

module.exports = categoryService