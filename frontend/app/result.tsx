import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useJob } from '../context/JobContext';
import { submitAssessments } from '../services/api';
import { AssessmentResponse } from '../types';
import { Button } from '../components/ui/Button';

export default function ResultScreen() {
    const router = useRouter();
    const { jobId, assessments, clearJob } = useJob();
    const [result, setResult] = useState<AssessmentResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!jobId || Object.keys(assessments).length === 0) {
            router.replace('/');
            return;
        }

        const fetchResults = async () => {
            try {
                const payload = Object.entries(assessments).map(([taskId, score]) => ({
                    task_id: taskId,
                    score
                }));
                const data = await submitAssessments(jobId, payload);
                setResult(data);
            } catch (err) {
                console.error(err);
                Alert.alert("Error", "Failed to calculate results");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const handleRestart = () => {
        clearJob();
        router.dismissAll();
        router.replace('/');
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-4 text-slate-500">Calculating your fit...</Text>
            </View>
        )
    }

    if (!result) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-500';
    }

    const getBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-blue-50 border-blue-200';
        if (score >= 40) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    }

    return (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
            <View className={`items-center justify-center p-8 rounded-[32px] border mb-8 ${getBgColor(result.fit_score)}`}>
                <Text className="text-slate-600 font-bold uppercase tracking-widest mb-2">Fit Score</Text>
                <Text className={`text-6xl font-black mb-2 ${getScoreColor(result.fit_score)}`}>
                    {Math.round(result.fit_score)}%
                </Text>
                <View className="bg-white px-4 py-2 rounded-full shadow-sm">
                    <Text className={`font-bold text-lg ${getScoreColor(result.fit_score)}`}>{result.category}</Text>
                </View>
            </View>

            {result.strengths.length > 0 && (
                <View className="mb-8">
                    <Text className="text-xl font-bold text-slate-800 mb-4">🔥 Your Strengths</Text>
                    {result.strengths.map((item, index) => (
                        <View key={index} className="flex-row mb-3 bg-green-50 p-4 rounded-xl border border-green-100">
                            <Text className="text-slate-800 flex-1 font-medium">{item}</Text>
                        </View>
                    ))}
                </View>
            )}

            {result.gaps.length > 0 && (
                <View className="mb-8">
                    <Text className="text-xl font-bold text-slate-800 mb-4">⚠️ Skill Gaps</Text>
                    {result.gaps.map((item, index) => (
                        <View key={index} className="flex-row mb-3 bg-red-50 p-4 rounded-xl border border-red-100">
                            <Text className="text-slate-800 flex-1 font-medium">{item}</Text>
                        </View>
                    ))}
                </View>
            )}

            <Button title="Analyze Another Job" onPress={handleRestart} variant="secondary" className="mb-10" />
        </ScrollView>
    )
}
