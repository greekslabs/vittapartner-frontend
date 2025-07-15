import React, { useEffect, useState } from 'react'
import "./Dashboard.css"
import { Link } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {

    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL
    const [totalShare, setTotalShare] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [cancelledOrders, setCancelledOrders] = useState(0);
    useEffect(() => {
        const token = localStorage.getItem("token")
        fetchAllShare(token)
        fetchOrderBook(token)

    }, [])

    // fetch all unlisted shares
    const fetchAllShare = async (token) => {
        try {
            const response = await axios.get(`${apiUrl}product/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setTotalShare(response.data.data.length)

        } catch (error) {
            console.error("Error fetching shares:", error);
        }
    }

  
    const fetchOrderBook = async (token) => {
    try {
        const response = await axios.get(`${apiUrl}transactions/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = response?.data?.data?.transactions;

        let completed = [];
        let pending = [];
        let cancelled = [];

        if (Array.isArray(data)) {
            if ('transactions' in data[0]) {
                // Grouped structure (e.g., for admin/accountant roles)
                completed = data.flatMap(user => user.transactions.filter(tx => tx.status === "completed"));
                pending = data.flatMap(user => user.transactions.filter(tx => tx.status === "pending"));
                cancelled = data.flatMap(user => user.transactions.filter(tx => tx.status === "cancelled"));
            } else {
                // Flat structure (e.g., for partner)
                completed = data.filter(tx => tx.status === "completed");
                pending = data.filter(tx => tx.status === "pending");
                cancelled = data.filter(tx => tx.status === "cancelled");
            }
        }

        setCompletedOrders(completed.length);
        setPendingOrders(pending.length);
        setCancelledOrders(cancelled.length);


    } catch (error) {
        console.error("Error fetching order book:", error);
    }
};

    return (
        <div className="dashboard">
            <main className="main-content">
            
                 <div className='d-main-head'>
                    <div className='d-head'>
                        <div className="header-logo">D</div>
                        <p className="d-title">Dashboard</p>

                    </div>

                 </div>

                <div className="content-area">


                    <section className="stats-grid">
                        <div className="row">

                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                                <Link to="/unlisted" className='dashboard-link'>
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div>
                                                <div className="stat-title">Total Unlisted Shares</div>
                                            </div>
                                            <div className="stat-icon shares"><i className="bi bi-graph-up"></i></div>
                                        </div>
                                        <div className="stat-value">{totalShare}</div>
                                        {/* <div className="stat-description">
                                            <span className="stat-trend positive">↗ +8.2%</span>
                                            vs. last period
                                        </div> */}
                                    </div>
                                </Link>

                            </div>

                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                                <div className="stat-card">
                                    <div className="stat-header">
                                        <div>
                                            <div className="stat-title">Completed Orders</div>
                                        </div>
                                        <div className="stat-icon completed"><i className="bi bi-check-lg"></i></div>
                                    </div>
                                    <div className="stat-value">{completedOrders}</div>
                                  
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                                <div className="stat-card">
                                    <div className="stat-header">
                                        <div>
                                            <div className="stat-title">Pending Orders</div>
                                        </div>
                                        <div className="stat-icon pending"><i className="bi bi-hourglass-split"></i></div>
                                    </div>
                                    <div className="stat-value">{pendingOrders}</div>
                                   
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                                <div className="stat-card">
                                    <div className="stat-header">
                                        <div>
                                            <div className="stat-title">Cancelled orders</div>
                                        </div>
                                        <div className="stat-icon orders"><i className="bi bi-x"></i></div>
                                    </div>
                                    <div className="stat-value">{cancelledOrders}</div>
                                   
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default Dashboard

