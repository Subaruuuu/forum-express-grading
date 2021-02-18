const helpers = require('../_helpers')

const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship, Category } = db
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const sequelize = require('sequelize')

const pageLimit = 10

const restService = {
  getRestaurants: (req, res, callback) => {
    const loginUser = helpers.getUser(req)

    const whereQuery = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }

    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    Restaurant.findAndCountAll({
      include: Category, where: whereQuery,
      offset: offset, limit: pageLimit
    })
      .then(result => {
        const page = Number(req.query.page) || 1
        const pages = Math.ceil(result.count / pageLimit)
        const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        const prev = page - 1 < 1 ? 1 : page - 1
        const next = page + 1 > pages ? pages : page + 1

        const data = result.rows.map(r => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          categoryName: r.Category.name,
          isFavorited: loginUser.FavoritedRestaurants.map(d => d.id).includes(r.id),
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
        }))

        Category.findAll({ raw: true, nest: true })
          .then(categories => { // 取出 categoies 
            callback({
              restaurants: data,
              categories: categories,
              categoryId: categoryId,
              page: page,
              totalPage: totalPage,
              prev: prev,
              next: next
            })
          })
          .catch(err => res.sendStatus(500))
      })
      .catch(err => res.sendStatus(500))
  },

  getRestaurant: (req, res, callback) => {
    const userId = helpers.getUser(req).id

    return Restaurant.findByPk(req.params.id, {
      include: [Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }]
    })
      .then(restaurant => {
        restaurant.viewCounts++
        return restaurant.save()
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(userId)
        const isLiked = restaurant.LikedUsers.map(d => d.id).includes(userId)

        callback({
          restaurant: restaurant.toJSON(),
          isFavorited: isFavorited,
          isLiked: isLiked
        })
      })
      .catch(err => res.sendStatus(500))
  },

  getTopRestaurant: (req, res, callback) => {
    const loginUser = helpers.getUser(req)

    return Restaurant.findAll({
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM Favorites WHERE Favorites.RestaurantId = Restaurant.id)'), 'FavoritedCount']
        ]
      },
      order: [
        [sequelize.literal('FavoritedCount'), 'DESC']
      ],
      raw: true, nest: true,
      limit: 10,
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant,
        description: restaurant.description.substring(0, 50),
        isFavorited: loginUser.FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
      }))
      callback({ restaurants: restaurants })
    })
      .catch(err => console.log(err))

  },

  getFeeds: (req, res, callback) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true, nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ])
      .then(([restaurants, comments]) => {
        callback({ restaurants: restaurants, comments: comments })
      })
      .catch(err => res.sendStatus(500))
  },

  getDashboard: (req, res, callback) => {
    const RestaurantId = req.params.id

    return Restaurant.findByPk(RestaurantId, { include: Category })
      .then(restaurant => {
        Comment.findAndCountAll({ where: { RestaurantId } })
          .then(comments => {
            const count = comments.count
            const rest = restaurant.toJSON()
            callback({
              restaurant: rest,
              count: count
            })
          })
          .catch(err => res.sendStatus(500))
      })
      .catch(err => res.sendStatus(500))
  }
}

module.exports = restService