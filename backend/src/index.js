import app from './app.js'

const port = app.get('port')
app.listen(port)
console.log('Backend running on port', port)
