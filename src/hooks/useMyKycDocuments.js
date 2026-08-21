import { useState, useEffect, useCallback } from 'react';
import kycOwnerService from '../services/kycOwnerService';

export const useMyKycDocuments = (salonId) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await kycOwnerService.getMyKycDocuments(salonId);
      const fetched = res.data?.content || res.data || [];
      if (Array.isArray(fetched)) {
        setDocuments(fetched);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.warn("Failed to fetch KYC documents:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch KYC documents');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const resubmitDocument = async (file, documentType, onProgress) => {
    await kycOwnerService.resubmitDocument(file, documentType, onProgress);
    await fetchDocuments(); // Refresh state after resubmission
  };

  return { documents, loading, error, refresh: fetchDocuments, resubmitDocument };
};

export default useMyKycDocuments;
