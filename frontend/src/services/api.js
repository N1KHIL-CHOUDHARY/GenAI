const API_BASE_URL = 'http://localhost:8000';
const API_TIMEOUT = 10000;

const createRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const config = {
        ...options,
        signal: controller.signal,
        headers: {
            ...options.headers,
        },
    };

    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
    } else if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
        config.headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `HTTP error! Status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
            } catch {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { success: true, data: null };
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            return { success: false, error: 'Request timed out. Please try again.' };
        }
        return { success: false, error: error.message || 'An unexpected network error occurred.' };
    }
};

const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

const handleAuthSuccess = (result) => {
    if (!result.success) {
        return { success: false, error: result.error || 'Authentication failed.' };
    }
    const { user } = result.data;
    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=193A83&color=fff`,
        token: `token_${user.id}`,
    };
    localStorage.setItem('authToken', userData.token);
    return { success: true, data: userData };
};

export const authService = {
    login: async (email, password) => {
        const result = await createRequest('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
        return handleAuthSuccess(result);
    },

    signup: async (name, email, password) => {
        const result = await createRequest('/auth/register', {
            method: 'POST',
            body: { name, email, password },
        });
        return handleAuthSuccess(result);
    },

    loginWithGoogle: async () => {
        await simulateDelay(1500);
        const userData = {
            id: Date.now(),
            name: 'Google User',
            email: 'user@gmail.com',
            avatar: 'https://ui-avatars.com/api/?name=Google+User&background=193A83&color=fff',
            token: `google_token_${Date.now()}`,
        };
        localStorage.setItem('authToken', userData.token);
        return { success: true, data: userData };
    },

    logout: async () => {
        await simulateDelay(500);
        localStorage.removeItem('authToken');
        return { success: true };
    },

    verifyToken: async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return { success: false, error: 'No token found' };
        }
        await simulateDelay(500);
        return { success: true, data: { valid: true } };
    },

    refreshToken: async () => {
        await simulateDelay(500);
        const newToken = `refreshed_token_${Date.now()}`;
        localStorage.setItem('authToken', newToken);
        return { success: true, data: { token: newToken } };
    },
};

export const fileService = {
    uploadFile: async (file, userId) => {
        if (!file) return { success: false, error: 'No file provided.' };
        if (file.type !== 'application/pdf') return { success: false, error: 'Only PDF files are allowed.' };
        if (file.size > 10 * 1024 * 1024) return { success: false, error: 'File size must be less than 10MB.' };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);

        const result = await createRequest('/documents/upload', {
            method: 'POST',
            body: formData,
        });

        if (!result.success) {
            return { success: false, error: result.error || 'Upload failed.' };
        }
        const fileData = {
            id: result.data.doc_id,
            name: result.data.meta.filename || file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            status: 'uploaded',
            analysisId: result.data.doc_id,
            summary: result.data.summary,
        };
        return { success: true, data: fileData };
    },

    getAnalysisStatus: async (fileId) => {
        await simulateDelay(500);
        const statuses = ['uploaded', 'processing', 'analyzing', 'completed', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        return {
            success: true,
            data: {
                fileId,
                status: randomStatus,
                progress: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 90),
            },
        };
    },

    getAnalysisResults: async (fileId) => {
        await simulateDelay(1000);
        const results = {
            fileId,
            summary: "This is a mock summary generated by the AI after analyzing your document. It highlights the main arguments, identifies key entities, and provides a concise overview of the content to help you quickly grasp the core information without reading the entire file.",
            keyPoints: [
                "Key point 1: Important information extracted from the document",
                "Key point 2: Another significant finding",
                "Key point 3: Additional insights from the analysis",
            ],
            entities: [
                { name: "Entity 1", type: "Person", confidence: 0.95 },
                { name: "Entity 2", type: "Organization", confidence: 0.87 },
                { name: "Entity 3", type: "Location", confidence: 0.92 },
            ],
            sentiment: "positive",
            confidence: 0.88,
            createdAt: new Date().toISOString(),
        };
        return { success: true, data: results };
    },

    getUserFiles: async (userId) => {
        const result = await createRequest(`/documents/user/${userId}`);

        if (!result.success) {
            return { success: false, error: result.error || 'Failed to fetch files.' };
        }
        const files = result.data.documents.map(doc => ({
            id: doc.doc_id,
            name: doc.doc_name,
            size: 0,
            uploadDate: doc.upload_date,
            status: "completed",
            analysisId: doc.doc_id,
            summary: doc.summary,
        }));
        return { success: true, data: files };
    },

    deleteFile: async (fileId) => {
        await simulateDelay(500);
        return { success: true, data: { fileId, deleted: true } };
    },
};

export const documentService = {
    getSummary: async (documentId) => {
        const result = await createRequest(`/analysis/${documentId}`);

        if (!result.success) {
            return { success: false, error: result.error || 'Failed to fetch summary.' };
        }
        const summary = {
            id: documentId,
            title: "Document Summary",
            content: result.data,
            wordCount: result.data.length,
            createdAt: new Date().toISOString(),
        };
        return { success: true, data: summary };
    },

    chatWithDocument: async (userId, message) => {
        const result = await createRequest('/chat/user', {
            method: 'POST',
            body: {
                user_id: userId,
                query: message,
            },
        });

        if (!result.success) {
            return { success: false, error: result.error || 'Failed to get response.' };
        }
        const response = {
            id: Date.now(),
            userId,
            userMessage: message,
            aiResponse: result.data.response,
            timestamp: new Date().toISOString(),
            confidence: 0.85,
        };
        return { success: true, data: response };
    },
};

export const userService = {
    getProfile: async () => {
        await simulateDelay(500);
        const profile = {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            avatar: "https://ui-avatars.com/api/?name=John+Doe&background=193A83&color=fff",
            joinDate: "2024-01-01T00:00:00Z",
            totalFiles: 5,
            totalAnalysis: 12,
        };
        return { success: true, data: profile };
    },

    updateProfile: async (profileData) => {
        await simulateDelay(1000);
        return { success: true, data: { ...profileData, updatedAt: new Date().toISOString() } };
    },
};

export const contactService = {
    sendMessage: async (messageData) => {
        await simulateDelay(1500);
        if (!messageData.name || !messageData.email || !messageData.message) {
            return { success: false, error: 'All fields are required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageData.email)) {
            return { success: false, error: 'Please enter a valid email address' };
        }
        const emailData = {
            id: Date.now(),
            to: 'aeztrix5@gmail.com',
            from: messageData.email,
            name: messageData.name,
            message: messageData.message,
            timestamp: new Date().toISOString(),
            status: 'sent',
            subject: `New Contact Form Submission from ${messageData.name}`,
        };
        console.log('📧 Contact form submission received:', emailData);
        return { success: true, data: emailData };
    },

    getMessages: async () => {
        await simulateDelay(800);
        const messages = [{
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            message: "Great service! I love using Aeztrix AI for document analysis.",
            timestamp: "2024-01-15T10:30:00Z",
            status: "read",
        }, {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            message: "How can I integrate this with my existing workflow?",
            timestamp: "2024-01-14T15:45:00Z",
            status: "unread",
        }, ];
        return { success: true, data: messages };
    },
};

export default {
    authService,
    fileService,
    documentService,
    userService,
    contactService,
};