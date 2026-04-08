const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getUserProfile);
router.get('/wishlist', protect, getWishlist);
router.put('/wishlist', protect, toggleWishlist);

module.exports = router;
