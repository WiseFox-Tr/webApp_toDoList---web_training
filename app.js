require("dotenv").config()
const express = require("express")
const ejs = require("ejs")
const session = require("express-session")
const passport = require("passport")
const flash = require("express-flash")
const methodOverride = require("method-override")
const initializePassport = require("./services/passportConfig.js")
const tasksController = require("./controllers/tasksController.js") 
const userController = require( "./controllers/userController.js")
const date = require(__dirname + "/services/date.js")

const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, 
    cookie: {maxAge: 1_200_000}
}))

//initialize passport & use session with passport 
app.use(passport.initialize())
app.use(passport.session())
initializePassport(passport)

app.use(methodOverride('_method'))

app.get("/", userController.checkIfUserIsNotAuthenticated, function(req, res) {
    console.log("GET request on url '/'")
    res.render("home", {date: date.getCurrentDate()})
})

app.route("/register")
    .get(userController.checkIfUserIsNotAuthenticated, function(req, res) {
        console.log("GET request on url '/register'")
        res.render("register", {errorMessage: null})
    })
    .post(function(req, res) {
        console.log("POST request on url '/register'")
        userController.registerUser(req, res)
    })

app.route("/login")
    .get(userController.checkIfUserIsNotAuthenticated, function(req, res) {
        console.log("GET request on url '/login'")
        res.render("login")
    })
    .post(passport.authenticate('local', {
        successRedirect: "/tasks",
        failureRedirect: "/login",
        failureFlash: true
    }))

app.route("/logout")
    .delete(userController.checkIfUserIsAuthentificated, (req, res) => {
        console.log("DELETE request on url '/logout'")
        userController.logOut(req, res)
    })    
    
app.route("/tasks")
    .get(userController.checkIfUserIsAuthentificated, function(req, res) {
        console.log("GET request on url '/tasks'")
        tasksController.displayTasksForCurrentUser(req, res) 
    })
    .post(function(req, res) {
        console.log("POST request on url '/tasks'")
        tasksController.addNewTask(req, res)
    })

app.post("/tasks/delete", function(req, res) {
    console.log("POST request on url '/tasks/delete'")
    tasksController.deleteCheckedTask(req, res)
})

app.get("/about", function(req, res) {
    res.render("about")
})

app.listen(process.env.PORT, function() {
    console.log(`Server started on port ${process.env.PORT}`)
})
