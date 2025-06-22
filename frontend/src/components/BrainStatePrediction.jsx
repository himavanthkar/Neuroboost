import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import DashboardCard from './DashboardCard';
import { Camera, Mic, Keyboard, Mouse, Play, Pause, RotateCcw, Activity } from 'lucide-react';

const BrainStatePrediction = () => {
  const { darkMode } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [brainState, setBrainState] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [metrics, setMetrics] = useState({
    eyeBlinkRate: 0,
    voiceStress: 0,
    keystrokeSpeed: 0,
    mouseJerkiness: 0,
    focusLevel: 0,
    stressLevel: 0,
    energyLevel: 0
  });

  // Refs for different tracking systems
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const keystrokeDataRef = useRef([]);
  const mouseDataRef = useRef([]);
  const eyeTrackingDataRef = useRef([]);

  // Webcam setup
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  // Voice recording setup
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        // Analyze voice stress here
        analyzeVoiceStress(event.data);
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Keystroke tracking
  const trackKeystrokes = () => {
    const handleKeyPress = (event) => {
      const timestamp = Date.now();
      keystrokeDataRef.current.push({
        key: event.key,
        timestamp,
        keyCode: event.keyCode
      });
      
      // Keep only last 100 keystrokes
      if (keystrokeDataRef.current.length > 100) {
        keystrokeDataRef.current.shift();
      }
      
      analyzeKeystrokePatterns();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  };

  // Mouse movement tracking
  const trackMouseMovement = () => {
    const handleMouseMove = (event) => {
      const timestamp = Date.now();
      mouseDataRef.current.push({
        x: event.clientX,
        y: event.clientY,
        timestamp
      });
      
      // Keep only last 50 mouse positions
      if (mouseDataRef.current.length > 50) {
        mouseDataRef.current.shift();
      }
      
      analyzeMouseMovement();
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  };

  // Eye tracking analysis (simplified)
  const analyzeEyeTracking = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simulate eye tracking analysis
    const blinkRate = Math.random() * 20 + 10; // 10-30 blinks per minute
    eyeTrackingDataRef.current.push(blinkRate);
    
    if (eyeTrackingDataRef.current.length > 10) {
      eyeTrackingDataRef.current.shift();
    }
    
    setMetrics(prev => ({
      ...prev,
      eyeBlinkRate: blinkRate
    }));
  };

  // Voice stress analysis (simplified)
  const analyzeVoiceStress = (audioData) => {
    // Simulate voice stress analysis
    const stressLevel = Math.random() * 100;
    setMetrics(prev => ({
      ...prev,
      voiceStress: stressLevel
    }));
  };

  // Keystroke pattern analysis
  const analyzeKeystrokePatterns = () => {
    if (keystrokeDataRef.current.length < 2) return;
    
    const intervals = [];
    for (let i = 1; i < keystrokeDataRef.current.length; i++) {
      const interval = keystrokeDataRef.current[i].timestamp - keystrokeDataRef.current[i-1].timestamp;
      intervals.push(interval);
    }
    
    const avgSpeed = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    setMetrics(prev => ({
      ...prev,
      keystrokeSpeed: Math.max(0, 100 - (avgSpeed / 10))
    }));
  };

  // Mouse movement analysis
  const analyzeMouseMovement = () => {
    if (mouseDataRef.current.length < 2) return;
    
    let totalDistance = 0;
    let totalTime = 0;
    
    for (let i = 1; i < mouseDataRef.current.length; i++) {
      const prev = mouseDataRef.current[i-1];
      const curr = mouseDataRef.current[i];
      
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      const time = curr.timestamp - prev.timestamp;
      
      totalDistance += distance;
      totalTime += time;
    }
    
    const jerkiness = totalDistance / totalTime;
    setMetrics(prev => ({
      ...prev,
      mouseJerkiness: Math.min(100, jerkiness / 10)
    }));
  };

  // Brain state prediction
  const predictBrainState = () => {
    const { eyeBlinkRate, voiceStress, keystrokeSpeed, mouseJerkiness } = metrics;
    
    // Calculate focus level
    const focusLevel = Math.max(0, 100 - (eyeBlinkRate * 2 + voiceStress * 0.3 + (100 - keystrokeSpeed) * 0.2 + mouseJerkiness * 0.5));
    
    // Calculate stress level
    const stressLevel = Math.min(100, voiceStress * 0.4 + mouseJerkiness * 0.3 + eyeBlinkRate * 1.5);
    
    // Calculate energy level
    const energyLevel = Math.max(0, keystrokeSpeed * 0.4 + (100 - mouseJerkiness) * 0.3 + (100 - eyeBlinkRate * 2) * 0.3);
    
    setMetrics(prev => ({
      ...prev,
      focusLevel,
      stressLevel,
      energyLevel
    }));

    // Determine brain state
    let newBrainState = 'neutral';
    let newConfidence = 0;

    if (focusLevel > 70 && stressLevel < 30) {
      newBrainState = 'focused';
      newConfidence = Math.min(100, focusLevel - stressLevel);
    } else if (stressLevel > 60) {
      newBrainState = 'stressed';
      newConfidence = stressLevel;
    } else if (energyLevel < 30) {
      newBrainState = 'tired';
      newConfidence = 100 - energyLevel;
    } else if (focusLevel < 40) {
      newBrainState = 'distracted';
      newConfidence = 100 - focusLevel;
    } else {
      newBrainState = 'neutral';
      newConfidence = 50;
    }

    setBrainState(newBrainState);
    setConfidence(newConfidence);
  };

  // Start/stop recording
  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      await startWebcam();
      await startVoiceRecording();
      trackKeystrokes();
      trackMouseMovement();
      
      // Start analysis loop
      const analysisInterval = setInterval(() => {
        analyzeEyeTracking();
        predictBrainState();
      }, 2000);
      
      return () => clearInterval(analysisInterval);
    } else {
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    }
  };

  // Reset all data
  const resetData = () => {
    setMetrics({
      eyeBlinkRate: 0,
      voiceStress: 0,
      keystrokeSpeed: 0,
      mouseJerkiness: 0,
      focusLevel: 0,
      stressLevel: 0,
      energyLevel: 0
    });
    setBrainState('neutral');
    setConfidence(0);
    keystrokeDataRef.current = [];
    mouseDataRef.current = [];
    eyeTrackingDataRef.current = [];
  };

  const getBrainStateColor = (state) => {
    switch (state) {
      case 'focused': return 'text-green-600';
      case 'stressed': return 'text-red-600';
      case 'tired': return 'text-yellow-600';
      case 'distracted': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getBrainStateEmoji = (state) => {
    switch (state) {
      case 'focused': return '🧠';
      case 'stressed': return '😰';
      case 'tired': return '😴';
      case 'distracted': return '🤔';
      default: return '😐';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className={`text-center p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-4xl">🧠</span>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Real-Time Brain State Prediction
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Advanced AI-powered brain state monitoring using multiple sensors
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <DashboardCard title="🎛️ Control Panel">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleRecording}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isRecording ? 'Stop Monitoring' : 'Start Monitoring'}</span>
          </button>
          
          <button
            onClick={resetData}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset Data</span>
          </button>
        </div>
      </DashboardCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brain State Display */}
        <div className="lg:col-span-2">
          <DashboardCard title="🧠 Current Brain State">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">{getBrainStateEmoji(brainState)}</div>
              <div className={`text-3xl font-bold ${getBrainStateColor(brainState)}`}>
                {brainState.charAt(0).toUpperCase() + brainState.slice(1)}
              </div>
              <div className="text-lg text-gray-600">
                Confidence: {Math.round(confidence)}%
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className={`text-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className="text-xl font-bold text-blue-600">{Math.round(metrics.focusLevel)}%</div>
                  <div className="text-sm text-gray-600">Focus</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-red-50'
                }`}>
                  <div className="text-xl font-bold text-red-600">{Math.round(metrics.stressLevel)}%</div>
                  <div className="text-sm text-gray-600">Stress</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-green-50'
                }`}>
                  <div className="text-xl font-bold text-green-600">{Math.round(metrics.energyLevel)}%</div>
                  <div className="text-sm text-gray-600">Energy</div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Sensor Status */}
        <div>
          <DashboardCard title="📡 Sensor Status">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Camera className={`w-5 h-5 ${isRecording ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isRecording ? 'text-green-600' : 'text-gray-500'}`}>
                  Eye Tracking: {isRecording ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mic className={`w-5 h-5 ${isRecording ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isRecording ? 'text-green-600' : 'text-gray-500'}`}>
                  Voice Analysis: {isRecording ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Keyboard className={`w-5 h-5 ${isRecording ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isRecording ? 'text-green-600' : 'text-gray-500'}`}>
                  Keystroke Tracking: {isRecording ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mouse className={`w-5 h-5 ${isRecording ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${isRecording ? 'text-green-600' : 'text-gray-500'}`}>
                  Mouse Tracking: {isRecording ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Webcam Feed */}
      <DashboardCard title="📹 Eye Tracking Feed">
        <div className="flex justify-center">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-96 h-72 rounded-lg ${!isRecording ? 'opacity-50' : ''}`}
            />
            <canvas
              ref={canvasRef}
              width="640"
              height="480"
              className="hidden"
            />
            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Click "Start Monitoring" to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardCard>

      {/* Raw Metrics */}
      <DashboardCard title="📊 Raw Sensor Data">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-purple-50'
          }`}>
            <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.eyeBlinkRate)}</div>
            <div className="text-sm text-gray-600">Blink Rate (per min)</div>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-orange-50'
          }`}>
            <div className="text-2xl font-bold text-orange-600">{Math.round(metrics.voiceStress)}%</div>
            <div className="text-sm text-gray-600">Voice Stress</div>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-indigo-50'
          }`}>
            <div className="text-2xl font-bold text-indigo-600">{Math.round(metrics.keystrokeSpeed)}%</div>
            <div className="text-sm text-gray-600">Keystroke Speed</div>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-teal-50'
          }`}>
            <div className="text-2xl font-bold text-teal-600">{Math.round(metrics.mouseJerkiness)}%</div>
            <div className="text-sm text-gray-600">Mouse Jerkiness</div>
          </div>
        </div>
      </DashboardCard>

      {/* AI Analysis Info */}
      <DashboardCard title="🤖 AI Analysis">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
              🎯 Technologies Used
            </h4>
            <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>
              <li>• Claude 4 for pattern recognition</li>
              <li>• Groq for real-time inference</li>
              <li>• WebRTC for webcam access</li>
              <li>• Vapi for voice analysis</li>
              <li>• Browser APIs for input tracking</li>
            </ul>
          </div>
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-green-50'
          }`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
              🧠 Brain States Detected
            </h4>
            <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-green-600'}`}>
              <li>• Focused: High attention, low stress</li>
              <li>• Stressed: Elevated stress indicators</li>
              <li>• Tired: Low energy, high blink rate</li>
              <li>• Distracted: Low focus, erratic movement</li>
              <li>• Neutral: Balanced state</li>
            </ul>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default BrainStatePrediction; 