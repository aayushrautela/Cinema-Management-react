import { useState, useEffect } from 'react';
import type { Screening, Cinema, CreateScreeningRequest } from '../types';
import { screeningService, cinemaService } from '../services/screeningService';

export default function AdminScreeningsPage() {
    const [screenings, setScreenings] = useState<Screening[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<CreateScreeningRequest>({
        cinemaId: 0,
        filmTitle: '',
        startDateTime: '',
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [screeningsData, cinemasData] = await Promise.all([
                screeningService.getAll(),
                cinemaService.getAll(),
            ]);
            setScreenings(screeningsData);
            setCinemas(cinemasData);
            if (cinemasData.length > 0 && !formData.cinemaId) {
                setFormData((prev) => ({ ...prev, cinemaId: cinemasData[0].id }));
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            await screeningService.create(formData);
            setMessage({ type: 'success', text: 'Screening created successfully!' });
            setShowForm(false);
            setFormData({ cinemaId: cinemas[0]?.id || 0, filmTitle: '', startDateTime: '' });
            await loadData();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create screening' });
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`Delete screening "${title}"? All reservations will be cancelled.`)) return;

        try {
            await screeningService.delete(id);
            setMessage({ type: 'success', text: 'Screening deleted successfully!' });
            await loadData();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete screening' });
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🎬 Manage Screenings</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Screening'}
                </button>
            </div>

            {message && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible`}>
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
            )}

            {showForm && (
                <div className="card mb-4">
                    <div className="card-header bg-primary text-white">Create New Screening</div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="cinemaId" className="form-label">Cinema *</label>
                                    <select
                                        className="form-select"
                                        id="cinemaId"
                                        value={formData.cinemaId}
                                        onChange={(e) => setFormData({ ...formData, cinemaId: parseInt(e.target.value) })}
                                        required
                                    >
                                        {cinemas.map((cinema) => (
                                            <option key={cinema.id} value={cinema.id}>
                                                {cinema.name} ({cinema.rows}×{cinema.seatsPerRow})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="filmTitle" className="form-label">Film Title *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="filmTitle"
                                        value={formData.filmTitle}
                                        onChange={(e) => setFormData({ ...formData, filmTitle: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="startDateTime" className="form-label">Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        id="startDateTime"
                                        value={formData.startDateTime}
                                        onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-success">Create Screening</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Film</th>
                            <th>Cinema</th>
                            <th>Date & Time</th>
                            <th>Reservations</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {screenings.map((s) => (
                            <tr key={s.id}>
                                <td>{s.filmTitle}</td>
                                <td>{s.cinemaName}</td>
                                <td>{formatDateTime(s.startDateTime)}</td>
                                <td>
                                    <span className={`badge ${s.reservationCount > 0 ? 'bg-warning' : 'bg-secondary'}`}>
                                        {s.reservationCount} / {s.rows * s.seatsPerRow}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(s.id, s.filmTitle)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {screenings.length === 0 && (
                <div className="alert alert-info">No screenings yet. Create one above!</div>
            )}
        </div>
    );
}
