const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const usersRoute = require('./routes/users')
const postsRoute = require('./routes/posts')
const loginRoute = require('./routes/login')
const githubRoute = require('./routes/gitHubAuth')

const PORT = 5050;
const app = express()

dotenv.config()
app.use(express.json());
app.use(cors());
app.use('/', usersRoute);
app.use('/', postsRoute);
app.use('/', loginRoute);
app.use('/', githubRoute);

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Errore di connessione al database'))
db.once('open', () => {
    console.log('Database connesso correttamente')
})
app.listen(PORT, () => console.log(`server avviato su porta ${PORT}`))