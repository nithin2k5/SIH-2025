export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) {
  const variants = {
    default: 'input-modern border-slate-300 focus:border-blue-500 focus:ring-blue-500',
    filled: 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
    ghost: 'border-transparent bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const inputClasses = `
    w-full rounded-lg border shadow-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-opacity-20
    disabled:opacity-50 disabled:cursor-not-allowed
    text-slate-900 placeholder:text-slate-400
    ${Icon ? 'pl-10' : ''}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
