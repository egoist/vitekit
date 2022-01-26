// @ts-check
import express from "express"
import { createRequestHandler } from "../out/server/server.js"

const app = express()

// Serve static files
app.use(express.static("./out/client"))

// Serve routes
app.use(createRequestHandler())

app.listen(3001)
console.log("> http://localhost:3001")
