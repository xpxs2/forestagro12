
// app/components/Note.tsx
'use client';

import React from 'react';

interface NoteProps {
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

const Note: React.FC<NoteProps> = ({ type, title, message }) => {
  const baseClasses = 'p-4 rounded-lg shadow-md';
  const typeClasses = {
    warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700',
    error: 'bg-red-100 border-l-4 border-red-500 text-red-700',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <p className="font-bold">{title}</p>
      <p>{message}</p>
    </div>
  );
};

export default Note;
