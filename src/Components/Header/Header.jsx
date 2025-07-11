import React, { useEffect, useState } from 'react';
import "./Header.css";
import { Link } from 'react-router-dom';

function Header() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [roleName, setRoleName] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");
    setRole(storedRole);
    setUsername(storedUsername || "");

  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  useEffect(() => {
    if (role === "vittamoney") {
      setRoleName("Admin")

    }
    else if (role === "vittamoney_user") {
      setRoleName("Employee")

    }
    else if (role === "accountant") {
      setRoleName("Accountant")

    }
    else if (role === "partner") {
      setRoleName("Partner")

    }

  })





  return (
    <header className="header">
      <div className='header-head'>
        <div className="header-left">
          <h1>Vittafin Partner Portal</h1>
          <p>Monitor your portfolio performance and track your earnings</p>
        </div>
        <div className="header-right">
          {(role === "vittamoney" || role === "vittamoney_user") && (
            <Link to="/addusers">
              <button className="timestamp">Users</button>
            </Link>
          )}

          <div className="timestamp">
            {new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>

          {/* <button className="notification-btn">
          🔔
          <span className="notification-badge">1</span>
        </button> */}
          <div>
            <div className='profile-main'>
              <div className="user-avatar">
                {username ? username[0].toUpperCase() : "?"}
              </div>
              <div className='profile-main-role'>{roleName}</div>
            </div>
          </div>



          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

    </header>
  );
}

export default Header;
