import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="mb-6 sm:mb-8 animate-fadeInDown animation-delay-200">
      <img 
        src="https://i.imgur.com/QJxTIcN.png" 
        alt="Blue Drops Logo"
        className="h-8 w-auto"
      />
    </header>
  );
};