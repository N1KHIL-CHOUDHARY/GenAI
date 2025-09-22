import { useState, useCallback } from 'react';
import { fileService } from '../services/api';

export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const uploadFile = useCallback(async (file, userId) => { // Modified: Add userId parameter
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Call file service with userId
            const result = await fileService.uploadFile(file, userId); // Modified: Pass userId

            clearInterval(progressInterval);
            setProgress(100);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setUploading(false);
        }
    }, []);

    const resetUpload = useCallback(() => {
        setUploading(false);
        setProgress(0);
        setError(null);
    }, []);

    return {
        uploading,
        progress,
        error,
        uploadFile,
        resetUpload
    };
};