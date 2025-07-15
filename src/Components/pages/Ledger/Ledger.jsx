import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Ledger.css";
import Select from 'react-select';
import Swal from 'sweetalert2';

function Ledger() {
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL;
    const partnersApi = import.meta.env.VITE_API_LOGIN_URL;

    const [role, setRole] = useState("");
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [partners, setPartners] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [showNewRow, setShowNewRow] = useState(false);

    const [newEntry, setNewEntry] = useState({
        description: "",
        entry_type: "credit",
        amount: ""
    });

    const [editRowId, setEditRowId] = useState(null);
    const [editEntry, setEditEntry] = useState({
        description: "",
        entry_type: "credit",
        amount: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6;

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        setRole(userRole);
        fetchPartners(token);
        fetchLedger(token, userRole);
    }, []);

    const fetchPartners = async (token) => {
        try {
            const res = await axios.get(`${partnersApi}partners/`, {
                headers: { Authorization: `Token ${token}` }
            });
            const data = res?.data?.data || [];
            setPartners(data);
            if (data.length > 0 && role !== "partner") {
                setSelectedPartner({ value: data[0].id, label: data[0].username });
            }
        } catch (error) {
            console.error("Error fetching partners:", error);
        }
    };

    const fetchLedger = async (token, userRole) => {
        try {
            const res = await axios.get(`${apiUrl}ledger-partner/`, {
                headers: { Authorization: `Token ${token}` }
            });

            const ledgerData = res?.data?.data || [];
            setLedger(ledgerData);

            if (userRole === "partner" && ledgerData.length > 0) {
                const partnerInfo = ledgerData[0].owner_info;
                setSelectedPartner({
                    value: partnerInfo.id,
                    label: partnerInfo.username || "You"
                });
            }
        } catch (error) {
            console.error("Error fetching ledger:", error);
        }
    };

    const filteredLedger = role === "partner"
        ? ledger
        : selectedPartner
            ? ledger.filter(entry => entry.owner === selectedPartner.value)
            : ledger;

    const partnerTotals = {};
    ledger.forEach(entry => {
        const partnerId = entry.owner;
        const amount = parseFloat(entry.amount);
        if (!partnerTotals[partnerId]) partnerTotals[partnerId] = 0;
        partnerTotals[partnerId] += entry.entry_type === "credit" ? amount : -amount;
    });

    const paginatedLedger = filteredLedger.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filteredLedger.length / rowsPerPage);

    const handleNewEntryChange = (field, value) => {
        setNewEntry(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEntry = async () => {
        if (!newEntry.description || !newEntry.amount || !selectedPartner) {
            Swal.fire("Error", "All fields are required.", "warning");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await axios.post(`${apiUrl}ledger-partner/`, {
                owner: selectedPartner.value,
                description: newEntry.description,
                entry_type: newEntry.entry_type,
                amount: newEntry.amount,
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            if (response.status === 200 && response.data.statuscode === 201) {
                Swal.fire("Success", "Ledger entry added successfully.", "success");
            }

            setNewEntry({ description: "", entry_type: "credit", amount: "" });
            setShowNewRow(false);
            fetchLedger(token, role);
        } catch (error) {
            console.error("Error saving entry:", error);
            Swal.fire("Error", "Failed to save entry.", "error");
        }
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
        const token = localStorage.getItem("token");

        try {
            const response = await axios.patch(`${apiUrl}ledger-partner/${id}/`, editEntry, {
                headers: { Authorization: `Token ${token}` }
            });

            if (response.status === 200 && response.data.statuscode === 200) {
                Swal.fire("Updated", "Ledger entry updated successfully.", "success");
                fetchLedger(token, role);
                setEditRowId(null);
            }
        } catch (error) {
            console.error("Error updating entry:", error);
            Swal.fire("Error", "Failed to update entry.", "error");
        }
    };

    const handleDeleteLedger = async (id) => {
        const token = localStorage.getItem("token");
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
                const resp = await axios.delete(`${apiUrl}ledger-partner/${id}/`, {
                    headers: { Authorization: `Token ${token}` }
                });

                if (resp.status === 200 && resp.data.statuscode === 200) {
                    Swal.fire("Deleted", "Entry has been deleted.", "success");
                    fetchLedger(token, role);
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
                <div className="header-logo">LB</div>
                <p className="un-title">Ledger Book</p>
            </div>

            {role !== "partner" && (
                <div className="user-filter">
                    <label>Partner:</label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select Partner"
                        value={selectedPartner}
                        onChange={setSelectedPartner}
                        options={partners.map(partner => ({
                            value: partner.id,
                            label: partner.username
                        }))}
                        isClearable
                    />
                </div>
            )}

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
                        {paginatedLedger.length > 0 ? (
                            paginatedLedger.map((data, idx) => (
                                <tr key={idx}>
                                    {editRowId === data.id ? (
                                        <>
                                            <td>
                                                <input
                                                    value={editEntry.description}
                                                    onChange={(e) =>
                                                        setEditEntry({ ...editEntry, description: e.target.value })
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={editEntry.entry_type}
                                                    onChange={(e) =>
                                                        setEditEntry({ ...editEntry, entry_type: e.target.value })
                                                    }
                                                >
                                                    <option value="credit">Credit</option>
                                                    <option value="debit">Debit</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={editEntry.amount}
                                                    onChange={(e) =>
                                                        setEditEntry({ ...editEntry, amount: e.target.value })
                                                    }
                                                />
                                            </td>
                                            <td colSpan="2">
                                                 <div className="inline-edit-buttons">
                                                <button className="save-btn"  onClick={() => handleSaveEdit(data.id)}>Save</button>
                                                <div className="cancel-btn"  onClick={handleCancelEdit}><i class="bi bi-x-circle"></i></div>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{data.description}</td>
                                            <td>{data.entry_type}</td>
                                            <td style={{ color: data.entry_type === "credit" ? "green" : "red" }}>
                                                ₹{data.amount}
                                            </td>
                                            {role === "accountant" && (
                                                <>
                                                    <td>
                                                        <i
                                                            className="bi bi-pencil-square"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleEditClick(data)}
                                                        ></i>
                                                    </td>
                                                    <td>
                                                        <i
                                                            className="bi bi-trash3"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleDeleteLedger(data.id)}
                                                        ></i>
                                                    </td>
                                                </>
                                            )}
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                                    No ledger entries for this partner
                                </td>
                            </tr>
                        )}
                        {showNewRow && (
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        value={newEntry.description}
                                        placeholder="Description"
                                        onChange={(e) => handleNewEntryChange("description", e.target.value)}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={newEntry.entry_type}
                                        onChange={(e) => handleNewEntryChange("entry_type", e.target.value)}
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
                                        onChange={(e) => handleNewEntryChange("amount", e.target.value)}
                                    />
                                </td>
                                <td colSpan="2">
                                     <div className="inline-edit-buttons">
                                    <button className="save-btn" onClick={handleSaveEntry}>Save</button>
                                    <div className="cancel-btn" onClick={() => setShowNewRow(false)}><i class="bi bi-x-circle"></i></div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {selectedPartner && (
                            <tr>
                                <td colSpan="2"><strong>Total</strong></td>
                                <td style={{ fontWeight: "bold", color: "blue" }}>
                                    ₹ {partnerTotals[selectedPartner.value]?.toFixed(2) || "0.00"}
                                </td>
                                {role === "accountant" && <td colSpan="2"></td>}
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* PAGINATION UI */}
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

export default Ledger;
