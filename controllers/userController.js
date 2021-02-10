const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db

const fs = require('fs')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')


const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
            .catch(err => res.sendStatus(500))
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  //取得使用者資料
  getUser: (req, res) => {
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


        res.render('users', {
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

  //編輯使用者資料
  editUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        res.render('usersEdit', { user: user.toJSON() })
      })
      .catch(err => res.sendStatus(500))
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "Please insert a name for user!")
      return res.redirect('back')
    }

    const { file } = req

    if (file) {
      helpers.imgurUploadPromise(file, IMGUR_CLIENT_ID)
        .then(img => {
          return User.findByPk(req.params.id)
            .then(user => {
              return user.update({
                name: req.body.name,
                image: file ? img.data.link : restaurant.image
              })
            })
            .then(user => {
              req.flash('success_messages', 'User profile was successfully updated')
              res.redirect(`/users/${user.id}`)
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
              req.flash('success_messages', 'user profile was successfully to update')
              res.redirect(`/users/${user.id}`)
            })
            .catch(err => res.sendStatus(500))
        })
    }

  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
      .catch(err => console.log(err))
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  },

  addLike: (req, res) => {
    const userId = helpers.getUser(req).id
    return Like.create({
      UserId: userId,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect('back')
      })
      .catch(err => console.log(err))
  },

  removeLike: (req, res) => {
    const userId = helpers.getUser(req).id
    return Like.findOne({
      where: {
        UserId: userId,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  },

  //美食達人
  getTopUser: (req, res) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
      .catch(err => console.log(err))
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
      .catch(err => console.log(err))
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  }

}

module.exports = userController