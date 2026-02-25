'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
          <h2 className="text-2xl font-black glow-text uppercase tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
