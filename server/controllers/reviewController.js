const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { eventId, rating, comment } = req.body;

        // 1. Check if user has already reviewed
        const alreadyReviewed = await Review.findOne({ user: req.user.id, event: eventId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this event' });
        }

        // 2. Check if user has a confirmed booking for this event
        const booking = await Booking.findOne({ 
            userId: req.user.id, 
            eventId: eventId, 
            status: 'confirmed' 
        });

        if (!booking) {
            return res.status(403).json({ 
                message: 'Only users with a confirmed booking can review this event' 
            });
        }

        // 3. Create review
        const review = await Review.create({
            user: req.user.id,
            event: eventId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get reviews for an event
// @route   GET /api/reviews/:eventId
// @access  Public
exports.getEventReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ event: req.params.eventId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
