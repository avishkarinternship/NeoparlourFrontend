import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Ticket, ArrowLeft } from 'lucide-react';
import CreateTicketModal from './CreateTicketModal';
import SEOFooter from '../common/SEOFooter';

const NewTicketPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate('/support');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans flex flex-col justify-between">
      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <CreateTicketModal
          isOpen={showModal}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </main>

      <SEOFooter />
    </div>
  );
};

export default NewTicketPage;
