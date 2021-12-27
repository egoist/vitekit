import http from "http"
import { createApp } from "h3"
import { middleware } from "../build/server.js"

const app = createApp()
app.use(middleware)

http.createServer(app).listen(3001)
console.log("> http://localhost:3001")
