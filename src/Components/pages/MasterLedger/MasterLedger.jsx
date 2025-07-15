import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MasterLedger.css';

function MasterLedger() {
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [ownerId, setOwnerId] = useState("");

    const [showNewRow, setShowNewRow] = useState(false);
    const [newEntry, setNewEntry] = useState({ description: "", entry_type: "credit", amount: "" });

    const [editRowId, setEditRowId] = useState(null);
    const [editEntry, setEditEntry] = useState({ description: "", entry_type: "credit", amount: "" });

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL;

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6;

    const totalPages = Math.ceil(ledgerEntries.length / rowsPerPage);
    const paginatedEntries = ledgerEntries.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    useEffect(() => {
        const userRole = localStorage.getItem("role");
        setRole(userRole);
        fetchLedgerEntries();
    }, []);

    const fetchLedgerEntries = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(`${apiUrl}ledger-master/`, {
                headers: { Authorization: `Token ${token}` }
            });
            if (resp?.data?.data?.length > 0 && resp?.data?.data[0].owner) {
                setOwnerId(resp.data.data[0].owner);
            }
            if (resp?.status === 200 && Array.isArray(resp?.data?.data)) {
                setLedgerEntries(resp?.data?.data);
            } else {
                Swal.fire('Error', 'Failed to load ledger data.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'An error occurred while fetching ledger data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalBalance = ledgerEntries.reduce((acc, entry) => {
        const amt = parseFloat(entry.amount) || 0;
        return entry.entry_type === 'credit' ? acc + amt : acc - amt;
    }, 0);

    const handleNewEntryChange = (field, val) => {
        setNewEntry(prev => ({ ...prev, [field]: val }));
    };

    const handleSaveEntry = async () => {
        if (!newEntry.description || !newEntry.amount) {
            Swal.fire("Warning", "Please fill all fields.", "warning");
            return;
        }

        try {
            const resp = await axios.post(`${apiUrl}ledger-master/`, {
                owner: ownerId,
                description: newEntry.description,
                entry_type: newEntry.entry_type,
                amount: newEntry.amount
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            if (resp.status === 200 && resp.data.statuscode === 201) {
                Swal.fire("Success", "Entry added.", "success");
                setNewEntry({ description: "", entry_type: "credit", amount: "" });
                setShowNewRow(false);
                fetchLedgerEntries();
            } else {
                Swal.fire("Error", "Unexpected server response.", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to save entry.", "error");
        }
    };

    const handleCancelEntry = () => {
        setShowNewRow(false);
    };

    const handleEditClick = (entry) => {
        setEditRowId(entry.id);
        setEditEntry({
            description: entry.description,
            entry_type: entry.entry_type,
            amount: entry.amount
        });
    };

    const handleCancelEdit = () => {
        setEditRowId(null);
        setEditEntry({ description: "", entry_type: "credit", amount: "" });
    };

    const handleSaveEdit = async (id) => {
        try {
            const resp = await axios.patch(`${apiUrl}ledger-master/${id}/`, editEntry, {
                headers: { Authorization: `Token ${token}` }
            });

            if (resp.status === 200 && resp.data.statuscode === 200) {
                Swal.fire("Updated", "Entry updated.", "success");
                setEditRowId(null);
                fetchLedgerEntries();
            } else {
                Swal.fire("Error", "Unexpected server response.", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to update entry.", "error");
        }
    };

    const handleDeleteLedger = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This entry will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const resp = await axios.delete(`${apiUrl}ledger-master/${id}/`, {
                    headers: { Authorization: `Token ${token}` }
                });

                if (resp.status === 200 && resp.data.statuscode === 200) {
                    Swal.fire("Deleted", "Entry has been deleted.", "success");
                    fetchLedgerEntries();
                } else {
                    Swal.fire("Error", "Unexpected server response.", "error");
                }
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Failed to delete entry.", "error");
            }
        }
    };

    return (
        <div className="content-area">
            <div className='un-head'>
                <div className="header-logo">ML</div>
                <p className="un-title">Master Ledger</p>
            </div>

            <div className="order-table-container">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>DESCRIPTION</th>
                            <th>ENTRY TYPE</th>
                            <th>AMOUNT</th>
                            {role === "accountant" && (
                                <th colSpan={2} onClick={() => setShowNewRow(true)} style={{ cursor: "pointer" }}>
                                    ADD <i className="bi bi-plus-circle"></i>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Loading...</td></tr>
                        ) : paginatedEntries.length === 0 ? (
                            <tr><td colSpan="5">No entries found.</td></tr>
                        ) : (
                            <>
                                {paginatedEntries.map(entry => (
                                    <tr key={entry.id}>
                                        {editRowId === entry.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        value={editEntry.description}
                                                        onChange={(e) => setEditEntry({ ...editEntry, description: e.target.value })}
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        value={editEntry.entry_type}
                                                        onChange={(e) => setEditEntry({ ...editEntry, entry_type: e.target.value })}
                                                    >
                                                        <option value="credit">Credit</option>
                                                        <option value="debit">Debit</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={editEntry.amount}
                                                        onChange={(e) => setEditEntry({ ...editEntry, amount: e.target.value })}
                                                    />
                                                </td>
                                                <td colSpan="2">
                                                    <div className="inline-edit-buttons">
                                                        <button className="save-btn" onClick={() => handleSaveEdit(entry.id)}>Save</button>
                                                        <div className="cancel-btn" onClick={handleCancelEdit}><i class="bi bi-x-circle"></i></div>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{entry.description}</td>
                                                <td>{entry.entry_type}</td>
                                                <td style={{ color: entry.entry_type === "debit" ? "red" : "green" }}>
                                                    ₹{Number(entry.amount).toFixed(2)}
                                                </td>
                                                {role === "accountant" && (
                                                    <>
                                                        <td>
                                                            <i className="bi bi-pencil-square" style={{ cursor: "pointer" }} onClick={() => handleEditClick(entry)}></i>
                                                        </td>
                                                        <td onClick={() => handleDeleteLedger(entry.id)}><i className="bi bi-trash3"></i></td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="2" style={{ textAlign: "right", fontWeight: "bold" }}>Total Balance:</td>
                                    <td style={{ fontWeight: "bold", color: totalBalance < 0 ? "red" : "green" }}>
                                        ₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    {role === "accountant" && <td colSpan="2"></td>}
                                </tr>
                            </>
                        )}

                        {showNewRow && (
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        value={newEntry.description}
                                        placeholder="Description"
                                        onChange={e => handleNewEntryChange("description", e.target.value)}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={newEntry.entry_type}
                                        onChange={e => handleNewEntryChange("entry_type", e.target.value)}
                                    >
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={newEntry.amount}
                                        placeholder="Amount"
                                        onChange={e => handleNewEntryChange("amount", e.target.value)}
                                    />
                                </td>
                                <td colSpan="2">
                                    <div className="inline-edit-buttons">
                                        <button className='save-btn' onClick={handleSaveEntry}>Save</button>
                                        <div className="cancel-btn" onClick={handleCancelEntry}><i class="bi bi-x-circle"></i></div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="custom-pagination">
                    <button
                        className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ←
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MasterLedger;
