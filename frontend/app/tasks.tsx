import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useJob } from '../context/JobContext';
import { Button } from '../components/ui/Button';

export default function TasksScreen() {
    const router = useRouter();
    const { tasks, assessments, setAssessment } = useJob();
    const [currentIndex, setCurrentIndex] = useState(0);

    // If no tasks, go back (could happen on refresh if persistence fails)
    useEffect(() => {
        if (tasks.length === 0) {
            router.replace('/');
        }
    }, [tasks]);

    // Auto-predict based on AI score if available and not yet set
    useEffect(() => {
        if (tasks.length > 0) {
            const currentTask = tasks[currentIndex];
            const hasPrediction = currentTask.predicted_score !== undefined;
            const notRated = assessments[currentTask.id] === undefined;

            if (hasPrediction && notRated) {
                // Pre-fill but don't auto-advance instantly, or maybe we do?
                // Let's set it but user can change it.
                setAssessment(currentTask.id, currentTask.predicted_score!);
            }
        }
    }, [currentIndex, tasks]);

    if (tasks.length === 0) return null;

    const currentTask = tasks[currentIndex];
    // Check if current has been rated
    const currentRating = assessments[currentTask.id];

    const handleRate = (score: number) => {
        setAssessment(currentTask.id, score);
        // Auto advance after short delay
        if (currentIndex < tasks.length - 1) {
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 200);
        }
    };

    const isFinished = Object.keys(assessments).length === tasks.length;
    const progress = ((currentIndex + 1) / tasks.length) * 100;

    const handleFinish = () => {
        if (!isFinished) {
            Alert.alert('Incomplete', 'Please rate all tasks before finishing.');
            return;
        }
        router.push('/result');
    }

    const RatingOption = ({ label, desc, color, value }: { label: string, desc: string, color: string, value: number }) => {
        const isSelected = currentRating === value;
        let borderClass = 'border-slate-100 bg-white';
        let dotClass = 'border-slate-300';

        if (isSelected) {
            if (value === 2) { borderClass = 'border-green-500 bg-green-50'; dotClass = 'bg-green-500 border-green-500'; }
            if (value === 1) { borderClass = 'border-yellow-500 bg-yellow-50'; dotClass = 'bg-yellow-500 border-yellow-500'; }
            if (value === 0) { borderClass = 'border-red-500 bg-red-50'; dotClass = 'bg-red-500 border-red-500'; }
        }

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleRate(value)}
                className={`p-5 rounded-2xl border-2 flex-row items-center mb-4 ${borderClass}`}
            >
                <View className={`w-6 h-6 rounded-full border-2 mr-4 ${dotClass}`} />
                <View>
                    <Text className="text-lg font-bold text-slate-800">{label}</Text>
                    <Text className="text-slate-500 text-sm">{desc}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View className="flex-1 bg-white">
            {/* Progress Bar */}
            <View className="h-2 bg-slate-100 w-full">
                <View
                    className="h-full bg-blue-600 rounded-r-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }} className="flex-1">
                <View className="flex-1 justify-center">
                    <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">
                        Task {currentIndex + 1} of {tasks.length}
                    </Text>
                    {currentTask.category && (
                        <View className="bg-slate-100 self-start px-3 py-1 rounded-full mb-4">
                            <Text className="text-slate-600 text-xs font-bold">{currentTask.category}</Text>
                        </View>
                    )}
                    <Text className="text-2xl font-bold text-slate-800 leading-9 mb-8 min-h-[100px]">
                        {currentTask.description}
                    </Text>

                    <View>
                        <RatingOption label="I can do this independently" desc="No hand-holding needed" color="green" value={2} />
                        <RatingOption label="I can do this with help" desc="Need guidance or Google" color="yellow" value={1} />
                        <RatingOption label="I cannot do this yet" desc="Need to learn from scratch" color="red" value={0} />
                    </View>
                </View>
            </ScrollView>

            <View className="p-6 border-t border-slate-100 bg-slate-50 flex-row justify-between">
                <TouchableOpacity
                    onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className={`p-4 ${currentIndex === 0 ? 'opacity-30' : ''}`}
                >
                    <Text className="text-slate-600 font-bold text-lg">Back</Text>
                </TouchableOpacity>

                {currentIndex === tasks.length - 1 ? (
                    <Button title="See Results" onPress={handleFinish} className="w-40" disabled={!isFinished} />
                ) : (
                    <TouchableOpacity
                        onPress={() => setCurrentIndex(Math.min(tasks.length - 1, currentIndex + 1))}
                        className="p-4"
                    >
                        <Text className="text-blue-600 font-bold text-lg">Skip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
