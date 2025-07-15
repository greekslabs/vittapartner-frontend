import React, { useEffect, useRef, useState } from 'react';
import './UnlistedShares.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Unlistedshare() {
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [token, setToken] = useState("");
    const [allSharesData, setAllSharesData] = useState([]);
    const [sharesData, setSharesData] = useState([]); // Initialize as empty array
    const [role, setRole] = useState("");
    const [editableData, setEditableData] = useState([]);
    const itemsPerPage = 7;
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL
    const closeModal=useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setToken(token);
        fetchAllShare(token);
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    }, [])

    // Update sharesData when allSharesData changes
    useEffect(() => {
        setSharesData(allSharesData);
    }, [allSharesData]);

    const fetchAllShare = async (token) => {
        try {
            const response = await axios.get(`${apiUrl}product/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            console.log("API Response:", response.data.data);
            setAllSharesData(response.data.data);
        } catch (error) {
            console.error("Error fetching shares:", error);
        }
    }
    const [editFormData, setEditFormData] = useState({
        name: "",
        price: "",
        description: ""

    })

    const handleEdit = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`${apiUrl}product/${id}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            console.log("edit data", response?.data?.data)
            const data = response?.data?.data;
            setEditableData(data)
            setEditFormData({
                name: data.name,
                price: data.price,
                description: data.description
            })

        } catch (error) {
            console.log(error)

        }
    }
// save edited product
    const handleSaveEdit = async (id) => {
        try {
            const response = await axios.patch(`${apiUrl}product/${id}/`, editFormData, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            console.log("edited", response.data.statuscode);

            // Refresh data
            fetchAllShare(token);

            if (response.data.statuscode === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Update Successful',
                    text: 'The product details were updated successfully!',
                    timer: 2000,
                    showConfirmButton: false,
                });

               closeModal?.current?.click();

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: 'Something went wrong while updating the product.',
                });
            }

        } catch (error) {
            console.error("Update error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred while updating the product.',
            });
        }
    };

    // products delete function


const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action will permanently delete the product.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.delete(`${apiUrl}product/${id}/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            if (response.data.statuscode === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: response.data.message,
                    confirmButtonColor: '#28a745',
                });

                // Optional: Refresh the data after deletion
                fetchAllShare(token);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Something went wrong while deleting.',
                confirmButtonColor: '#d33',
            });
            console.error("Delete error:", error);
        }
    }
};


    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchInput(value);
        setCurrentPage(1); // reset to page 1 on new search

        if (value === "") {
            setSharesData(allSharesData);
        } else {
            const filtered = allSharesData.filter(share =>
                share.name.toLowerCase().includes(value) // Changed from companyName to name
            );
            setSharesData(filtered);
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sharesData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(sharesData.length / itemsPerPage);

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // navigate to transaction

    const handleTransaction = (product_name, price, id) => {
        navigate(`/transactions/${product_name}/${price}/${id}`)

    }

    return (
        <div className="content-area">
            <div className='un-main-head'>
                <div className='un-head'>
                    <div className="header-logo">US</div>
                    <p className="un-title">Unlisted Securities</p>
                    {(role === "vittamoney" || role === "vittamoney_user") && (
                        <div className="header-logo"><Link to="/add-products" className='product-add-btn'>+</Link></div>
                    )}


                </div>
                <div className="search-box">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={handleSearch}
                        placeholder="Search company name..."
                    />

                </div>
            </div>

            <div className="table-container">
                <table className="shares-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Company Name</th>
                            <th>Price (₹)</th>

                            {/* <th>Description</th> */}
                            {(role === "vittamoney" || role === "vittamoney_user" || role === "partner") && (<th>Actions</th>)}
                            {(role === "vittamoney" || role === "vittamoney_user") && (
                                <>
                                    <th>Edit</th>
                                    <th>Delete</th>
                                </>

                            )}

                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((share, index) => (
                                <tr key={share.id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{share.name}</td>
                                    <td>₹{parseFloat(share.price).toFixed(2)}</td>
                                    {/* <td>{share.description}</td> */}
                                    {(role === "vittamoney" || role === "vittamoney_user" || role === "partner") && (
                                        <td><button className="action-btn" onClick={() => handleTransaction(share.name, parseFloat(share.price), share.id)}>Trade</button></td>
                                    )}
                                    {(role === "vittamoney" || role === "vittamoney_user") && (
                                        <>
                                            <td onClick={() => handleEdit(share.id)} data-bs-toggle="modal" data-bs-target="#exampleModal" > <i className="bi bi-pencil-square"></i></td>
                                            <td onClick={()=>handleDelete(share.id)} >  <i className="bi bi-trash3"></i></td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    {allSharesData.length === 0 ? 'Loading...' : 'No companies found'}
                                </td>
                            </tr>
                        )}
                    </tbody>


                </table>
                {/* edit modal  */}
                <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="exampleModalLabel">Edit Product</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={closeModal}></button>
                            </div>
                            <div class="modal-body">
                                <label>Name</label>
                                <input
                                    type='text'
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className='form-control form-group'
                                />

                                <label>Price</label>
                                <input
                                    type='number'
                                    value={editFormData.price}
                                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                    className='form-control form-group'
                                />
                                <label>Description</label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className='form-control form-group'
                                />

                            </div>
                            <div class="modal-footer">
                                <button type="button"  className="save-btn-modal"  onClick={() => handleSaveEdit(editableData.id)}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-bar">
                <span>
                    Showing {currentItems.length} of {sharesData.length} companies
                </span>
                <div className="pagination">
                    <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                        &larr;
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            className={currentPage === i + 1 ? 'active' : ''}
                            onClick={() => changePage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
                        &rarr;
                    </button>
                </div>
            </div>




        </div>
    );
}

export default Unlistedshare;