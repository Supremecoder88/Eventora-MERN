const User = require('../models/User');

// @desc    Toggle item in wishlist
// @route   PUT /api/user/wishlist
// @access  Private
exports.toggleWishlist = async (req, res) => {
    try {
        const { eventId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isWishlisted = user.wishlist.includes(eventId);

        if (isWishlisted) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== eventId);
        } else {
            user.wishlist.push(eventId);
        }

        await user.save();
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get current user profile (includes wishlist IDs)
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
