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
  },

  getUsers: (req, res) => {
    adminService.getUsers(req, res, (data) => {
      return res.render('admin/users', data)
    })
  },

  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/users')
      }
    })
  },

  //get create restaurant page
  createRestaurant: (req, res) => {
    adminService.createRestaurant(req, res, (data) => {
      return res.render('admin/create', data)
    })
  },

  //post create restaurant
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/restaurants')
    })
  },

  //get restaurant detail
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },

  //get edit restaurant detail
  editRestaurant: (req, res) => {
    adminService.editRestaurant(req, res, (data) => {
      return res.render('admin/create', data)
    })
  },

  //post edit restaurant detail
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/restaurants')
    })
  },

  //delete restaurant
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  }
}

module.exports = adminController