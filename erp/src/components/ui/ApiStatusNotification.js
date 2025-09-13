import { useState, useEffect } from 'react';
import { AlertTriangle, X, Wifi, WifiOff } from 'lucide-react';

export default function ApiStatusNotification({ isConnected = true, error = null, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isConnected || error) {
      setIsVisible(true);
    }
  }, [isConnected, error]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg shadow-lg p-4 ${
        isConnected 
          ? 'bg-yellow-50 border border-yellow-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isConnected ? (
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              isConnected ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {isConnected ? 'Using Mock Data' : 'API Connection Failed'}
            </h3>
            <p className={`mt-1 text-sm ${
              isConnected ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {error || 'Unable to connect to the backend API. Displaying demo data instead.'}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className={`rounded-md inline-flex ${
                isConnected 
                  ? 'text-yellow-400 hover:text-yellow-600' 
                  : 'text-red-400 hover:text-red-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isConnected ? 'focus:ring-yellow-500' : 'focus:ring-red-500'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
