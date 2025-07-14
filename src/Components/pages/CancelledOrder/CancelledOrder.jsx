import React, { useEffect, useState } from 'react';
import "./CancelledOrder.css";
import axios from 'axios';
import Select from "react-select";

function CancelledOrder() {
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL;
    const apiUsersUrl = import.meta.env.VITE_API_LOGIN_URL;

    const [role, setRole] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        fetchUsers(token);
        fetchOrderBook(token);
    }, []);

    const fetchUsers = async (token) => {
        try {
            const response = await axios.get(`${apiUsersUrl}filter-users/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            let users = response?.data?.data || [];

            // Get logged-in user ID from localStorage
            const loggedInUserId = localStorage.getItem("user_id");

            // Sort so that logged-in user comes first
            users = users.sort((a, b) => {
                if (a.id === loggedInUserId) return -1;
                if (b.id === loggedInUserId) return 1;
                return 0;
            });

            setFilteredUsers(users);

            // Set default selected user
            if (loggedInUserId) {
                setSelectedUserId(loggedInUserId);
            } else if (users.length > 0) {
                setSelectedUserId(users[0].id);
            }

        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    const fetchOrderBook = async (token) => {
        try {
            const response = await axios.get(`${apiUrl}transactions/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = response?.data?.data?.transactions || [];
            setAllUsers(data);
        } catch (error) {
            console.error("Error fetching order book:", error);
        }
    };

    const handleSearch = (e) => {
        setSearchInput(e.target.value);
        setCurrentPage(1);
    };

    const roleLabels = {
        vittamoney: { label: "Admin", color: "#c6c6c6" },
        vittamoney_user: { label: "Employee", color: "#c6c6c6" },
        accountant: { label: "Accountant", color: "#c6c6c6" },
        partner: { label: "Partner", color: "#c6c6c6" }
    };

    const orders = (() => {
        const cancelled = allUsers.filter(t => t.status === "cancelled");

        if (!selectedUserId) return [];
        return cancelled.filter(order => order.owner === selectedUserId);
    })();

    const filteredOrders = orders.filter(order =>
        order.client_name.toLowerCase().includes(searchInput.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="content-area">
            <div className='un-head'>
                <div className="header-logo">CO</div>
                <p className="un-title">Cancelled Orders</p>
            </div>

            {(role === "vittamoney_user" || role === "vittamoney" || role === "accountant") && (
                <div className="user-filter">
                    <label>Created By: </label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select user"
                        value={
                            filteredUsers.find(u => u.id === selectedUserId)
                                ? {
                                    value: selectedUserId,
                                    label: (
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>
                                                {filteredUsers.find(u => u.id === selectedUserId).username}
                                                {filteredUsers.find(u => u.id === selectedUserId).id === localStorage.getItem("user_id") ? " (You)" : ""}
                                            </span>
                                            <span style={{
                                                color: roleLabels[filteredUsers.find(u => u.id === selectedUserId).role]?.color || "black",
                                                fontWeight: "bold"
                                            }}>
                                                {roleLabels[filteredUsers.find(u => u.id === selectedUserId).role]?.label || ""}
                                            </span>
                                        </div>
                                    )
                                }
                                : null
                        }
                        options={filteredUsers.map(user => ({
                            value: user.id,
                            label: (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>
                                        {user.username}
                                        {user.id === localStorage.getItem("user_id") ? " (You)" : ""}
                                    </span>
                                    <span style={{
                                        color: roleLabels[user.role]?.color || "black",
                                        fontWeight: "bold"
                                    }}>
                                        {roleLabels[user.role]?.label || ""}
                                    </span>
                                </div>
                            )
                        }))}
                        onChange={(selected) => setSelectedUserId(selected ? selected.value : '')}
                    />

                </div>
            )}

            <div className="order-table-container">
                <div className="search-container" style={{ marginBottom: "20px" }}>
                    <input
                        type="text"
                        placeholder="Search by client name..."
                        value={searchInput}
                        onChange={handleSearch}
                        style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                </div>

                <table className="order-table">
                    <thead>
                        <tr>
                            <th>ORDER ID</th>
                            <th>CLIENT NAME</th>
                            <th>PRODUCT</th>
                            <th>TYPE</th>
                            <th>QUANTITY</th>
                            <th>CLIENT PRICE</th>
                            <th>TOTAL PRICE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order, idx) => {
                                const total = order.quantity * parseFloat(order.client_price || 0);
                                return (
                                    <tr key={idx}>
                                        <td>{order.order_id}</td>
                                        <td>{order.client_name}</td>
                                        <td>{order.product_name}</td>
                                        <td>
                                            <span className="type-tag">
                                                {order.transaction_type?.toUpperCase() || '-'}
                                            </span>
                                        </td>
                                        <td>{order.quantity}</td>
                                        <td>₹{Number(order.client_price).toFixed(2)}</td>
                                        <td>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                    No cancelled orders available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="pagination">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        Prev
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CancelledOrder;
