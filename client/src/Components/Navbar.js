import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ children }) {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="brand">Contractor · Supplier</div>
                <div className="nav-links">
                    {children}
                    <NavLink to='/' exact={true}>Logout</NavLink>
                </div>
            </div>
        </nav>
    );
}
