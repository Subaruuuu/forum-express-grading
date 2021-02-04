const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ include: Category })
      .then(restaurants => {
        const data = restaurants.map(eachRest => ({
          ...eachRest.dataValues,
          description: eachRest.dataValues.description.substring(0, 50),
          categoryName: eachRest.Category.name
        }))
        return res.render('restaurants', {
          restaurants: data
        })
      })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: Category })
      .then(restaurant => {
        return res.render('restaurant', {
          restaurant: restaurant.toJSON()
        })
      })
  }
}

module.exports = restController