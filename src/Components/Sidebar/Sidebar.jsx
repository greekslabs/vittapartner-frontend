import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useEffect, useState } from 'react';

function Sidebar() {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };
    const [role, setrole] = useState("");

    useEffect(() => {
        const role = localStorage.getItem("role");
        setrole(role)
    })
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div>
                        <img src="/assets/images/Vittafin-logo.png" className="logo-icon" alt="Logo" />
                    </div>
                    <span className="logo-text">VITTA MONEY</span>
                </div>
            </div>

            <nav>
                <ul className="nav-menu">
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <i className="bi bi-grid icon-color"></i> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/unlisted" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <i className="bi bi-graph-up icon-color"></i> Unlisted Shares
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/order-book" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <i className="bi bi-list icon-color"></i> Order Book
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/completed-orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <i className="bi bi-check-lg icon-color"></i> Completed Orders
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/cancelled-order" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <i className="bi bi-x icon-color"></i> Cancelled Orders
                        </NavLink>
                    </li>
                    <hr />
                    <li>
                        <NavLink to="/ledger" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <i className="bi bi-receipt icon-color"></i>    Ledger
                        </NavLink>
                    </li>
                    {(role === "vittamoney" || role === "accountant") && (
                        <>
                            <li>
                                <NavLink to="/master-ledger" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                    <i className="bi bi-journal-text icon-color"></i>
                                    Master Ledger
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/payment" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                   <i className="bi bi-currency-rupee icon-color"></i> Payment
                                </NavLink>
                            </li>
                        </>
                    )}



                </ul>
                <div className='logout-main'>
                    <button className="logout-btn-sidebar" onClick={handleLogout}>
                        Logout
                    </button>
                </div>


            </nav>

        </div>
    );
}

export default Sidebar;
