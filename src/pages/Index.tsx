
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { AIQueryEngine } from '@/components/AIQueryEngine';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-edelivery-off-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-edelivery-gray py-3 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-edelivery-blue flex items-center justify-center mr-2">
              <MessageCircle size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-edelivery-dark-blue">
              e-delivery <span className="font-light">AI Agent</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm text-edelivery-blue underline" to="/order">Product Order</Link>
            <div className="text-sm text-edelivery-blue">
              Powered by MIGSO-PCUBED
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content - Chat container */}
      <main className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full p-4">
          <div className="bg-white rounded-xl shadow-sm border border-edelivery-gray flex-1 flex flex-col overflow-hidden">
            <AIQueryEngine />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-edelivery-gray py-2 px-4">
        <div className="max-w-6xl mx-auto text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} E-delivery AI Query Engine
        </div>
      </footer>
    </div>
  );
}

export default Index;
