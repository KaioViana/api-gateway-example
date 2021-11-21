import express from 'express'
import logger from 'morgan'
import helmet from 'helmet'
import httpProxy from 'express-http-proxy'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'


type YmlConfigType = {
  services: [{
    name: string
    url: string
  }]
}

const app = express()
const router = express.Router()

const pathFile = resolve(process.cwd(), 'config.yml')
const readConfig = readFileSync(pathFile, { encoding: 'utf-8' })
const { services } = load(readConfig, { json: true }) as YmlConfigType

app.use(logger('dev'))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  return res.json({message: 'aplication running'})
})

services.forEach(({ name, url }) => {
  app.post(`/${name}`, httpProxy(url, { timeout: 3000 }))
})

app.listen(3000, () => console.log('server listen on port: 3000'))
