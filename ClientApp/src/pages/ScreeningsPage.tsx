import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Screening } from '../types';
import { screeningService } from '../services/screeningService';
import { useAuth } from '../contexts/AuthContext';

export default function ScreeningsPage() {
    const [screenings, setScreenings] = useState<Screening[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadScreenings();
    }, []);

    const loadScreenings = async () => {
        try {
            const data = await screeningService.getAll();
            setScreenings(data);
        } catch (err: any) {
            setError('Failed to load screenings');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">🎬 Upcoming Screenings</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {screenings.length === 0 ? (
                <div className="alert alert-info">No screenings available at the moment.</div>
            ) : (
                <div className="row">
                    {screenings.map((screening) => (
                        <div key={screening.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-header bg-dark text-white">
                                    <h5 className="card-title mb-0">{screening.filmTitle}</h5>
                                </div>
                                <div className="card-body">
                                    <p className="card-text">
                                        <strong>📍 Cinema:</strong> {screening.cinemaName}
                                    </p>
                                    <p className="card-text">
                                        <strong>🕐 Time:</strong> {formatDateTime(screening.startDateTime)}
                                    </p>
                                    <p className="card-text">
                                        <strong>💺 Room:</strong> {screening.rows} rows × {screening.seatsPerRow} seats
                                    </p>
                                    <p className="card-text">
                                        <strong>🎟️ Booked:</strong> {screening.reservationCount} /{' '}
                                        {screening.rows * screening.seatsPerRow} seats
                                    </p>
                                </div>
                                <div className="card-footer">
                                    {user ? (
                                        <Link to={`/room/${screening.id}`} className="btn btn-primary w-100">
                                            View Seats & Book
                                        </Link>
                                    ) : (
                                        <Link to="/login" className="btn btn-outline-primary w-100">
                                            Login to Book
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
