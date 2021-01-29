const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants: restaurants })
      })
  }
}

module.exports = adminController