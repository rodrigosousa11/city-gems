import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface WeatherComponentProps {
    loading: boolean;
    weatherDescription: string;
    temperature: number;
    humidity: number;
}

const renderWeatherIcon = (description: string): JSX.Element | null => {
    switch (description.toLowerCase()) {
        case 'clear sky':
            return <FontAwesome5 name="sun" size={24} color="yellow" />;
        case 'few clouds':
        case 'scattered clouds':
        case 'broken clouds':
        case 'overcast clouds':
            return <FontAwesome5 name="cloud" size={21} color="gray" />;
        case 'shower rain':
        case 'rain':
            return <FontAwesome5 name="cloud-showers-heavy" size={24} color="blue" />;
        case 'thunderstorm':
            return <FontAwesome5 name="bolt" size={24} color="purple" />;
        case 'snow':
            return <FontAwesome5 name="snowflake" size={24} color="white" />;
        case 'mist':
            return <FontAwesome5 name="smog" size={24} color="gray" />;
        default:
            return null;
    }
};

const renderWeather = (loading: boolean, weatherDescription: string, temperature: number, humidity: number): JSX.Element => {
    if (loading) {
        return <ActivityIndicator size="small" color="#000000" />;
    }
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}> 
            <Text style={{ fontSize: 18 }}>{renderWeatherIcon(weatherDescription)} {weatherDescription.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} | {temperature}ºC</Text> 
        </View>
    );
};

const WeatherComponent: React.FC<WeatherComponentProps> = ({ loading, weatherDescription, temperature, humidity }) => {
    return (
        <View>
            {renderWeather(loading, weatherDescription, temperature, humidity)}
        </View>
    );
};

export default WeatherComponent;
