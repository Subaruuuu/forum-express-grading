const express = require('express')
const router = express.Router()

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })
const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

//controller/api
const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController.js')
const commentController = require('../controllers/api/commentController')

//admin users
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id/toggleAdmin', adminController.toggleAdmin)

//user
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

//admin restaurants
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)

router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

//admin category
router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

//comment
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

//add or remove favorite
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

//following User
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

//like or unlike
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

//admin signin/signup
router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

module.exports = router