import React, { useEffect, useRef, useState } from 'react';
import './AddUsers.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserManagementSystem = () => {
    const modalRef = useRef(null);

    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [token, setToken] = useState('');
    const [role, setRole] = useState('');
    const [selectedRole, setSelectedRole] = useState('partner');
    const [currentPage, setCurrentPage] = useState(1);
    const [resetPasswordUserId, setResetPasswordUserId] = useState(0);
    const usersPerPage = 5;
    const [resetForm, setResetForm] = useState({
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
    });

    const closeRef = useRef();


    const togglePasswordVisibility = (field) => {
        setResetForm((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };



    const apiUrl = import.meta.env.VITE_API_LOGIN_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);

        const token = localStorage.getItem('token');
        setToken(token);

        fetchUsers(token);
    }, []);

    const fetchUsers = async (token) => {
        try {
            const response = await axios.get(`${apiUrl}user/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            const allFetchedUsers = response?.data?.data || [];
            setAllUsers(allFetchedUsers);

            const defaultFiltered = allFetchedUsers.filter(user =>
                user.role?.toLowerCase() === 'partner'
            );
            setUsers(defaultFiltered);
            setCurrentPage(1); // reset to page 1
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleFilter = (role) => {
        setSelectedRole(role);
        const filteredUser = allUsers.filter(
            (user) => user.role?.toLowerCase() === role.toLowerCase()
        );
        setUsers(filteredUser);
        setCurrentPage(1);
    };

    const handleGetUserDetails = async (id) => {
        try {
            const response = await axios.get(`${apiUrl}user/${id}`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setSelectedUsers(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (id) => {
        const token = localStorage.getItem('token');

        const payload = {
            username: selectedUsers.username,
            email: selectedUsers.email,
            phone: selectedUsers.phone
        };

        if (selectedUsers.role === 'partner') {
            payload.dividend = selectedUsers.dividend;
        }

        try {
            await axios.patch(`${apiUrl}user/${id}/`, payload, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'User updated successfully',
                timer: 1500,
                showConfirmButton: false
            });

            fetchUsers(token);

            if (modalRef.current) {
                const modal =
                    bootstrap.Modal.getInstance(modalRef.current) ||
                    new bootstrap.Modal(modalRef.current);
                modal.hide();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Something went wrong. Please try again.'
            });
        }
    };

    const handleDeleteUser = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This user will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await axios.delete(`${apiUrl}user/${id}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            if (response.status === 204 || response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'User deleted successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });

                fetchUsers(token);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: 'Something went wrong. Please try again.'
            });
        }
    };

    const handleRegisterOpen = () => {
        navigate('/signup');
    };

    // pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);


    // reset password
    const handleResetPasswordId = async (id) => {
        setResetPasswordUserId(id)


    }

    const handleResetPAssword = async () => {
        const { password, confirmPassword } = resetForm;

        if (!password || !confirmPassword) {
            Swal.fire('Error', 'Please fill both fields.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('Error', 'Passwords do not match.', 'error');
            return;
        }

        try {
            const response = await axios.post(
                `${apiUrl}reset-password/${resetPasswordUserId}/`,
                {
                    password: password,
                    confirm_password: confirmPassword
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                Swal.fire('Success', 'Password reset successfully!', 'success');
                setResetForm({
                    password: '',
                    confirmPassword: '',
                    showPassword: false,
                    showConfirmPassword: false,

                })
                closeRef.current?.click();

            } else {
                Swal.fire('Error', 'Unexpected response from server.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Something went wrong while resetting the password.', 'error');
            console.error(error);
        }
    };


    return (
        <div className="container">
            <header className="header-adduser">
                <div className="header-content-1">
                    <div className="un-head">
                        <div className="header-logo">UM</div>
                        <p className="un-title">User Management System</p>
                    </div>
                    {role === 'vittamoney' && (
                        <button className="add-user-btn" onClick={handleRegisterOpen}>
                            <i className="fas fa-plus"></i> Add User
                        </button>
                    )}
                </div>
            </header>

            <div className="filter-users">
                {(role === 'vittamoney' || role === 'vittamoney_user') && (
                    <>
                        <button
                            className={`filter-btn-users ${selectedRole === 'partner' ? 'active' : ''}`}
                            onClick={() => handleFilter('partner')}
                        >
                            Partner
                        </button>
                        {role === 'vittamoney' && (
                            <>
                                <button
                                    className={`filter-btn-users ${selectedRole === 'vittamoney_user' ? 'active' : ''}`}
                                    onClick={() => handleFilter('vittamoney_user')}
                                >
                                    Vittamoney User
                                </button>
                                <button
                                    className={`filter-btn-users ${selectedRole === 'accountant' ? 'active' : ''}`}
                                    onClick={() => handleFilter('accountant')}
                                >
                                    Accountant
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

            <div className="user-list-card">
                <div className="card-header">
                    <h2 className="card-title">User List</h2>
                </div>

                <div className="desktop-table">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>SL NO</th>
                                <th>NAME</th>
                                <th>
                                    {selectedRole === 'partner'
                                        ? 'PARTNER ID'
                                        : selectedRole === 'vittamoney_user'
                                            ? 'EMPLOYEE ID'
                                            : selectedRole === 'accountant'
                                                ? 'ACCOUNTANT ID'
                                                : ''}
                                </th>
                                <th>ACTIONS</th>
                                <th>RESET PASSWORD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user, index) => (
                                <tr key={index}>
                                    <td>{indexOfFirstUser + index + 1}</td>
                                    <td>
                                        <div className="user-info">
                                            {user.role !== "partner" ? (
                                                <div className="user-icon">

                                                    <i className="bi bi-shield"></i>
                                                </div>
                                            ) : (
                                                <div className="user-icon-partner">

                                                    <i class="bi bi-person-check"></i>
                                                </div>

                                            )}

                                            <div className="user-details">
                                                <div className="user-name">{user.username}</div>
                                                <div className="user-role">{user.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {user.role !== "partner" ? (
                                            <span className="partner-id blue-badge">
                                                {user.partner_id || user.employee_id || user.accountant_id}
                                            </span>

                                        ) : (
                                            <span className="partner-id green-badge">
                                                {user.partner_id || user.employee_id || user.accountant_id}
                                            </span>

                                        )}

                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="action-btn edit-btn"
                                                data-bs-toggle="modal"
                                                data-bs-target="#exampleModal"
                                                onClick={() => handleGetUserDetails(user.id)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td data-bs-toggle="modal" data-bs-target="#resetModal" onClick={() => handleResetPasswordId(user.id)}><i class="bi bi-unlock2 reset-pswrd"></i></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>


                </div>

            </div>
            {/* Pagination */}
            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    →
                </button>
            </div>

            {/* user edit */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true" ref={modalRef}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Edit User</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label className="form-label">User Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedUsers.username || ''}
                                        onChange={(e) => setSelectedUsers({ ...selectedUsers, username: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={selectedUsers.email || ''}
                                        onChange={(e) => setSelectedUsers({ ...selectedUsers, email: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={selectedUsers.phone || ''}
                                        onChange={(e) => setSelectedUsers({ ...selectedUsers, phone: e.target.value })}
                                    />
                                </div>
                                {selectedUsers.role === 'partner' && (
                                    <div className="mb-3">
                                        <label className="form-label">Dividend</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={selectedUsers.dividend || ''}
                                            onChange={(e) =>
                                                setSelectedUsers({ ...selectedUsers, dividend: e.target.value })
                                            }
                                        />
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="modal-footer">
                            
                            <button
                                type="button"
                                className="save-btn-modal"
                                onClick={() => handleSave(selectedUsers.id)}
                            >
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* reset password */}

            <div class="modal fade" id="resetModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel">Reset Password</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={closeRef}></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div className="mb-3 position-relative">
                                    <label className="form-label">Password</label>
                                    <div className="input-group">
                                        <input
                                            type={resetForm.showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            value={resetForm.password}
                                            onChange={(e) =>
                                                setResetForm({ ...resetForm, password: e.target.value })
                                            }
                                        />
                                        <span
                                            className="input-group-text"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => togglePasswordVisibility('showPassword')}
                                        >
                                            <i className={`bi ${resetForm.showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </span>
                                    </div>

                                    <label className="form-label mt-2">Confirm Password</label>
                                    <div className="input-group">
                                        <input
                                            type={resetForm.showConfirmPassword ? 'text' : 'password'}
                                            className="form-control"
                                            value={resetForm.confirmPassword}
                                            onChange={(e) =>
                                                setResetForm({ ...resetForm, confirmPassword: e.target.value })
                                            }
                                        />
                                        <span
                                            className="input-group-text"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => togglePasswordVisibility('showConfirmPassword')}
                                        >
                                            <i className={`bi ${resetForm.showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </span>
                                    </div>
                                </div>

                            </form>



                        </div>
                        <div class="modal-footer">
                            <button type="button"   className="save-btn-modal" onClick={handleResetPAssword}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementSystem;
