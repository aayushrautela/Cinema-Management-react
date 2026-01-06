import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { ScreeningDetail } from '../types';
import { screeningService } from '../services/screeningService';
import { reservationService } from '../services/reservationService';
import SeatGrid from '../components/SeatGrid';

export default function RoomViewPage() {
    const { id } = useParams<{ id: string }>();
    const [screening, setScreening] = useState<ScreeningDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadScreening();
    }, [id]);

    const loadScreening = async () => {
        if (!id) return;
        try {
            const data = await screeningService.getById(parseInt(id));
            setScreening(data);
        } catch (err: any) {
            setError('Failed to load screening details');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = async (row: number, seat: number) => {
        if (!screening || actionLoading) return;

        const seatStatus = screening.seats.find((s) => s.row === row && s.seat === seat);
        if (!seatStatus) return;

        setActionLoading(true);
        setMessage(null);

        try {
            if (seatStatus.isOwnedByCurrentUser) {
                // Release the seat
                await reservationService.release({
                    screeningId: screening.id,
                    rowNumber: row,
                    seatNumber: seat,
                });
                setMessage({ type: 'success', text: `Seat ${row}-${seat} released successfully!` });
            } else if (!seatStatus.isReserved) {
                // Reserve the seat
                await reservationService.reserve({
                    screeningId: screening.id,
                    rowNumber: row,
                    seatNumber: seat,
                });
                setMessage({ type: 'success', text: `Seat ${row}-${seat} reserved successfully!` });
            }

            // Reload screening to get updated seat status
            await loadScreening();
        } catch (err: any) {
            if (err.response?.status === 409) {
                setMessage({
                    type: 'error',
                    text: 'This seat was just reserved by another user. Refreshing...',
                });
                await loadScreening();
            } else {
                setMessage({
                    type: 'error',
                    text: err.response?.data?.message || 'Failed to update reservation',
                });
            }
        } finally {
            setActionLoading(false);
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
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

    if (error || !screening) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error || 'Screening not found'}</div>
                <Link to="/" className="btn btn-primary">
                    Back to Screenings
                </Link>
            </div>
        );
    }

    const reservedCount = screening.seats.filter((s) => s.isReserved).length;
    const myReservations = screening.seats.filter((s) => s.isOwnedByCurrentUser);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h2>{screening.filmTitle}</h2>
                    <p className="text-muted mb-1">
                        {screening.cinemaName} | {formatDateTime(screening.startDateTime)}
                    </p>
                    <p className="text-muted">
                        {reservedCount} / {screening.rows * screening.seatsPerRow} seats booked
                    </p>
                </div>
                <Link to="/" className="btn btn-outline-secondary">
                    ← Back
                </Link>
            </div>

            {message && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible`}>
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
            )}

            {myReservations.length > 0 && (
                <div className="alert alert-success">
                    <strong>Your reservations:</strong>{' '}
                    {myReservations.map((s) => `Row ${s.row}, Seat ${s.seat}`).join(' | ')}
                </div>
            )}

            <div className="card shadow">
                <div className="card-body">
                    <SeatGrid
                        rows={screening.rows}
                        seatsPerRow={screening.seatsPerRow}
                        seats={screening.seats}
                        onSeatClick={handleSeatClick}
                        disabled={actionLoading}
                    />
                </div>
            </div>

            {actionLoading && (
                <div className="text-center mt-3">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Updating...
                </div>
            )}
        </div>
    );
}
