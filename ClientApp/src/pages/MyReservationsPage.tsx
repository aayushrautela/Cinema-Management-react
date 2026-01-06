import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Reservation } from '../types';
import { reservationService } from '../services/reservationService';

export default function MyReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            const data = await reservationService.getMyReservations();
            setReservations(data);
        } catch (err: any) {
            setError('Failed to load reservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (res: Reservation) => {
        if (!confirm(`Cancel reservation for seat ${res.rowNumber}-${res.seatNumber}?`)) return;

        try {
            await reservationService.release({
                screeningId: res.screeningId,
                rowNumber: res.rowNumber,
                seatNumber: res.seatNumber,
            });
            await loadReservations();
        } catch (err: any) {
            alert('Failed to cancel reservation');
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
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
            <h2 className="mb-4">My Reservations</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {reservations.length === 0 ? (
                <div className="alert alert-info">
                    You don't have any reservations yet.{' '}
                    <Link to="/">Browse screenings</Link> to make one!
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Film</th>
                                <th>Cinema</th>
                                <th>Date & Time</th>
                                <th>Seat</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((res) => (
                                <tr key={res.id}>
                                    <td>{res.filmTitle}</td>
                                    <td>{res.cinemaName}</td>
                                    <td>{formatDateTime(res.startDateTime)}</td>
                                    <td>
                                        <span className="badge bg-primary">
                                            Row {res.rowNumber}, Seat {res.seatNumber}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/room/${res.screeningId}`} className="btn btn-sm btn-outline-primary me-2">
                                            View Room
                                        </Link>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleCancel(res)}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
