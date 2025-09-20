import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Brain, Heart, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const ADHDLanguageUnderstanding = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Simulated ADHD speech examples
  const exampleTranscripts = [
    "That email thing... doctor... insurance stuff... I need to... oh wait, what was I saying?",
    "I'm so worried about the meeting tomorrow. What if they think I'm not prepared? I hope I don't mess up.",
    "I have this project and it needs to be perfect but I keep getting distracted and now I'm behind and...",
    "The thing with the... you know... that appointment... and then there's the... oh right, the deadline!"
  ];

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Start audio level monitoring
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        await processAudio(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript('');
      setAnalysis(null);
      
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop audio analysis
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // For demo purposes, we'll use a simulated transcript
      // In production, this would send the audio to a speech-to-text service
      const simulatedTranscript = exampleTranscripts[Math.floor(Math.random() * exampleTranscripts.length)];
      setTranscript(simulatedTranscript);
      
      // Process with ADHD language understanding
      const response = await fetch('http://localhost:8002/adhd/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: simulatedTranscript,
          include_rsd_analysis: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze transcript');
      }
      
      const result = await response.json();
      setAnalysis(result);
      
    } catch (err) {
      setError('Failed to process audio. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const processTextInput = async (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8002/adhd/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: text,
          include_rsd_analysis: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }
      
      const result = await response.json();
      setAnalysis(result);
      setTranscript(text);
      
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      anxious: 'text-yellow-600 bg-yellow-100',
      frustrated: 'text-red-600 bg-red-100',
      overwhelmed: 'text-purple-600 bg-purple-100',
      excited: 'text-green-600 bg-green-100',
      focused: 'text-blue-600 bg-blue-100',
      neutral: 'text-gray-600 bg-gray-100'
    };
    return colors[emotion] || colors.neutral;
  };

  const getStressColor = (level) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[level] || colors.low;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">ADHD Language Understanding</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Advanced AI-powered understanding of fragmented thoughts, emotional context, and RSD detection
        </p>
      </div>

      {/* Recording Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Voice Input</span>
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={startRecording}
              disabled={isRecording || isProcessing}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRecording
                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isRecording ? 'Recording...' : 'Start Recording'}</span>
            </button>
            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <MicOff className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Level Visualization */}
        {isRecording && (
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-100"
                  style={{ width: `${(audioLevel / 255) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">Audio Level</span>
            </div>
          </div>
        )}

        {/* Text Input Alternative */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or type your thoughts directly:
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Try: 'That email thing... doctor... insurance stuff...'"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => processTextInput(transcript)}
              disabled={!transcript.trim() || isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Analyze Text
            </button>
            <button
              onClick={() => {
                const example = exampleTranscripts[Math.floor(Math.random() * exampleTranscripts.length)];
                setTranscript(example);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Try Example
            </button>
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">Processing with Claude 4...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Emotional State */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Emotional Analysis</span>
            </h3>
            
            {analysis.adhd_analysis?.emotional_state && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Primary Emotion</label>
                  <div className={`px-3 py-2 rounded-lg ${getEmotionColor(analysis.adhd_analysis.emotional_state.primary_emotion)}`}>
                    {analysis.adhd_analysis.emotional_state.primary_emotion}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Stress Level</label>
                  <div className={`px-3 py-2 rounded-lg ${getStressColor(analysis.adhd_analysis.emotional_state.stress_level)} bg-gray-100`}>
                    {analysis.adhd_analysis.emotional_state.stress_level}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Confidence</label>
                  <div className="px-3 py-2 rounded-lg bg-gray-100">
                    {Math.round(analysis.adhd_analysis.emotional_state.confidence * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* RSD Analysis */}
            {analysis.rsd_analysis && analysis.rsd_analysis.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">RSD Patterns Detected</h4>
                <div className="space-y-3">
                  {analysis.rsd_analysis.map((pattern, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="font-medium text-yellow-800 capitalize">
                            {pattern.pattern_type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-yellow-700">
                            {pattern.text_evidence}
                          </div>
                          <div className="text-sm text-yellow-600">
                            {pattern.recommendation}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            pattern.severity === 'severe' ? 'bg-red-100 text-red-800' :
                            pattern.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {pattern.severity}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(pattern.confidence * 100)}% confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Tasks */}
          {analysis.extracted_tasks && analysis.extracted_tasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Extracted Tasks</span>
              </h3>
              <div className="space-y-3">
                {analysis.extracted_tasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900">{task.task}</div>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>Priority: {task.priority}</span>
                          <span>Urgency: {task.urgency}</span>
                          <span>Type: {task.type}</span>
                        </div>
                        {task.emotional_context && (
                          <div className="text-sm text-gray-500">
                            Context: {task.emotional_context}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {Math.round(task.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADHD Patterns */}
          {analysis.adhd_analysis?.adhd_patterns && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span>ADHD Patterns</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fragmentation Level</label>
                    <div className="mt-1 px-3 py-2 bg-gray-100 rounded-lg">
                      {analysis.adhd_analysis.adhd_patterns.fragmentation_level}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Context Switches</label>
                    <div className="mt-1 space-y-1">
                      {analysis.adhd_analysis.adhd_patterns.context_switches.map((switch_item, index) => (
                        <div key={index} className="px-3 py-1 bg-blue-50 text-blue-800 rounded text-sm">
                          {switch_item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Executive Function Challenges</label>
                    <div className="mt-1 space-y-1">
                      {analysis.adhd_analysis.adhd_patterns.executive_function_challenges.map((challenge, index) => (
                        <div key={index} className="px-3 py-1 bg-orange-50 text-orange-800 rounded text-sm">
                          {challenge}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hyperfocus Indicators</label>
                    <div className="mt-1 space-y-1">
                      {analysis.adhd_analysis.adhd_patterns.hyperfocus_indicators.map((indicator, index) => (
                        <div key={index} className="px-3 py-1 bg-green-50 text-green-800 rounded text-sm">
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.adhd_analysis?.recommendations && analysis.adhd_analysis.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 ADHD-Friendly Recommendations</h3>
              <div className="space-y-3">
                {analysis.adhd_analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Support */}
          {analysis.emotional_support && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💝 Emotional Support</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{analysis.emotional_support}</p>
            </div>
          )}
        </div>
      )}

      {/* Feature Explanation */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 How ADHD Language Understanding Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900">Fragmented Thought Processing</h4>
                <p className="text-sm text-gray-600">Understands incomplete sentences and scattered ideas</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900">RSD Detection</h4>
                <p className="text-sm text-gray-600">Identifies rejection sensitivity and emotional patterns</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900">Task Extraction</h4>
                <p className="text-sm text-gray-600">Pulls structured tasks from scattered speech</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900">Emotional Support</h4>
                <p className="text-sm text-gray-600">Provides compassionate, ADHD-aware responses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADHDLanguageUnderstanding; 