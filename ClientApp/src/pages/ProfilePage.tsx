import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phoneNumber: '',
        lockVersion: null as string | null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                surname: user.surname,
                phoneNumber: user.phoneNumber || '',
                lockVersion: user.lockVersion,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        try {
            const updated = await userService.update(user.id, {
                name: formData.name,
                surname: formData.surname,
                phoneNumber: formData.phoneNumber || undefined,
                lockVersion: formData.lockVersion,
            });

            setFormData({
                ...formData,
                lockVersion: updated.lockVersion,
            });

            await refreshUser();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            if (error.response?.status === 409) {
                setMessage({
                    type: 'error',
                    text: 'This profile was modified by another user. Please refresh the page and try again.',
                });
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to update profile',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">Please log in to view your profile.</div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">👤 Edit Profile</h4>
                        </div>
                        <div className="card-body p-4">
                            {message && (
                                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label text-muted">Email</label>
                                <input type="email" className="form-control" value={user.email} disabled />
                                <div className="form-text">Email cannot be changed</div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="surname" className="form-label">
                                            Surname *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="surname"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
