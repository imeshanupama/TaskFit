export interface Task {
    id: string;
    description: string;
    category?: string;
    predicted_score?: number;
}

export interface JobResponse {
    job_id: string;
    tasks: Task[];
}

export interface AssessmentItem {
    task_id: string;
    score: number;
}

export interface AssessmentResponse {
    fit_score: number;
    category: string;
    strengths: string[];
    gaps: string[];
}
