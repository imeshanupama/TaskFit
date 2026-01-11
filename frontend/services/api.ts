import axios from 'axios';
import { Platform } from 'react-native';
import { JobResponse, AssessmentResponse, AssessmentItem } from '../types';

// For physical device, use your machine's LAN IP
const BASE_URL = 'http://192.168.0.103:8000';
// const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
});

export const createJob = async (description: string, file?: any, cvFile?: any): Promise<JobResponse> => {
    const formData = new FormData();
    if (description) {
        formData.append('raw_description', description);
    }
    if (file) {
        const fileObj = {
            uri: file.uri,
            name: file.name || 'upload.pdf',
            type: file.mimeType || 'application/pdf',
        };
        // @ts-ignore
        formData.append('file', fileObj);
    }
    if (cvFile) {
        const cvObj = {
            uri: cvFile.uri,
            name: cvFile.name || 'cv.pdf',
            type: cvFile.mimeType || 'application/pdf',
        };
        // @ts-ignore
        formData.append('cv_file', cvObj);
    }

    const response = await api.post('/jobs/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return {
        job_id: response.data.job_id,
        tasks: response.data.tasks || []
    };
};

export const submitAssessments = async (jobId: string, assessments: AssessmentItem[]): Promise<AssessmentResponse> => {
    const response = await api.post('/assessments/', { job_id: jobId, assessments });
    return response.data;
};

export const generateCoverLetter = async (jobId: string, strengths: string[], gaps: string[]): Promise<string> => {
    const response = await api.post('/generator/cover-letter', {
        job_id: jobId,
        strengths,
        gaps
    });
    return response.data.cover_letter;
};
