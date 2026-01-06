import { useState, useEffect } from 'react';
import type { User, UserUpdateRequest } from '../types';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserUpdateRequest>({
        name: '',
        surname: '',
        phoneNumber: '',
        lockVersion: null,
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            surname: user.surname,
            phoneNumber: user.phoneNumber || '',
            lockVersion: user.lockVersion,
        });
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setMessage(null);

        try {
            await userService.update(editingUser.id, formData);
            setMessage({ type: 'success', text: 'User updated successfully!' });
            setEditingUser(null);
            await loadUsers();
        } catch (err: any) {
            if (err.response?.status === 409) {
                setMessage({
                    type: 'error',
                    text: 'User was modified by another admin. Please refresh and try again.',
                });
            } else {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update user' });
            }
        }
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Delete user "${user.email}"? All their reservations will be cancelled.`)) return;

        try {
            await userService.delete(user.id);
            setMessage({ type: 'success', text: 'User deleted successfully!' });
            await loadUsers();
        } catch (err: any) {
            if (err.response?.status === 404) {
                setMessage({ type: 'error', text: 'User was already deleted by another administrator.' });
                await loadUsers();
            } else {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete user' });
            }
        }
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
            <h2 className="mb-4">Manage Users</h2>

            {message && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible`}>
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>
                                    {editingUser?.id === user.id ? (
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    ) : (
                                        user.name
                                    )}
                                </td>
                                <td>
                                    {editingUser?.id === user.id ? (
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={formData.surname}
                                            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                        />
                                    ) : (
                                        user.surname
                                    )}
                                </td>
                                <td>
                                    {editingUser?.id === user.id ? (
                                        <input
                                            type="tel"
                                            className="form-control form-control-sm"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    ) : (
                                        user.phoneNumber || '-'
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${user.isAdmin ? 'bg-danger' : 'bg-secondary'}`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td>
                                    {editingUser?.id === user.id ? (
                                        <>
                                            <button className="btn btn-sm btn-success me-1" onClick={handleSave}>
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => setEditingUser(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {!user.isAdmin && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        Edit
                                                    </button>
                                                    {user.id !== currentUser?.id && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(user)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {user.isAdmin && (
                                                <span className="text-muted small">Protected</span>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
