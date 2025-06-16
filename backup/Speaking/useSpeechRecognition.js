// Web Speech API utility for IELTS Speaking test
import { useState, useEffect } from 'react';

const useSpeechRecognition = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
    } else {
      console.error('Speech recognition is not supported in this browser.');
      setIsSupported(false);
    }
  }, []);

  const startRecognition = (onResult, onError) => {
    if (!isSupported) {
      onError && onError('Speech recognition is not supported in this browser.');
      return null;
    }

    // Initialize the SpeechRecognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure the recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Set up event handlers
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      onResult && onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError && onError(`Error: ${event.error}`);
    };

    // Start the recognition
    try {
      recognition.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError && onError(`Failed to start speech recognition: ${error.message}`);
    }

    // Return the recognition object so it can be stopped later
    return recognition;
  };

  return {
    isSupported,
    startRecognition
  };
};

export default useSpeechRecognition;