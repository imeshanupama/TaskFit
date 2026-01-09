import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import clsx from 'clsx';
import { styled } from 'nativewind';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    disabled?: boolean;
    className?: string;
}

export function Button({ onPress, title, variant = 'primary', loading, disabled, className }: ButtonProps) {
    const baseStyle = "p-4 rounded-xl items-center justify-center";
    const variants = {
        primary: "bg-blue-600 shadow-md shadow-blue-200",
        secondary: "bg-slate-100",
        outline: "border-2 border-slate-200 bg-white"
    };

    const textStyles = {
        primary: "text-white font-bold text-lg",
        secondary: "text-slate-900 font-bold text-lg",
        outline: "text-slate-700 font-bold text-lg"
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={clsx(baseStyle, variants[variant], (disabled || loading) && 'opacity-60', className)}
        >
            {loading ? <ActivityIndicator color={variant === 'primary' ? 'white' : '#475569'} /> : <Text className={textStyles[variant]}>{title}</Text>}
        </TouchableOpacity>
    );
}
