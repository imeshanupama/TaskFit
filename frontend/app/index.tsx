import { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { createJob } from '../services/api';
import { useJob } from '../context/JobContext';
import { Button } from '../components/ui/Button';

export default function Home() {
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [selectedCV, setSelectedCV] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setJobData } = useJob();

    const handlePickDocument = async (isCV: boolean = false) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            if (isCV) {
                setSelectedCV(result.assets[0]);
            } else {
                setSelectedFile(result.assets[0]);
                setDescription(''); // Clear text if file picked
            }
        } catch (err) {
            Alert.alert("Error", "Failed to pick file");
        }
    };

    const handleStart = async () => {
        if (!description.trim() && !selectedFile) {
            Alert.alert('Error', 'Please enter a description OR upload a JD file.');
            return;
        }

        setLoading(true);
        try {
            const job = await createJob(description, selectedFile, selectedCV);
            setJobData(job.job_id, job.tasks);
            router.push('/tasks');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to analyze job.');
        } finally {
            setLoading(false);
        }
    };

    const fillExample = () => {
        setDescription(`We are looking for a Senior Backend Engineer to join our team. 
    You will be responsible for designing and implementing scalable REST APIs using Python and FastAPI. 
    Experience with PostgreSQL and SQLAlchemy is required. 
    You should be comfortable with Docker and CI/CD pipelines. 
    Knowledge of React is a plus.`);
        setSelectedFile(null);
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
                <View className="mb-6">
                    <Text className="text-3xl font-bold text-slate-800 mb-2">Can you do the job?</Text>
                    <Text className="text-slate-500 text-base">
                        Paste a job description below or upload a file. AI will extract the core tasks.
                    </Text>
                </View>

                <View className="flex-1 mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-slate-700 font-semibold uppercase tracking-wider text-xs">Job Description</Text>
                        <TouchableOpacity onPress={fillExample}>
                            <Text className="text-blue-600 text-xs font-bold">Paste Example</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-base leading-6 text-slate-800 min-h-[150px]"
                        multiline
                        placeholder="Paste raw JD here..."
                        value={description}
                        onChangeText={(text) => { setDescription(text); setSelectedFile(null); }}
                        textAlignVertical="top"
                    />

                    <View className="items-center justify-center py-4">
                        <Text className="text-slate-400 font-bold mb-4">- OR Upload JD (PDF/DOCX) -</Text>

                        {selectedFile ? (
                            <View className="flex-row items-center bg-blue-50 p-3 rounded-lg border border-blue-200 w-full justify-between mb-4">
                                <Text className="text-blue-700 font-medium truncate flex-1 mr-2" numberOfLines={1}>
                                    📄 {selectedFile.name}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                    <Text className="text-red-500 font-bold ml-2">X</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Button
                                title="Upload JD File"
                                onPress={() => handlePickDocument(false)}
                                variant="secondary"
                                className="w-full mb-4"
                            />
                        )}

                        <Text className="text-slate-400 font-bold mb-4">- And/Or Auto-Fill from CV -</Text>

                        {selectedCV ? (
                            <View className="flex-row items-center bg-purple-50 p-3 rounded-lg border border-purple-200 w-full justify-between">
                                <Text className="text-purple-700 font-medium truncate flex-1 mr-2" numberOfLines={1}>
                                    👤 {selectedCV.name}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedCV(null)}>
                                    <Text className="text-red-500 font-bold ml-2">X</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Button
                                title="Upload Your CV (Optional)"
                                onPress={() => handlePickDocument(true)}
                                variant="outline"
                                className="w-full"
                            />
                        )}
                    </View>
                </View>

                <Button title="Analyze Job" onPress={handleStart} loading={loading} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
