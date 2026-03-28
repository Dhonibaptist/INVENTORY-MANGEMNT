import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-slide-up`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
