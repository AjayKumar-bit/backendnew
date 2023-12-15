const dotenv = require('dotenv');
const cors =require('cors')
dotenv.config();


const express = require("express")



const server = express()
const morgan = require("morgan")

const router = require('./ROUTES/routes.js')

server.use(cors())

server.use(express.json())
server.use(morgan('dev'))
server.use(express.urlencoded({extended:true})) 
server.use(express.static('public')) 
server.use('/',router)

// server.use('/auth',require('./ROUTES/Auth.js'))





server.listen(process.env.port,()=>{
    console.log("server working fine")
}) 