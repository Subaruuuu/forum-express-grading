const fs = require('fs')

const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService')

const adminController = {
  //get all restaurant
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
    // return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
    //   .then(restaurants => {
    //     return res.render('admin/restaurants', { restaurants: restaurants })
    //   })
    //   .catch(err => res.sendStatus(500))
  },

  getUsers: (req, res) => {
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        return res.render('admin/users', { users: users })
      })
      .catch(err => res.sendStatus(500))
  },

  toggleAdmin: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        // console.log(user)
        user.update({ isAdmin: !user.isAdmin })
          .then(() => {
            req.flash('success_messages', 'user was succesfully to update')
            res.redirect('/admin/users')
          })
          .catch(err => res.sendStatus(500))
      })
      .catch(err => res.sendStatus(500))
  },


  //get create restaurant page
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/create', { categories: categories })
      })
      .catch(err => res.sendStatus(500))
  },

  //post create restaurant
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
          .catch(err => res.sendStatus(500))
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
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
        .catch(err => res.sendStatus(500))
    }
  },

  //get restaurant detail
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    }).then(restaurant => {
      return res.render('admin/restaurant', {
        restaurant: restaurant
      })
    })
      .catch(err => res.sendStatus(500))
  },

  //get edit restaurant detail
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true })
      .then(restaurant => {
        Category.findAll({ raw: true, nest: true })
          .then(categories => {
            return res.render('admin/create', {
              restaurant: restaurant,
              categories: categories
            })
          })
      })
      .catch(err => res.sendStatus(500))
  },

  //post edit restaurant detail
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
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
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
              .catch(err => res.sendStatus(500))
          })
          .catch(err => res.sendStatus(500))
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
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
            .catch(err => res.sendStatus(500))
        })
        .catch(err => res.sendStatus(500))
    }
  },

  //delete restaurant
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            res.redirect('/admin/restaurants')
          })
          .catch(err => res.sendStatus(500))
      })
      .catch(err => res.sendStatus(500))
  }
}

module.exports = adminController