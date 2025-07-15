import React, { useEffect, useState } from 'react';
import "./Header.css";
import { Link } from 'react-router-dom';

function Header() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [roleName, setRoleName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    const storedPhone = localStorage.getItem("phone");
    const storedUserId = localStorage.getItem("employee_id");
    setUserId(storedUserId)
    setPhone(storedPhone)
    setEmail(storedEmail)
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


         
          <div data-bs-toggle="modal" data-bs-target="#staticBackdrop">
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

          {/* edit profile */}


          <div
  className="modal fade"
  id="staticBackdrop"
  data-bs-backdrop="static"
  data-bs-keyboard="false"
  tabIndex="-1"
  aria-labelledby="staticBackdropLabel"
  aria-hidden="true"
>
  <div className="modal-dialog modal-dialog-centered">
    <div
      className="modal-content border-0 rounded-4 shadow-lg"
      style={{
        background: 'linear-gradient(to bottom right, #ffffff, #f1f3f5)',
        color: '#212529',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      {/* Close Button */}
      <div className="d-flex justify-content-end p-3">
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>

      {/* Modal Body */}
      <div className="modal-body pt-0 px-4 pb-4">
        {/* Avatar & Header */}
        <div className="text-center mb-4">
          <div
            className="user-avatar-profile mx-auto d-flex align-items-center justify-content-center shadow"
           
          >
            {username ? username[0].toUpperCase() : '?'}
          </div>
          <h5 className="mt-3 mb-1 fw-bold">{username}</h5>
          <span className="badge rounded-pill bg-gradient bg-success px-3 py-1">
            {roleName}
          </span>
        </div>

        <hr className="mb-4" />

        {/* Profile Info */}
        <div className="text-center">
          <p className="text-muted mb-2">
            <strong>User ID:</strong>{' '}
            <span className="text-dark">{userId}</span>
          </p>
          <p className="text-muted mb-2">
            <strong>Username:</strong>{' '}
            <span className="text-dark">{username}</span>
          </p>
          <p className="text-muted mb-2">
            <strong>Email:</strong>{' '}
            <span className="text-dark">{email}</span>
          </p>
          <p className="text-muted mb-0">
            <strong>Phone:</strong>{' '}
            <span className="text-dark">{phone}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>








        </div>
      </div>

    </header>
  );
}

export default Header;
