const db = require('../models')
const { Restaurant, Category, Comment, User } = db

const helpers = require('../_helpers')

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
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
            return res.render('restaurants', {
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

  getRestaurant: (req, res) => {
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

        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited: isFavorited,
          isLiked: isLiked
        })
      })
      .catch(err => res.sendStatus(500))
  },

  //人氣餐廳
  getTopRestaurant: (req, res) => {
    const loginUser = helpers.getUser(req)

    return Restaurant.findAll({
      include: { model: User, as: 'FavoritedUsers' }
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50),
        favoriteUsersCount: restaurant.FavoritedUsers.length,
        isFavorited: loginUser.FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
      }))
      restaurants = restaurants.sort((a, b) => b.favoriteUsersCount - a.favoriteUsersCount)
      const restaurantsTop10 = restaurants.slice(0, 10)
      res.render('topRestaurant', {
        restaurants: restaurantsTop10
      })
    })
      .catch(err => console.log(err))

  },

  //最新動態
  getFeeds: (req, res) => {
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
        return res.render('feeds', { restaurants: restaurants, comments: comments })
      })
      .catch(err => res.sendStatus(500))
  },

  //dashboard
  getDashboard: (req, res) => {
    const RestaurantId = req.params.id

    return Restaurant.findByPk(RestaurantId, { include: Category })
      .then(restaurant => {
        Comment.findAndCountAll({ where: { RestaurantId } })
          .then(comments => {
            const count = comments.count
            const rest = restaurant.toJSON()

            res.render('dashboard', {
              restaurant: rest,
              count: count
            })
          })
          .catch(err => res.sendStatus(500))
      })
      .catch(err => res.sendStatus(500))
  }
}

module.exports = restController