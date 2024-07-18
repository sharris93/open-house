// controllers/listings.js
const express = require('express')
const router = express.Router()

// Model
const Listing = require('../models/listing')

// Routes / Controllers

// * Index Route
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().populate('owner')
    res.render('listings/index.ejs', {
      listings
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

// * New Route (Form)
router.get('/new', (req, res) => {
  try {
    res.render('listings/new.ejs')
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

// * Create Route
router.post('/', async (req, res) => {
  try {
    req.body.owner = req.session.user._id
    const createdListing = await Listing.create(req.body)
    res.redirect('/listings')
  } catch (error) {
    console.log(error)
    res.render('listings/new.ejs', { errorMessage: error.message })
  }
})

// * Show Route
router.get('/:listingId', async (req, res) => {
  try {
    const listingId = req.params.listingId
    const listing = await Listing.findById(listingId).populate('owner')

    if (!listing) {
      const error = new Error('Listing not found.')
      error.status = 404
      throw error
    }

    const userHasFavorited = listing.favoritedByUsers.some(objectId => {
      return objectId.equals(req.session.user._id)
    })

    res.render('listings/show.ejs', {
      listing,
      userHasFavorited
    })
  } catch (error) {
    console.log(error)
    if (error.status === 404) {
      return res.render('404.ejs')
    }
    res.redirect('/')
  }
})

// * Delete Route
router.delete('/:listingId', async (req, res) => {
  try {
    const listingId = req.params.listingId
    
    // Find the listing document
    const listingToDelete = await Listing.findById(listingId)

    // Check that the logged in user is the owner of that document

    // If they are, we will delete it
    if (listingToDelete.owner.equals(req.session.user._id)) {
      // Delete listing
      await listingToDelete.deleteOne()
      res.redirect('/listings')
    } else {
      // Do not delete listing
      res.send('You do not have permission to delete this listing.')
    }

    // If they are not, we will not delete it

  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

// * Edit Route
router.get('/:listingId/edit', async (req, res) => {
  try {
    // Query the database for the single listing
    const listing = await Listing.findById(req.params.listingId)
    if (!listing) throw new Error('Listing not found')

    if (listing.owner.equals(req.session.user._id)) {
      // Render the edit form
      res.render('listings/edit.ejs', { listing })
    } else {
      res.redirect(`/listings/${listing._id}`)
    }
    
  } catch (error) {
    console.log(error)
    res.redirect('/listings')
  }
})

// * Update Route
router.put('/:listingId', async (req, res) => {
  try {
    // Locate listing document
    const listingToUpdate = await Listing.findById(req.params.listingId)
    if (!listingToUpdate) return res.redirect('/not-found')

    // Check ownership
    if (listingToUpdate.owner.equals(req.session.user._id)) {
      // Update the listing with req.body
      await listingToUpdate.updateOne(req.body)
      res.redirect(`/listings/${listingToUpdate._id}`)
    } else {
      // return an error message
      res.send('You do not have permission to update this listing.')
    }
  } catch (error) {
    console.log(error)
    const listing = await Listing.findById(req.params.listingId)
    res.status(400).render('listings/edit.ejs', { listing, errorMessage: error.message })
  }
})


// * Favorite Route
router.post('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    const listingId = req.params.listingId
    const updatedListing = await Listing.findByIdAndUpdate(listingId, {
      $push: { favoritedByUsers: req.session.user._id }
    })
    res.redirect(`/listings/${listingId}`)
  } catch (error) {
    console.log(error)
    res.redirect('/listings')
  }
})

// * Unfavourite Route
router.delete('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    const listingId = req.params.listingId
    await Listing.findByIdAndUpdate(listingId, {
      $pull: { favoritedByUsers: req.session.user._id }
    })
    res.redirect(`/listings/${listingId}`)
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})


module.exports = router
