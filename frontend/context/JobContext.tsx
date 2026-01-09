import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, AssessmentItem } from '../types';

interface JobContextType {
    jobId: string | null;
    tasks: Task[];
    assessments: { [taskId: string]: number };
    setJobData: (id: string, tasks: Task[]) => void;
    setAssessment: (taskId: string, score: number) => void;
    clearJob: () => void;
    isLoading: boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [jobId, setJobId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [assessments, setAssessments] = useState<{ [taskId: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load state on startup
    useEffect(() => {
        const loadState = async () => {
            try {
                const storedJobId = await AsyncStorage.getItem('job_id');
                const storedTasks = await AsyncStorage.getItem('tasks');
                const storedAssessments = await AsyncStorage.getItem('assessments');

                if (storedJobId) setJobId(storedJobId);
                if (storedTasks) setTasks(JSON.parse(storedTasks));
                if (storedAssessments) setAssessments(JSON.parse(storedAssessments));
            } catch (e) {
                console.error("Failed to load state", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadState();
    }, []);

    // Save state on change
    useEffect(() => {
        if (!isLoading) {
            if (jobId) AsyncStorage.setItem('job_id', jobId);
            else AsyncStorage.removeItem('job_id');

            if (tasks.length > 0) AsyncStorage.setItem('tasks', JSON.stringify(tasks));
            else AsyncStorage.removeItem('tasks');

            if (Object.keys(assessments).length > 0) AsyncStorage.setItem('assessments', JSON.stringify(assessments));
            else AsyncStorage.removeItem('assessments');
        }
    }, [jobId, tasks, assessments, isLoading]);

    const setJobData = (id: string, newTasks: Task[]) => {
        setJobId(id);
        setTasks(newTasks);
        setAssessments({}); // Clear old assessments for new job
    };

    const setAssessment = (taskId: string, score: number) => {
        setAssessments(prev => ({ ...prev, [taskId]: score }));
    };

    const clearJob = () => {
        setJobId(null);
        setTasks([]);
        setAssessments({});
        AsyncStorage.multiRemove(['job_id', 'tasks', 'assessments']);
    };

    return (
        <JobContext.Provider value={{ jobId, tasks, assessments, setJobData, setAssessment, clearJob, isLoading }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJob = () => {
    const context = useContext(JobContext);
    if (!context) throw new Error("useJob must be used within a JobProvider");
    return context;
};
