import React from 'react';

export const DemoWarningBanner: React.FC = () => {
  return (
    <div className="bg-yellow-50 border-b-4 border-yellow-400 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-yellow-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">
              <strong className="font-bold">LOCAL DEMO ONLY:</strong> This application runs entirely on your machine with a
              local Solana validator. Demo USDC tokens are mock SPL tokens with{' '}
              <strong className="font-bold">NO MONETARY VALUE</strong>. No mainnet or devnet connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
