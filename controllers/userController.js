const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant

const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


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
    const UserId = req.params.id

    return User.findByPk(UserId)
      .then(user => {
        Comment.findAndCountAll({ include: Restaurant, where: { UserId } })
          .then(comment => {
            const count = comment.count

            const data = comment.rows.map(r => ({
              ...r.dataValues,
              restaurantImage: r.Restaurant.image
            }))

            res.render('users', {
              user: user.toJSON(),
              restComment: data,
              count: count
            })
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
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : restaurant.image
            })
              .then(user => {
                req.flash('success_messages', 'user profile was successfully to update')
                res.redirect(`/users/${user.id}`)
              })
              .catch(err => res.sendStatus(500))
          })
      })
    }
    else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
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

  }
}

module.exports = userController