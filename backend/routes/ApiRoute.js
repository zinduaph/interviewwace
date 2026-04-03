import express from 'express'
import { getApiUsage } from '../controller/ApiUsageController.js'

const ApiRoute = express.Router()


ApiRoute.get('/api-usage',getApiUsage)

export default ApiRoute