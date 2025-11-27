// Express is a framework for building APIs and web apps
// See also: https://expressjs.com/
import express from 'express'
// Import Prisma Client for database connection
import { PrismaClient } from '@prisma/client'

// Initialize Prisma Client
const prisma = new PrismaClient()

// Initialize Express app
const app = express()

// Test database connection
prisma.$connect()
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Serve static files from /public folder
app.use(express.static('public'))
// Define index2.html as the root explicitly
app.get('/', (req, res) => { res.redirect('/index2.html') })

// Enable express to parse JSON data
app.use(express.json())

// Our API is defined in a separate module to keep things tidy.
// Let's import our API endpoints and activate them.
import apiRoutes from './routes/api.js'
app.use('/api', apiRoutes)

const port = 3001
app.listen(port, () => {
    console.log(`Express is live at http://localhost:${port}`)
})
