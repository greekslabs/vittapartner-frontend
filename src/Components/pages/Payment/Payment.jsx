import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Payment.css";
import Swal from 'sweetalert2';
import Select from "react-select";

function Payment() {
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL;
    const apiUsersUrl = import.meta.env.VITE_API_LOGIN_URL;
    const [role, setRole] = useState("");
    const [paymentDetails, setPaymentDetails] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [selectedUserId, setSelectedUserId] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [receiptImageUrl, setReceiptImageUrl] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchInput, setSearchInput] = useState(""); 

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        fetchPayment(token);
        fetchUsers(token);
    }, []);

    // fetch users
    const fetchUsers = async (token) => {
        try {
            const response = await axios.get(`${apiUsersUrl}filter-users/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setFilteredUsers(response?.data?.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // payment fetch
    const fetchPayment = async (token) => {
        try {
            const res = await axios.get(`${apiUrl}payment-details/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            const data = res?.data?.data;
            if (Array.isArray(data)) {
                setPaymentDetails(res?.data?.data);
                setSelectedUserId(""); // Default to ALL
            } else {
                setPaymentDetails([]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleEditPayment = async (id) => {
        const token = localStorage.getItem("token");

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to verify this payment?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, verify it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.patch(`${apiUrl}payment-details/${id}/`, {
                    payment_status: "verified"
                }, {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                });

                fetchPayment(token);

                Swal.fire(
                    'Verified!',
                    'The payment has been verified.',
                    'success'
                );

            } catch (error) {
                Swal.fire(
                    'Error!',
                    'Something went wrong while verifying the payment.',
                    'error'
                );
                console.error("Patch error", error);
            }
        }
    };

    // open receipt pdf and image 
    const handleOpenReceipt = (url) => {
        if (!url) return;

        const fileExtension = url.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
            setReceiptImageUrl(url);
            const modal = new bootstrap.Modal(document.getElementById('receiptModal'));
            modal.show();
        } else {
            window.open(url, '_blank'); // for PDFs
        }
    };

    const roleLabels = {
        vittamoney: { label: "Admin", color: "#c6c6c6" },
        vittamoney_user: { label: "Employee", color: "#c6c6c6" },
        accountant: { label: "Accountant", color: "#c6c6c6" },
        partner: { label: "Partner", color: "#c6c6c6" }
    };

    // Updated filtering logic to work with owner_info
    const orders = (() => {
        if (!Array.isArray(paymentDetails) || paymentDetails.length === 0) {
            return [];
        }

        // Filter only pending transactions
        const pendingTransactions = paymentDetails.filter(transaction => transaction.payment_status === "pending");

        // If no user is selected (empty string), show all pending transactions
        if (selectedUserId === "") {
            return pendingTransactions;
        }

        // Filter by selected user ID (owner_info.id field in transaction)
        return pendingTransactions.filter(transaction =>
            transaction.owner_info && transaction.owner_info.id === selectedUserId
        );
    })();

    // Updated search filter to work with owner_info
    const filteredOrders = orders.filter(order => {
        const clientName = order.owner_info?.username || "";
        return clientName.toLowerCase().includes(searchInput.toLowerCase());
    });

    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginated = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="content-area">
            <div className='un-head'>
                <div className="header-logo">PD</div>
                <p className="un-title">Payment Details</p>
            </div>

            {(role === "vittamoney_user" || role === "vittamoney" || role === "accountant") && (
                <div className="user-filter">
                    <label>Created By: </label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable
                        placeholder="Select user"
                        value={selectedUserId === "" ? { value: "", label: "ALL" } :
                            filteredUsers.find(user => user.id === selectedUserId) ?
                                { value: selectedUserId, label: filteredUsers.find(user => user.id === selectedUserId).username } :
                                null}
                        options={[
                            { value: "", label: "ALL" },
                            ...filteredUsers.map(user => ({
                                value: user.id,
                                label: (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>{user.username}</span>
                                        <span style={{ color: roleLabels[user.role]?.color || "black", fontWeight: "bold" }}>
                                            {roleLabels[user.role]?.label || ""}
                                        </span>
                                    </div>
                                )
                            }))
                        ]}
                        onChange={(selected) => setSelectedUserId(selected ? selected.value : "")}
                    />
                </div>
            )}



            <div className="order-table-container">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>ORDER ID</th>
                            <th>OWNER</th>
                            <th>BANK NAME</th>
                            <th>ACCOUNT NUMBER</th>
                            <th>PAYMENT DATE</th>
                            <th>PRODUCT NAME</th>
                            <th>QUANTITY</th>
                            <th>CLIENT PRICE</th>
                            <th>TOTAL PRICE</th>
                            <th>RECEIPT</th>
                            {role === "accountant" && (
                                <th>VERIFY</th>
                            )}

                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                                    No pending orders found
                                </td>
                            </tr>
                        ) : (
                            paginated.map((order, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{order.transaction_order_id}</td>
                                        <td>{order.owner_info?.username || 'N/A'}</td>
                                        <td>{order.bank_name}</td>
                                        <td>{order.bank_account_number}</td>
                                        <td>{order.payment_date}</td>
                                        <td>{order.product_name}</td>
                                        <td>{order.quantity}</td>
                                        <td>{order.client_price}</td>
                                        <td>{order.total_price}</td>
                                        <td>
                                            <p
                                                className='view-btn-pdf'
                                                onClick={() => handleOpenReceipt(order.payment_receipt)}
                                            >
                                                View
                                            </p>
                                        </td>
                                        {role === "accountant" &&(
                                            <td>
                                                <button
                                                    className='verify-btn'
                                                    onClick={() => handleEditPayment(order.id)}
                                                >
                                                    Verify
                                                </button>
                                            </td>

                                        )}

                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* modal to show receipt */}
                <div
                    className="modal fade"
                    id="receiptModal"
                    tabIndex="-1"
                    aria-labelledby="receiptModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="receiptModalLabel">Payment Receipt</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body text-center">
                                {receiptImageUrl ? (
                                    <img
                                        src={receiptImageUrl}
                                        alt="Payment Receipt"
                                        className="img-fluid"
                                        style={{ maxHeight: "500px" }}
                                    />
                                ) : (
                                    <p>No image available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

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

export default Payment;