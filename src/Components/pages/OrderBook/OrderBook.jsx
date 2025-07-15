import React, { useEffect, useRef, useState } from 'react';
import './OrderBook.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from "react-select";

function OrderBook() {
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL;
    const apiUsersUrl = import.meta.env.VITE_API_LOGIN_URL;
    const [token, setToken] = useState("")
    const [role, setRole] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [demo, setDemo] = useState([]);
    const closeModalRef = useRef(null);
    const [orderId, setOrderId] = useState(0);
    const [transactionId, setTransactionId] = useState(0);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [formData, setData] = useState({
        bankName: "",
        bankAccountNumber: "",
        paymentReceipt: null,
        paymentAmount: "",
        paymentDate: "",
        referenceNumber: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        setToken(token)
        fetchOrderBook(token);
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        fetchUsers(token)
    }, []);

    const fetchUsers = async (token) => {
        try {
            const response = await axios.get(`${apiUsersUrl}filter-users/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            let users = response?.data?.data || [];

            // Get logged-in user ID and username from localStorage
            const loggedInUserId = localStorage.getItem("user_id");
            const loggedInUsername = localStorage.getItem("username");

            // Move logged-in user to the top of the list
            users = users.sort((a, b) => {
                if (a.id === loggedInUserId) return -1;
                if (b.id === loggedInUserId) return 1;
                return 0;
            });

            setFilteredUsers(users);

            // Set the logged-in user as the default selected
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
                    Authorization: ` Token ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = response?.data?.data?.transactions;
            setDemo(data)

            if (Array.isArray(data)) {
                setAllUsers(data);

            } else {
                setAllUsers([]);
            }
        } catch (error) {
            console.error("Error fetching order book:", error);
        }
    };

    const roleLabels = {
        vittamoney: { label: "Admin", color: "#c6c6c6" },
        vittamoney_user: { label: "Employee", color: "#c6c6c6" },
        accountant: { label: "Accountant", color: "#c6c6c6" },
        partner: { label: "Partner", color: "#c6c6c6" }
    };

    // Fixed filtering logic
    const orders = (() => {
        if (!Array.isArray(allUsers) || allUsers.length === 0 || !selectedUserId) {
            return [];
        }

        const pendingTransactions = allUsers.filter(transaction => transaction.status === "pending");

        return pendingTransactions.filter(transaction => transaction.owner === selectedUserId);
    })();

    const handleSearch = (e) => {
        setSearchInput(e.target.value);
        setCurrentPage(1);
    };

    const filteredOrders = orders.filter(order =>
        order.client_name.toLowerCase().includes(searchInput.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

    const handleOpenEdit = (transaction_id, order_id) => {
        setOrderId(order_id);
        setTransactionId(transaction_id);
    };

    const handleChangeInputs = (e) => {
        const { name, value, files, type } = e.target;

        if (type === 'file') {
            const file = files[0];

            if (file) {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    alert("Only image files (JPG, JPEG, PNG) are allowed.");
                    return;
                }

                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    alert("File size should be less than 5MB.");
                    return;
                }
            }

            setData(prev => ({
                ...prev,
                [name]: file
            }));
        } else {
            setData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };


    const handleSave = async () => {
        if (
            !transactionId ||
            !formData.bankName.trim() ||
            !formData.bankAccountNumber.trim() ||
            !formData.paymentAmount ||
            !formData.paymentDate ||
            !formData.referenceNumber ||
            !formData.paymentReceipt
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Fields',
                text: 'Please fill all fields before saving.',
            });
            return;
        }

        const token = localStorage.getItem("token");

        const paymentData = new FormData();
        paymentData.append("transaction", transactionId);
        paymentData.append("bank_name", formData.bankName);
        paymentData.append("bank_account_number", formData.bankAccountNumber);
        paymentData.append("payment_amount", formData.paymentAmount);
        paymentData.append("payment_date", formData.paymentDate);
        paymentData.append("payment_receipt", formData.paymentReceipt);
        paymentData.append("payment_reference_number", formData.referenceNumber);

        try {
            const response = await axios.post(`${apiUrl}payment-details/`, paymentData, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 && response.data.statuscode === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Transaction completed successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

                closeModalRef.current?.click();

                // Reset form
                setData({
                    bankName: "",
                    bankAccountNumber: "",
                    paymentReceipt: null,
                    paymentAmount: "",
                    paymentDate: "",
                    referenceNumber: ""
                });


                // Refresh the order book
                fetchOrderBook(token);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Unexpected server response. Please try again.',
                });
            }

        } catch (error) {
            console.error("Error occurred:", error.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: 'An error occurred while saving. Please try again later.',
            });
        }
    };


    const handleCancellOrder = async (transaction_id) => {
        const token = localStorage.getItem("token");

        // Show confirmation alert
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to cancel this transaction?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        });

        // If user confirms cancellation
        if (result.isConfirmed) {
            try {
                const response = await axios.patch(`${apiUrl}transactions/${transaction_id}/`, {
                    status: "cancelled"
                }, {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                });


                Swal.fire({
                    icon: 'success',
                    title: 'Cancelled!',
                    text: 'Transaction cancelled successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

                fetchOrderBook(token);

            } catch (error) {
                console.error("Error cancelling order:", error.response?.data || error.message);

                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to cancel the transaction.',
                });
            }
        }
    };


    // delete Tranasaction

    const handleDeleteTransaction = async (id) => {
        const token = localStorage.getItem("token");

        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to permanently delete this transaction?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (confirm.isConfirmed) {
            try {
                const response = await axios.delete(`${apiUrl}transactions/${id}/`, {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Transaction has been deleted successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Optionally refresh the data
                    fetchOrderBook(token);
                }

            } catch (error) {
                console.error("Delete failed:", error.response?.data || error.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to delete the transaction.',
                });
            }
        }
    };


    return (
        <div className="content-area">
            <div className='un-head'>
                <div className="header-logo">OB</div>
                <p className="un-title">Order Book</p>
            </div>

            {(role === "vittamoney_user" || role === "vittamoney" || role === "accountant") && (
                <div className="user-filter">
                    <label>Created By: </label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isClearable={false} // ✅ Prevents blank option
                        placeholder="Select user"
                        value={
                            filteredUsers.find(user => user.id === selectedUserId)
                                ? { value: selectedUserId, label: filteredUsers.find(user => user.id === selectedUserId).username }
                                : null
                        }
                        options={filteredUsers.map(user => ({
                            value: user.id,
                            label: (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>
                                        {user.username}
                                        {user.id === localStorage.getItem("user_id") && " (You)"}
                                    </span>
                                    <span style={{ color: roleLabels[user.role]?.color || "black", fontWeight: "bold" }}>
                                        {roleLabels[user.role]?.label || ""}
                                    </span>
                                </div>
                            )
                        }))}

                        onChange={(selected) => setSelectedUserId(selected ? selected.value : "")}
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
                            <th>CLIENT ID</th>
                            <th>CLIENT NAME</th>
                            <th>PRODUCT</th>
                            <th>TYPE</th>
                            <th>QUANTITY</th>
                            <th>CLIENT PRICE</th>
                            <th>OUR PRICE</th>
                            <th>TOTAL PRICE</th>
                            {/* <th>CREATED BY</th> */}
                            {(role === "vittamoney_user" || role === "vittamoney" || role === "partner") && (
                                <>
                                    <th>Action</th>
                                    <th></th>
                                </>
                            )}
                            {(role === "vittamoney_user" || role === "vittamoney") && (
                                <th>DELETE</th>

                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order, idx) => {
                                const total = order.quantity * parseFloat(order.client_price || 0);
                                return (
                                    <tr key={idx} className={order.payment ? "blur-row" : ""} >
                                        <td>{order.order_id}</td>
                                        <td>{order.client_id}</td>
                                        <td>{order.client_name}</td>
                                        <td>{order.product_name}</td>
                                        <td>
                                            <span className="type-tag">
                                                {order.transaction_type?.toUpperCase() || '-'}
                                            </span>
                                        </td>
                                        <td>{order.quantity}</td>
                                        <td>₹{Number(order.client_price).toFixed(2)}</td>
                                        <td>₹{Number(order.our_price).toFixed(2)}</td>
                                        <td>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        {/* <td>{order.owner_info?.username || 'N/A'}</td> */}
                                        {(role === "vittamoney_user" || role === "vittamoney" || role === "partner") && (
                                            <>
                                                <td
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#staticBackdrop"
                                                    onClick={() => handleOpenEdit(order.id, order.order_id)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <i className="bi bi-check-circle-fill text-success"></i>
                                                </td>
                                                <td
                                                    onClick={() => handleCancellOrder(order.id)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <i className="bi bi-x-circle-fill text-danger"></i>
                                                </td>
                                            </>
                                        )}
                                        {(role === "vittamoney_user" || role === "vittamoney") && (

                                            <td onClick={() => handleDeleteTransaction(order.id)}>
                                                <i className="bi bi-trash3 ms-3"></i>
                                            </td>


                                        )}



                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                                    No orders available
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

            {/* Modal */}
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Payment Details</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef}></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className='order-inputs'>
                                    <label>Order Id</label>
                                    <input className="form-control" value={orderId} readOnly />
                                </div>
                                <div className='order-inputs'>
                                    <label>Bank Name</label>
                                    <input type="text" name="bankName" className="form-control" value={formData.bankName} onChange={handleChangeInputs} />
                                </div>
                                <div className='order-inputs'>
                                    <label>Bank Account Number</label>
                                    <input type="text" name='bankAccountNumber' style={{ textTransform: "uppercase" }} className="form-control" value={formData.bankAccountNumber} onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            bankAccountNumber: e.target.value.toUpperCase() // stores as uppercase
                                        }))
                                    } />
                                </div>
                                <div className='order-inputs'>
                                    <label>Payment Receipt</label>

                                    <input
                                        type="file"
                                        name="paymentReceipt"
                                        accept="image/png, image/jpeg, image/jpg"
                                        className="form-control"
                                        onChange={handleChangeInputs}
                                    />
                                    <label htmlFor="paymentReceipt" className="text-muted">
                                        Upload Payment Screenshot <span >(JPG, JPEG, PNG)</span>
                                    </label>

                                </div>
                                <div className='order-inputs'>
                                    <label>Payment Amount</label>
                                    <input type="number" name='paymentAmount' className="form-control" value={formData.paymentAmount} onChange={handleChangeInputs} />
                                </div>
                                <div className='order-inputs'>
                                    <label>Payment Date</label>
                                    <input type="date" name='paymentDate' className="form-control" value={formData.paymentDate} onChange={handleChangeInputs} />
                                </div>
                                <div className='order-inputs'>
                                    <label>Reference Number</label>
                                    <input type="text" name='referenceNumber' className="form-control" value={formData.referenceNumber} onChange={handleChangeInputs} />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button"  className="save-btn-modal"  onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderBook;