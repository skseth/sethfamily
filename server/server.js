const generate = require('./generate.js')
// create server
const express = require('express')
const app = express()
const port = 3000


let router = express.Router();
router.get('/sethfamily-:label.json', generate.getJsonFromSheet())
app.use('/json', router)

app.use(express.static('public'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

