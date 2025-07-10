import React, { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'red';
  to?: string;
  external?: boolean;
  className?: string;
  showLock?: boolean;
}

const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = 'blue',
  to,
  external = false,
  className = '',
  showLock = false,
  ...props
}) => {
  const baseClasses = 'cyber-button flex items-center justify-center space-x-2 text-sm font-medium tracking-wider uppercase transition-all duration-300';
  const variantClasses = variant === 'red' ? 'cyber-button-red' : '';
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  const content = (
    <>
      {children}
      {showLock && <Lock className="w-4 h-4 ml-2" />}
    </>
  );

  if (to && external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={combinedClasses}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
};

export default CyberButton;