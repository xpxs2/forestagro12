
'use client';

import { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState('signin');

  return (
    <div>
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-center font-medium ${activeTab === 'signin' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium ${activeTab === 'signup' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>
      <div className="p-4">
        {activeTab === 'signin' ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  );
}
