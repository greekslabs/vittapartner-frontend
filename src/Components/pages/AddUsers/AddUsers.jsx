import React, { useEffect, useRef, useState } from 'react';
import "./AddUsers.css"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const UserManagementSystem = () => {
    const modalRef = useRef(null);

    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});

    // const [selectedUser, setSelectedUser] = useState(null);
    const [token, setToken] = useState("");

    const [role, setRole] = useState("");
    const [selectedRole, setSelectedRole] = useState("partner");
    const apiUrl = import.meta.env.VITE_API_LOGIN_URL;
    const [openEdit, setOpenEdit] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);

        const token = localStorage.getItem("token");
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

            // Filter partner users by default
            const defaultFiltered = allFetchedUsers.filter(user =>
                user.role?.toLowerCase() === "partner"
            );
            setUsers(defaultFiltered);

        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    // filter users
    const handleFilter = (role) => {
        setSelectedRole(role);
        const filteredUser = allUsers.filter((user) =>
            user.role?.toLowerCase() === role.toLowerCase()
        );
        setUsers(filteredUser);
    };





    const handleGetUserDetails = async (id) => {
        try {
            const response = await axios.get(`${apiUrl}user/${id}`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            console.log("getuser", response.data.data)
            setSelectedUsers(response.data.data)


        } catch (error) {

        }


    }

    //   user edit function

    const handleSave = async (id) => {
        const token = localStorage.getItem("token");

        const payload = {
            username: selectedUsers.username,
            email: selectedUsers.email,
            phone: selectedUsers.phone,
        };

        if (selectedUsers.role === "partner") {
            payload.dividend = selectedUsers.dividend;
        }

        try {
            const response = await axios.patch(`${apiUrl}user/${id}/`, payload, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'User updated successfully',
                timer: 1500,
                showConfirmButton: false,
            });

            fetchUsers(token);

            // ✅ Close modal using ref + Bootstrap modal API
            if (modalRef.current) {
                const modal = bootstrap.Modal.getInstance(modalRef.current) || new bootstrap.Modal(modalRef.current);
                modal.hide();
            }

        } catch (error) {
            console.error("Error updating user:", error.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Something went wrong. Please try again.',
            });
        }
    };


    // delete user function
    const handleDeleteUser = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This user will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return; // User canceled

        try {
            const response = await axios.delete(`${apiUrl}user/${id}/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (response.status === 204 || response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'User deleted successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });

                fetchUsers(token); // Refresh user list
            } else {
                console.warn("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: 'Something went wrong. Please try again.'
            });
        }
    };

    const handleRegisterOpen = () => {
        navigate("/signup")
    }

    return (

        <div className="container">
            <header className="header-adduser">
                <div className="header-content-1">
                    <div className='un-head'>
                        <div className="header-logo">UM</div>
                        <p className="un-title">User Management System</p>
                    </div>
                    {role === "vittamoney" && (
                        <button className="add-user-btn" onClick={handleRegisterOpen}>
                            <i className="fas fa-plus"></i>
                            Add User
                        </button>

                    )}


                </div>
            </header>
            <div>
                <div className="filter-users">
                    {role === "vittamoney" && (
                        <>
                            <button
                                className={`filter-btn-users ${selectedRole === "partner" ? "active" : ""}`}
                                onClick={() => handleFilter("partner")}
                            >
                                Partner
                            </button>
                            <button
                                className={`filter-btn-users ${selectedRole === "vittamoney_user" ? "active" : ""}`}
                                onClick={() => handleFilter("vittamoney_user")}
                            >
                                Vittamoney User
                            </button>
                            <button
                                className={`filter-btn-users ${selectedRole === "accountant" ? "active" : ""}`}
                                onClick={() => handleFilter("accountant")}
                            >
                                Accountant
                            </button>
                        </>

                    )}
                    {role === "vittamoney_user" && (
                        <>
                            <button
                                className={`filter-btn-users ${selectedRole === "partner" ? "active" : ""}`}
                                onClick={() => handleFilter("partner")}
                            >
                                Partner
                            </button>

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
                                    {selectedRole === "partner" && (
                                        <th>PARTNER ID</th>
                                    )}
                                    {selectedRole === "vittamoney_user" && (
                                        <th>EMPLOYEE ID</th>
                                    )}
                                    {selectedRole === "accountant" && (
                                        <th>ACCOUNTANT ID</th>
                                    )}

                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-icon">
                                                    {/* {user.role==="vittamoney_user" && user.role==="accountant"( */}
                                                    <i className="bi bi-shield"></i>

                                                    {/* )} */}

                                                </div>
                                                <div className="user-details">
                                                    <div className="user-name">{user.username}</div>
                                                    <div className="user-role">{user.role}</div>
                                                </div>
                                            </div>

                                        </td>
                                        {selectedRole === "partner" && (
                                            <td>
                                                <span className="partner-id blue-badge">{user.partner_id}</span>
                                            </td>
                                        )}
                                        {selectedRole === "vittamoney_user" && (
                                            <td>
                                                <span className="partner-id blue-badge">{user.employee_id}</span>
                                            </td>
                                        )}
                                        {selectedRole === "accountant" && (
                                            <td>
                                                <span className="partner-id blue-badge">{user.accountant_id}</span>
                                            </td>
                                        )}

                                        <td>
                                            <div className="actions">
                                                <button className="action-btn edit-btn" data-bs-toggle="modal" data-bs-target="#exampleModal"
                                                    // onClick={() => setSelectedUser(user)} 
                                                    onClick={() => handleGetUserDetails(user.id)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user.id)}>
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                </div>

                {/* edit modal */}
                <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" ref={modalRef}>
                    <div className="modal-dialog  modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Edit User</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {selectedUsers && (
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">User Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedUsers.username}
                                                onChange={(e) =>
                                                    setSelectedUsers({ ...selectedUsers, username: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={selectedUsers.email}
                                                onChange={(e) =>
                                                    setSelectedUsers({ ...selectedUsers, email: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={selectedUsers.phone}
                                                onChange={(e) =>
                                                    setSelectedUsers({ ...selectedUsers, phone: e.target.value })
                                                }
                                            />
                                        </div>




                                        {selectedUsers.role === "partner" && (
                                            <div className="mb-3">
                                                <label className="form-label">Divident</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={selectedUsers.dividend}  // ✅ Fix: use fallback empty string
                                                    onChange={(e) =>
                                                        setSelectedUsers({ ...selectedUsers, dividend: e.target.value })
                                                    }
                                                />
                                            </div>
                                        )}

                                    </form>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary" onClick={() => handleSave(selectedUsers.id)}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementSystem;