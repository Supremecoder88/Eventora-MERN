import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaTimesCircle, FaHeart, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, wishlistRes] = await Promise.all([
                api.get('/bookings/my'),
                api.get('/user/wishlist')
            ]);
            setBookings(bookingsRes.data);
            setWishlist(wishlistRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchDashboardData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    const toggleWishlist = async (eventId) => {
        try {
            await api.put('/user/wishlist', { eventId });
            // Refresh wishlist data
            const { data } = await api.get('/user/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-gray-200 text-gray-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0">
                    {user?.name.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
                    <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> User Dashboard
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8 mb-8 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                        activeTab === 'bookings' 
                        ? 'text-gray-900 border-b-2 border-gray-900' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <FaTicketAlt /> My Bookings ({bookings.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                        activeTab === 'wishlist' 
                        ? 'text-gray-900 border-b-2 border-gray-900' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <FaHeart /> My Wishlist ({wishlist.length})
                    </div>
                </button>
            </div>

            {activeTab === 'bookings' ? (
                <>
                    {bookings.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTicketAlt className="text-gray-300 text-3xl" />
                            </div>
                            <p className="text-xl text-gray-500 mb-6 mt-4 font-medium">You haven't booked any events yet.</p>
                            <Link to="/" className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition shadow-md">
                                Browse Events
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                                    <div className="p-6 border-b border-gray-50 flex-grow">
                                        {booking.eventId ? (
                                            <>
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{booking.eventId.title}</h3>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                        {booking.status !== 'cancelled' && (
                                                            <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {booking.paymentStatus.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500 mb-4 space-y-1">
                                                    <p><strong className="text-gray-700">Date:</strong> {new Date(booking.eventId.date).toLocaleDateString()}</p>
                                                    <p><strong className="text-gray-700">Amount:</strong> {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</p>
                                                    <p><strong className="text-gray-700">Requested:</strong> {new Date(booking.bookedAt).toLocaleDateString()}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-red-500 italic">Event details unavailable (might have been deleted)</p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 flex justify-between items-center shrink-0">
                                        {booking.eventId && booking.status !== 'cancelled' ? (
                                            <>
                                                <Link to={`/events/${booking.eventId._id}`} className="text-gray-900 font-semibold text-sm hover:underline">View Event</Link>
                                                <button
                                                    onClick={() => cancelBooking(booking._id)}
                                                    className="text-red-500 font-semibold text-sm hover:text-red-700 transition flex items-center gap-1"
                                                >
                                                    <FaTimesCircle /> Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full text-center text-sm text-gray-500 italic">Booking Cancelled/Unavailable</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {wishlist.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaHeart className="text-gray-300 text-3xl" />
                            </div>
                            <p className="text-xl text-gray-500 mb-6 mt-4 font-medium">Your wishlist is empty.</p>
                            <Link to="/" className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition shadow-md">
                                Discover Events
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlist.map((event) => (
                                <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                                    <div className="h-40 bg-gray-200 overflow-hidden relative">
                                        {event.image ? (
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase">
                                                {event.category}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => toggleWishlist(event._id)}
                                            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm"
                                        >
                                            <FaHeart className="text-red-500 text-sm" />
                                        </button>
                                    </div>
                                    <div className="p-6 flex-grow">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{event.category}</div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-4">{event.title}</h3>
                                        <div className="text-sm text-gray-500 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-gray-300" />
                                                <span>{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-gray-300" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                                        <Link to={`/events/${event._id}`} className="block w-full text-center bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-sm font-bold transition">
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserDashboard;
