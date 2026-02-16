import express from 'express'
import * as indexController from "../controllers/indexController.js";

const indexRouter = express.Router()

indexRouter.get("/", indexController.test);

export default indexRouter