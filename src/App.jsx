import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './Components/pages/Dashboard/Dashboard';
import Header from './Components/Header/Header';
import Sidebar from './Components/Sidebar/sidebar';
import Login from './Components/Login/Login';
import Unlistedshare from './Components/pages/UnlistedShares/Unlistedshare';
import AddUsers from './Components/pages/AddUsers/AddUsers';
import { useEffect, useState } from 'react';
import Signup from './Components/Login/Signup';
import NewTransaction from './Components/pages/NewTransaction/NewTransaction';
import AddProducts from './Components/pages/AddProducts/AddProducts';
import CompletedOrder from './Components/pages/CompletedOrder/CompletedOrder';
import OrderBook from './Components/pages/OrderBook/OrderBook';
import CancelledOrder from './Components/pages/CancelledOrder/CancelledOrder';
import Ledger from './Components/pages/Ledger/Ledger';
import MasterLedger from './Components/pages/MasterLedger/MasterLedger';
import Payment from './Components/pages/Payment/Payment';

function AppLayout() {
    const location = useLocation();

    const isLoginPage = location.pathname === '/login';
    const [role, setRole] = useState("");
    const [token, setToken] = useState("")

    useEffect(() => {
        const storedRole = localStorage.getItem("role")
        setRole(storedRole)
        const Token = localStorage.getItem("token")
        setToken(Token)
        console.log('sa0', Token)

    }, [])

    return (
        <div className="dashboard">
            {token && (
                <>
                    {!isLoginPage && <Sidebar />}
                </>
            )}

            <main className="main-content">
                {token && (
                    <>
                        {!isLoginPage && <Header />}
                    </>
                )}

                <Routes>
                    {token && (
                        <>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/unlisted" element={<Unlistedshare />} />
                            {(role === "vittamoney" || role === "vittamoney_user") && (
                                <Route path="/addusers" element={<AddUsers />} />
                            )}
                            <Route path="/transactions/:name/:price/:id" element={<NewTransaction />} />
                            <Route path="/order-book" element={<OrderBook />} />
                            <Route path="/add-products" element={<AddProducts />} />
                            <Route path="/completed-orders" element={<CompletedOrder />} />
                            <Route path="/cancelled-order" element={<CancelledOrder/>} />
                            <Route path="/ledger" element={<Ledger/>} />
                            <Route path="/payment" element={<Payment/>} />
                            <Route path="/master-ledger" element={<MasterLedger/>} />

                        </>
                    )}



                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;
