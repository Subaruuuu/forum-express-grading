const fs = require('fs')

const db = require('../../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../../services/adminService')

const adminController = {
  //get all restaurant
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.json(data)
    })
    // return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
    //   .then(restaurants => {
    //     return res.json({ restaurants: restaurants })
    //   })
    //   .catch(err => res.sendStatus(500))
  }
}

module.exports = adminController