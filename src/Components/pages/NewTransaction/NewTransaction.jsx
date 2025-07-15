import React, { useEffect, useState } from 'react';
import "./NewTransaction.css";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';


function NewTransaction() {
    const { name, price, id } = useParams();
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL
    const accountsUrl = import.meta.env.VITE_API_LOGIN_URL
    const [selectedFileName, setSelectedFileName] = useState('');
    const [role, setRole] = useState("");
    const [token, setToken] = useState("");
    const [partnersList, setPartnersList] = useState([]);


    const [isPartner, setIsPartner] = useState(false);
    const navigate=useNavigate();
    const handleToggle = () => {
        setIsPartner((prev) => !prev);
        setPartner({ partnerId: "", partnerName: "", partnerPhone: "" });

    };
    // Grouped state
    const [employee, setEmployee] = useState({
        userName: "",
        phone: "",
        employeeId: "",
        userId: ""
    });

    const [trade, setTrade] = useState({
        transactionType: "",
        quantity: "",
        clientPrice: "",
        ourPrice: price
    });

    const [client, setClient] = useState({
        name: "",
        mobile: "",
        email: ""
    });


    const [dpDetails, setDpDetails] = useState({
        type: "",
        id: "",
        name: "",
        dpCopy: null,
        // cmlCopy: null
    });
    const [partner, setPartner] = useState({
        partnerId: "",
        partnerName: "",
        partnerPhone: "",
        partnerUserId: ""
    });



    // Fetch from localStorage
    useEffect(() => {
        setEmployee({
            userName: localStorage.getItem("username") || "",
            phone: localStorage.getItem("phone") || "",
            employeeId: localStorage.getItem("employee_id") || "",
            userId: localStorage.getItem("user_id")
        });

        const storedRole = localStorage.getItem("role");
        setRole(storedRole);

        const token = localStorage.getItem("token");
        setToken(token)
        fetchPartners(token)
    }, []);

   
    

    const handleCreateTransaction = async () => {
        if (
            !trade.transactionType ||
            !trade.quantity ||
            !trade.clientPrice ||
            !trade.ourPrice ||
            !client.name.trim() ||
            !client.mobile.trim() ||
            !client.email.trim() ||
            !dpDetails.type ||
            !dpDetails.id.trim() ||
            !dpDetails.name.trim() ||
            !dpDetails.dpCopy 
            // !dpDetails.cmlCopy
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields before submitting.',
            });
            return;
        }

        const formData = new FormData();
        formData.append("product", id);
        formData.append("transaction_type", trade.transactionType);
        formData.append("client_price", trade.clientPrice);
        formData.append("our_price", trade.ourPrice);
        formData.append("quantity", trade.quantity);
        formData.append("client_name", client.name);
        formData.append("mobile", client.mobile);
        formData.append("email", client.email);
        formData.append("dp_name", dpDetails.name);
        formData.append("dp_choice", dpDetails.type);
        formData.append("dp_id", dpDetails.id);

        if (dpDetails.dpCopy) {
            formData.append("dp_copy", dpDetails.dpCopy);
        }

        // if (dpDetails.cmlCopy) {
        //     formData.append("cml_copy", dpDetails.cmlCopy);
        // }

        if (isPartner) {
            formData.append("owner", partner.partnerUserId)
        } else {
            formData.append("owner", employee.userId)
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(`${apiUrl}transactions/`, formData, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200 && response.data.statuscode === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.data.message || 'Transaction completed successfully.',
                });

                // Clear fields
                setTrade({
                    transactionType: "",
                    quantity: "",
                    clientPrice: "",
                    ourPrice: price // or ""
                });

                setClient({
                    name: "",
                    mobile: "",
                    email: ""
                });

                setDpDetails({
                    type: "",
                    id: "",
                    name: "",
                    dpCopy: null,
                    cmlCopy: null
                });
                navigate("/unlisted")
                setSelectedFileName('');
            } else {
                // Handle unexpected success responses that don't meet expected conditions
                Swal.fire({
                    icon: 'error',
                    title: 'Unexpected Response',
                    text: 'Something went wrong. Please try again.',
                });
            }
        } catch (error) {
            console.error('Transaction add Error:', error.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || error.response?.data?.detail || 'Something went wrong.',
            });
        }

    };


    const handleTradeChange = (e) => {
        setTrade({ ...trade, [e.target.name]: e.target.value });
    };

    const handleClientChange = (e) => {
        setClient({ ...client, [e.target.name]: e.target.value });
    };

    const handleDPChange = (e) => {
        const { name, value, files } = e.target;
        setDpDetails({
            ...dpDetails,
            [name]: files ? files[0] : value
        });
    };

    // fetch Partners

    const fetchPartners = async (token) => {


        try {
            const response = await axios.get(`${accountsUrl}partners/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })

            console.log("partners", response?.data?.data)
            setPartnersList(response?.data?.data)

        } catch (error) {
            console.log(error)

        }

    }





    return (
        <div className="container newtransaction">
            <div className='un-head'>
                <div className="header-logo">NT</div>
                <p className="un-title">New Transaction</p>
            </div>

            <div className="card">


                <div className="card-body">
                    {/* Employee Details */}
                    <div className='transaction-head'>
                        <div className="section-title"><i className="bi bi-person-badge"></i> Transaction Owned By</div>
                        {(role === "vittamoney" || role === "vittamoney_user") && (
                            <div className="toggle-switch" onClick={handleToggle}>
                                <div className={`slider ${isPartner ? 'partner' : 'self'}`}>
                                    {isPartner ? 'Partner' : 'Self'}
                                </div>
                                <div className="switch-labels">
                                    <span>Self</span>
                                    <span>Partner</span>
                                </div>
                            </div>
                        )}




                    </div>

                    <hr />
                    <div className="row mb-5">
                        {!isPartner ? (
                            <>
                                <div className="col-md-4">
                                    <label className='input-label'>Employee ID</label>
                                    <input className="form-control" value={employee.employeeId} readOnly />
                                </div>
                                <div className="col-md-4">
                                    <label className='input-label'>Employee Name</label>
                                    <input className="form-control" value={employee.userName} readOnly />
                                </div>
                                <div className="col-md-4">
                                    <label className='input-label'>Employee Phone</label>
                                    <input className="form-control" value={employee.phone} readOnly />
                                </div>
                            </>


                        ) : (
                            <>
                                <div className="col-md-4">
                                    <label className='input-label'>Partners Name </label>
                                    <select
                                        className="form-control"
                                        value={partner.partnerId}
                                        onChange={(e) => {
                                            const selectedPartnerId = e.target.value;
                                            const selectedPartner = partnersList.find(p => p.partner_id === selectedPartnerId);

                                            if (selectedPartner) {
                                                setPartner({
                                                    partnerId: selectedPartner.partner_id,
                                                    partnerName: selectedPartner.username,
                                                    partnerPhone: selectedPartner.phone,
                                                    partnerUserId: selectedPartner.id
                                                });
                                            } else {
                                                setPartner({
                                                    partnerId: "",
                                                    partnerName: "",
                                                    partnerPhone: ""
                                                });
                                            }
                                        }}
                                    >
                                        <option value="">Select Partner</option>
                                        {partnersList.map((partnerObj) => (
                                            <option key={partnerObj.partner_id} value={partnerObj.partner_id}>
                                                {partnerObj.username}
                                            </option>
                                        ))}
                                    </select>


                                </div>
                                <div className="col-md-4">
                                    <label className='input-label'>Partner ID</label>
                                    <input className="form-control" value={partner.partnerId} readOnly />

                                </div>
                                <div className="col-md-4">
                                    <label className='input-label'>Partners Phone</label>
                                    <input className="form-control" value={partner.partnerPhone} readOnly />

                                </div>

                            </>

                        )}


                    </div>

                    {/* Trade Details */}
                    <div className="section-title"><i className="bi bi-graph-up-arrow"></i> Trade Details</div>
                    <hr />
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className='input-label'>Product</label>
                            <input className="form-control" value={name} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label className='input-label'>Transaction Type</label>
                            <select className="form-control" name="transactionType" value={trade.transactionType} onChange={handleTradeChange}>
                                <option>Select type</option>
                                <option value='buy'>Buy</option>
                                <option value='sell'>Sell</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className='input-label'>Quantity</label>
                            <input className="form-control" name="quantity" type="number" value={trade.quantity} onChange={handleTradeChange} />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className='input-label'>Client Price (₹)</label>
                            <input className="form-control" name="clientPrice" value={trade.clientPrice} onChange={handleTradeChange} />
                        </div>
                        <div className="col-md-4">
                            <label className='input-label'>Our Price (₹)</label>
                            <input className="form-control" name="ourPrice" value={trade.ourPrice} onChange={handleTradeChange} />
                            <div className="note"><i className="bi bi-lightbulb"></i> Auto-filled from product selection. Click to edit for special offers.</div>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="section-title"><i className="bi bi-person-lines-fill"></i> Client Information</div>
                    <hr />
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className='input-label'>Client Name</label>
                            <input className="form-control" name="name" value={client.name} onChange={handleClientChange} />
                        </div>
                        <div className="col-md-4">
                            <label className='input-label'>Mobile Number</label>
                            <input className="form-control" name="mobile" value={client.mobile} onChange={handleClientChange} />
                        </div>
                        <div className="col-md-4">
                            <label className='input-label'>Email Address</label>
                            <input className="form-control" name="email" value={client.email} onChange={handleClientChange} />
                        </div>
                    </div>

                    {/* DP Details */}
                    <div className="section-title"><i className="bi bi-bank me-2"></i>  Depository Participant (DP) Details</div>
                    <hr />
                    <div className="mb-3">
                        <label className="input-label d-block mb-2">DP Type</label>
                        <div className="form-check form-check-inline">
                            <input type="radio" name="type" value="cdsl" onChange={handleDPChange} />
                            <label className="form-check-label">CDSL</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input type="radio" name="type" value="nsdl" onChange={handleDPChange} />
                            <label className="form-check-label">NSDL</label>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className='input-label'>DP ID</label>
                            <input className="form-control" name="id" value={dpDetails.id} onChange={handleDPChange} />
                        </div>
                        <div className="col-md-4">
                            <label className='input-label'>DP Name</label>
                            <input className="form-control" name="name" value={dpDetails.name} onChange={handleDPChange} />
                        </div>
                        <div className="col-md-4">
                            <label className='input-label'>DP Copy</label>
                            <input
                                type="file"
                                name="dpCopy"
                                id="dpCopy"
                                accept=".pdf,image/*"
                                style={{ display: "none" }}
                                onChange={handleDPChange}
                            />
                            <label htmlFor="dpCopy" className="upload-box form-control"><i className="bi bi-file-earmark-plus"></i> Click to upload DP copy</label>

                            {/* ✅ Show file name if selected */}
                            {dpDetails.dpCopy && (
                                <small className="text-success">📎 {dpDetails.dpCopy.name}</small>
                            )}
                        </div>

                        {/* <div className="col-md-4 mt-3">
                            <label className='input-label'>CML Copy</label>
                            <input
                                type="file"
                                name="cmlCopy"
                                id="cmlCopy"
                                accept=".pdf,image/*"
                                style={{ display: "none" }}
                                onChange={handleDPChange}
                            />
                            <label htmlFor="cmlCopy" className="upload-box form-control"><i className="bi bi-file-earmark-plus"></i> Click to upload CML copy</label>

                           
                            {dpDetails.cmlCopy && (
                                <small className="text-success">📎 {dpDetails.cmlCopy.name}</small>
                            )}
                        </div> */}

                    </div>

                    <hr />
                    <div className="button-grp">
                        <button type="button" className="btn-cancel">Cancel</button>
                        <button type="button" className="btn-create" onClick={handleCreateTransaction}>Create Transaction</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewTransaction;
