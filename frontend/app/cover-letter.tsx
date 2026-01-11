import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { generateCoverLetter } from '../services/api';
import { Button } from '../components/ui/Button';
import * as Clipboard from 'expo-clipboard';

export default function CoverLetterScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [letter, setLetter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.jobId) return;

        const fetchLetter = async () => {
            try {
                const strengths = params.strengths ? JSON.parse(params.strengths as string) : [];
                const gaps = params.gaps ? JSON.parse(params.gaps as string) : [];

                const text = await generateCoverLetter(params.jobId as string, strengths, gaps);
                setLetter(text);
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Failed to generate cover letter.");
            } finally {
                setLoading(false);
            }
        };

        fetchLetter();
    }, [params]);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(letter);
        Alert.alert("Copied!", "Cover letter copied to clipboard.");
    };

    const shareLetter = async () => {
        try {
            await Share.share({
                message: letter,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="px-6 pt-12 pb-4 border-b border-slate-100 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Text className="text-slate-500 font-bold">Close</Text>
                </TouchableOpacity>
                <Text className="font-bold text-lg text-slate-800">Your Cover Letter</Text>
                <View className="w-10" />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text className="mt-4 text-slate-500 font-medium">Writing your letter...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
                    <Text className="text-slate-700 text-base leading-7 font-medium">
                        {letter}
                    </Text>
                </ScrollView>
            )}

            {!loading && (
                <View className="p-6 border-t border-slate-100 bg-slate-50">
                    <View className="flex-row space-x-4 mb-3">
                        <Button title="Copy Text" onPress={copyToClipboard} variant="secondary" className="flex-1 mr-2" />
                        <Button title="Share" onPress={shareLetter} variant="outline" className="flex-1 ml-2" />
                    </View>
                </View>
            )}
        </View>
    );
}
