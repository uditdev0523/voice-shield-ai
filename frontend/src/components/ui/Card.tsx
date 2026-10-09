import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, interactive, className = '', style, ...props }) => {
  return (
    <div
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, icon }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
