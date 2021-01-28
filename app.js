const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const db = require('./models')
const app = express()
const port = 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: "forumSecret",
  saveUninitialized: false,
  resave: false
}))

app.use(flash())

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

app.listen(port, () => {
  db.sequelize.sync()
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)

module.exports = app
