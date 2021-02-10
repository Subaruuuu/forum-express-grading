const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like } = db

const fs = require('fs')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')


const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {

    // confirm password
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
    const logUser = req.user
    const userId = req.params.id

    return User.findByPk(userId)
      .then(user => {
        Comment.findAndCountAll({ include: Restaurant, where: { userId } })
          .then(comment => {
            const count = comment.count

            const data = comment.rows.map(r => ({
              ...r.dataValues,
              restaurantImage: r.Restaurant.image
            }))

            res.render('users', {
              user: user.toJSON(),
              restComment: data,
              count: count,
              logUser: logUser
            })
          })

      })
      .catch(err => res.sendStatus(500))

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

  getTopUser: (req, res) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      // 整理 users 資料
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  }
}

module.exports = userController