import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isReviewing, setIsReviewing] = useState(false);

    useEffect(() => {
        const fetchEventAndReviews = async () => {
            try {
                const [eventRes, reviewsRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get(`/reviews/${id}`)
                ]);
                setEvent(eventRes.data);
                setReviews(reviewsRes.data);
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEventAndReviews();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('OTP sent to your email. Please verify to confirm booking.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp });
                setSuccessMsg('Booking requested! Awaiting admin confirmation.');
                setShowOTP(false);
                // Update local seats count dynamically after booking
                setEvent({ ...event, availableSeats: event.availableSeats - 1 });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsReviewing(true);
        setError('');
        try {
            const { data } = await api.post('/reviews', { eventId: id, rating, comment });
            setReviews([{ ...data, user: { name: user.name } }, ...reviews]);
            setSuccessMsg('Review posted successfully!');
            setComment('');
            setRating(5);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post review');
        } finally {
            setIsReviewing(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading...</div>;
    if (error && !event) return <div className="text-center py-20 text-xl text-red-500">{error || 'Event not found'}</div>;

    const isSoldOut = event.availableSeats <= 0;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
            {event.image ? (
                <img src={event.image} alt={event.title} className="w-full h-80 object-cover" />
            ) : (
                <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white/50 text-6xl font-black uppercase tracking-widest">
                    {event.category}
                </div>
            )}

            <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                    <div>
                        <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                            {event.category}
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{event.title}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">{event.description}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[300px] w-full md:w-auto shrink-0 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaMoneyBillWave />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase">Ticket Price</p>
                                    <p className="font-bold text-gray-800 text-lg">{event.ticketPrice === 0 ? <span className="text-green-500">Free</span> : `₹${event.ticketPrice}`}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaChair />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase">Availability</p>
                                    <p className="font-bold text-gray-800">
                                        <span className={event.availableSeats < 10 ? 'text-orange-500' : ''}>{event.availableSeats}</span> / {event.totalSeats}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase">Date</p>
                                    <p className="font-bold text-gray-800">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase">Location</p>
                                    <p className="font-bold text-gray-800">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        {showOTP && (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP to Confirm</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="6-digit code"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-lg"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg ${isSoldOut || (successMsg && !showOTP)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-900 hover:bg-black text-white hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            {bookingLoading ? 'Processing...' : (showOTP ? 'Verify OTP & Confirm' : (successMsg && !showOTP ? 'Request Sent' : (isSoldOut ? 'Sold Out' : 'Confirm Registration')))}
                        </button>
                        {error && <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
                        {successMsg && <p className="text-green-600 mt-4 text-center font-medium bg-green-50 p-2 rounded">{successMsg}</p>}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 pt-16 border-t border-gray-100">
                    <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4">
                        Reviews <span className="text-gray-300 text-xl font-medium">({reviews.length})</span>
                    </h2>

                    {user && (
                        <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-8 rounded-2xl mb-12 border border-gray-100 shadow-sm transition-all focus-within:shadow-md">
                            <h4 className="text-lg font-bold text-gray-800 mb-6">Rate your experience</h4>
                            
                            <div className="flex gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                                    >
                                        {star <= rating ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-300" />}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all mb-4 text-gray-700 min-h-[120px]"
                                placeholder="Write your thoughts about this event..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            />

                            <button
                                type="submit"
                                disabled={isReviewing}
                                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isReviewing ? 'Posting...' : 'Post Review'}
                            </button>
                        </form>
                    )}

                    <div className="space-y-8">
                        {reviews.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-10 bg-gray-50 rounded-2xl">No reviews yet. Be the first to share your experience!</p>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev._id} className="flex gap-6 items-start group">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0 text-2xl group-hover:bg-gray-900 group-hover:text-white transition-colors duration-500">
                                        <FaUserCircle />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="font-bold text-gray-900">{rev.user?.name || 'User'}</h5>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {new Date(rev.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={`text-sm ${i < rev.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">{rev.comment}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
