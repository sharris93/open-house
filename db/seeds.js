// Imports
const mongoose = require('mongoose')
require('dotenv').config()

// Model
const User = require('../models/user.js')
const Listing = require('../models/listing.js')

// Data
const userData = require('./data/users.js')
const listingData = require('./data/listings.js')


const seedDatabase = async () => {
  try {
    // 1. Connecting to the database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🔒 Database connection established.')

    // 2. Remove all data from the database
    const deletedUsers = await User.deleteMany()
    console.log(`👤 ${deletedUsers.deletedCount} users deleted from the database`)
    
    const deletedListings = await Listing.deleteMany()
    console.log(`🏡 ${deletedListings.deletedCount} listings deleted from the database`)

    // 3. Create new users in the database
    const users = await User.create(userData)
    console.log(`👯 ${users.length} users added into the database`)

    const listingsWithOwners = listingData.map(listing => {
      listing.owner = users[Math.floor(Math.random() * users.length)]._id

      // favoritedByUsers

      // Create an empty array for favourites
      listing.favoritedByUsers = []

      // Generate a random number of favourites to create
      const favouritedNum = Math.floor(Math.random() * users.length)

      // Iterate number of times specifed above, adding a random user objectId into the favourites array each time
      for (let i = 0; i < favouritedNum; i++){
        listing.favoritedByUsers.push(users[Math.floor(Math.random() * users.length)]._id)
      }

      // There will potentially be duplicates, so we remove them by creating a set from the array, converting it back into an array
      listing.favoritedByUsers = [...new Set(listing.favoritedByUsers)]

      return listing
    })

    // 4. Create new listings in the database
    const listings = await Listing.create(listingsWithOwners)
    console.log(`🏘 ${listings.length} listings added to the database`)

    // 5. Closing our connection to the database
    await mongoose.connection.close()
    console.log(`👋 Database connection closed. Goodbye!`)
  } catch (error) {
    console.log(error)

    // 6. Closing our connection to the database
    await mongoose.connection.close()
    console.log(`👋 Database connection closed. Goodbye!`)
  }
}

seedDatabase()