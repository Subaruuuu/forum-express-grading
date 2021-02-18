const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db

const fs = require('fs')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')

const userService = require('../services/userService')

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
    userService.getUser(req, res, (data) => {
      return res.render('users', data)
    })
  },

  //編輯使用者資料
  editUser: (req, res) => {
    userService.editUser(req, res, (data) => {
      return res.render('usersEdit', data)
    })

  },

  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect(`/users/${data.user.id}`)
    })
  },

  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },

  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },

  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },

  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },

  //美食達人
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUser', data)
    })
  },

  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },

  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  }

}

module.exports = userController