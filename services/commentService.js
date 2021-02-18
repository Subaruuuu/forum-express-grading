const db = require('../models')
const Comment = db.Comment

const commentService = {
  postComment: (req, res, callback) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then((comment) => {
        callback({ status: 'success', message: '' })
      })
      .catch(err => console.log(err))
  },

  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then((comment) => {
            callback({ status: 'success', message: '', comment: comment })
          })
          .catch(err => console.log(err))
      })
  }
}

module.exports = commentService