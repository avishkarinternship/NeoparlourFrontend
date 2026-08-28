import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';

export const InvoiceDownloadButton = ({ subscriptionId, token, className, children }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!subscriptionId) return;
    setDownloading(true);
    try {
      let response;
      if (token) {
        response = await axios.get(
          `https://uat.neoparlour.com/api/invoices/subscription/${subscriptionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }
        );
      } else {
        response = await axiosInstance.get(
          `/invoices/subscription/${subscriptionId}`,
          { responseType: 'blob' }
        );
      }

      // Create a Blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_SUB_ID_${subscriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Invoice Error:', error);
      alert('Failed to download invoice PDF');
    } finally {
      setDownloading(false);
    }
  };

  const defaultClassName = className || "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50";

  return (
    <button
      type="button"
      onClick={handleDownloadPDF}
      disabled={downloading}
      className={defaultClassName}
    >
      {downloading ? 'Generating PDF...' : (children || '📄 Download Subscription Invoice')}
    </button>
  );
};

export default InvoiceDownloadButton;
