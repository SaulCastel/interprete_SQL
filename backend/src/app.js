import express from 'express'
import parserRoutes from './routes/parser.routes.js'

const app = express()

app.set('port', 3000)
app.use(express.json())
app.use(parserRoutes)

export default app
