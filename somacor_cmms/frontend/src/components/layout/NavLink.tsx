import React from 'react';

const NavLink = ({ icon, label, onClick }) => (
    <a 
        href="#" 
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }} 
        className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
    >
        {icon}
        <span className="ml-3">{label}</span>
    </a>
);

export default NavLink;