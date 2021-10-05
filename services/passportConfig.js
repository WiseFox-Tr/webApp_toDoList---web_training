const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const commonDB = require("../dbs/commonDB.js")
const userDB = require("../dbs/userDB.js")


//take instance of passport & function getUserById method
function initialize(passport, getUserById) {

    //make sure user email & password correct by calling authenticateUser method (inner function)
    const authenticateUser = async (email, password, done) => {
        try {            
            await commonDB.connectToDB()
            const user = await userDB.getUserByEmail(email)
            //if user null, return null error & false to say it did not succeed to find user + message
            if(!user) {
                return done(null, false, {message: "No user with that email"})
            }
            //if passwords match -> return done with user 
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: "Password provided doesn't match with user password"})
            }
        } catch(e) {
            return done(e, false, {message: "oups a problem occurs"})
        } finally {
            commonDB.disconnectToDB()
        }
    }
    
    //define LocalStrategy
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    //serialize & deserialize user
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => done(null, getUserById(id)))
}

module.exports = initialize
