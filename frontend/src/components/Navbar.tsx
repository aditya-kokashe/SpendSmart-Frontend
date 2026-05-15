import React from 'react';

interface NavbarProps {
  title: string;
  children?: React.ReactNode;
}

export default function Navbar({ title, children }: NavbarProps) {
  const hasActions = Boolean(children && React.Children.count(children) > 0);
  
  return (
    <header className={`navbar ${hasActions ? 'has-actions' : ''}`}>
      <h1>{title}</h1>
      {hasActions && <div className="navbar-actions">{children}</div>}
    </header>
  );
}
