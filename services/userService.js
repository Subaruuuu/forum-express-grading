const helpers = require('../_helpers')

const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userService = {
  getUser: (req, res, callback) => {
    const loginUser = helpers.getUser(req)
    const userId = req.params.id

    return User.findByPk(userId, {
      include: [{ model: Comment, include: Restaurant },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' },
      { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    })
      .then(user => {
        const userData = user.dataValues
        const { FavoritedRestaurants, Followings, Followers, Comments } = userData
        const followersData = Followers.map(d => ({ ...d.dataValues }))
        const favoriteRestData = FavoritedRestaurants.map(d => ({ ...d.dataValues }))
        const followingData = Followings.map(d => ({ ...d.dataValues }))
        const commentsData = Comments.map(d => ({ ...d.dataValues }))
        const commentOnRestData = commentsData.map(d => ({ ...d.Restaurant.dataValues }))
        const isFollowed = loginUser.Followings.map(d => d.id).includes(user.id)

        const allIds = commentOnRestData.map(r => r.id)
        const uniqCommentOnRestData = commentOnRestData.filter(({ id }, index) => !allIds.includes(id, index + 1))

        callback({
          user: user.toJSON(),
          isFollowed: isFollowed,
          loginUser: loginUser,
          uniqCommentOnRestData: uniqCommentOnRestData,
          favoriteRestData: favoriteRestData,
          followersData: followersData,
          followingData: followingData,
        })
      })
      .catch(err => console.log(err))

  },

  editUser: (req, res, callback) => {
    return User.findByPk(req.params.id)
      .then(user => {
        callback({ user: user.toJSON() })
      })
      .catch(err => res.sendStatus(500))
  },

  putUser: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "Please insert a name for user!" })
    }

    const { file } = req

    if (file) {
      helpers.imgurUploadPromise(file, IMGUR_CLIENT_ID)
        .then(img => {
          return User.findByPk(req.params.id)
            .then(user => {
              return user.update({
                name: req.body.name,
                image: file ? img.data.link : user.image
              })
            })
            .then(user => {
              callback({ status: 'success', message: 'User profile was successfully updated', user: user })
            })
            .catch(err => console.log(err))
        })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          return user.update({
            name: req.body.name,
            image: user.image
          })
            .then(user => {
              callback({ status: 'success', message: 'User profile was successfully to update', user: user })
            })
            .catch(err => console.log(err))
        })
    }

  },

  //美食達人
  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      callback({ users: users })
      return res.render('topUser', { users: users })
    })
      .catch(err => console.log(err))
  },

  addFavorite: (req, res, callback) => {
    const userId = helpers.getUser(req).id
    return Favorite.findOrCreate({
      where: { RestaurantId: req.params.restaurantId },
      defaults: {
        UserId: userId,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((restaurant) => {
        callback({ status: 'success', message: '' })
      })
      .catch(err => console.log(err))
  },

  removeFavorite: (req, res, callback) => {
    const userId = helpers.getUser(req).id
    return Favorite.findOne({
      where: {
        UserId: userId,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        if (favorite === null) {
          callback({ status: 'success', message: '' })
        }
        favorite.destroy()
        callback({ status: 'success', message: '' })
      })
      .catch(err => console.log(err))
  },

  addLike: (req, res, callback) => {
    const userId = helpers.getUser(req).id
    return Like.findOrCreate({
      where: { RestaurantId: req.params.restaurantId },
      defaults: {
        UserId: userId,
        RestaurantId: req.params.restaurantId
      }
    }).then(restaurant => {
      callback({ status: 'success', message: '' })
    })
      .catch(err => console.log(err))
  },

  removeLike: (req, res, callback) => {
    const userId = helpers.getUser(req).id
    return Like.findOne({
      where: {
        UserId: userId,
        RestaurantId: req.params.restaurantId
      }
    }).then(like => {
      if (like === null) {
        callback({ status: 'success', message: '' })
      }
      like.destroy()
      callback({ status: 'success', message: '' })
    })
      .catch(err => console.log(err))
  },

  addFollowing: (req, res, callback) => {
    const userId = helpers.getUser(req).id
    return Followship.findOrCreate({
      where: { followingId: req.params.userId },
      defaults: {
        followerId: userId,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        callback({ status: 'success', message: '' })
      })
      .catch(err => console.log(err))
  },

  removeFollowing: (req, res, callback) => {
    const userId = helpers.getUser(req).id
    return Followship.findOne({
      where: {
        followerId: userId,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        if (followship === null) {
          callback({ status: 'success', message: '' })
        }
        followship.destroy()
        callback({ status: 'success', message: '' })
      })
      .catch(err => console.log(err))
  }
}

module.exports = userService