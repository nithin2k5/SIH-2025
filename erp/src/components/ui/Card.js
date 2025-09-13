export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  ...props 
}) {
  const variants = {
    default: 'card-modern bg-white border border-slate-200',
    elevated: 'card-modern bg-white border border-slate-200 shadow-lg',
    gradient: 'card-modern bg-gradient-to-br from-white to-slate-50 border border-slate-200',
    glass: 'glass-effect border border-white/20'
  };

  const hoverEffect = hover ? 'hover-lift' : '';

  return (
    <div
      className={`${variants[variant]} ${hoverEffect} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '',
  variant = 'default'
}) {
  const variants = {
    default: 'px-6 py-5 border-b border-slate-200',
    gradient: 'px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200',
    colored: 'px-6 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ 
  children, 
  className = '',
  padding = 'default'
}) {
  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  return (
    <div className={`${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '',
  variant = 'default'
}) {
  const variants = {
    default: 'px-6 py-4 border-t border-slate-200 bg-slate-50/50',
    clean: 'px-6 py-4 border-t border-slate-200',
    gradient: 'px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
