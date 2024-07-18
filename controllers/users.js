// Imports
const express = require('express')
const router = express.Router()

// Model
const Listing = require('../models/listing.js')

// Routes
router.get('/profile', async (req, res) => {
  try {
    // Find owned listings
    const listingsOwned = await Listing.find({
      owner: req.session.user._id
    }).exec()

    // Find favourited listings
    const listingsFavorited = await Listing.find({
      favoritedByUsers: req.session.user._id
    }).populate('owner').exec()

    // Render template
    res.render('users/show.ejs', {
      listingsOwned,
      listingsFavorited
    })
  } catch (error) {
    console.log(error)
  }
})

// Export router
module.exports = router
