const restService = require('../../services/restService')

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      return res.json(data)
    })
  },

  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },

  //人氣餐廳
  getTopRestaurant: (req, res) => {
    restService.getTopRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },

  //最新動態
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, (data) => {
      return res.json(data)
    })
  },

  //dashboard
  getDashboard: (req, res) => {
    restService.getDashboard(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = restController