import { Router } from "express"
import * as controller from '../controllers/parser.controller.js'

const router = Router()

router.get('/interpret', controller.interpret)

export default router