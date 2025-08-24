import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, ChevronLeft, ChevronRight, Plus, Mic, MicOff, Volume2, Phone, LogOut, Paperclip, FileText, Wand2, Search, BarChart3, Download, Zap, Settings } from 'lucide-react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import { useTheme } from '../contexts/ThemeContext'
import VoiceMode from './VoiceMode'
import FileUploadModal from './FileUploadModal'

const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isSidebarOpen,
  currentChatTitle,
  onToggleSidebar,
  user,
  onLogout,
  onExportChat,
  onShowAnalytics,
  onSearchMessages,
  onMessageReaction,
  onMessageBookmark,
  onMessageReply,
  onMessageLike,
  onMessageDislike,
  onRegenerateAnswer
}) => {
  const { currentTheme } = useTheme()
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isEnhancing, setIsEnhancing] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Stop all speech when component unmounts or when switching chats
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return
    onSendMessage(inputMessage.trim(), attachedFiles)
    setInputMessage('')
    setAttachedFiles([]) // Clear attached files after sending
  }

  const handleVoiceMessage = async (message) => {
    if (!message.trim() || isLoading) return
    return await onSendMessage(message.trim())
  }

  const handleFileUpload = (files) => {
    console.log('Files uploaded:', files)
    setAttachedFiles(prev => [...prev, ...files])
    setIsFileUploadOpen(false)
  }

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const enhancePrompt = async () => {
    if (!inputMessage.trim() || isEnhancing) return
    
    setIsEnhancing(true)
    try {
      // Create a temporary message for enhancement only
      const enhancementRequest = `Please enhance this prompt to make it more detailed, clear, and effective. Return only the enhanced prompt without any explanations or additional text: "${inputMessage.trim()}"`
      
      // Call AI directly without adding to chat
      const enhancedPrompt = await onSendMessage(enhancementRequest, [], true)
      
      if (enhancedPrompt && enhancedPrompt.trim()) {
        // Update the text area with the enhanced prompt
        setInputMessage(enhancedPrompt.trim())
      }
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      enhancePrompt()
    }
  }

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInputMessage(prev => prev + ' ' + transcript.trim())
          setIsListening(false)
          setIsRecording(false)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      setIsRecording(true)
    }
  }

  return (
    <div className={`flex flex-col h-screen transition-all duration-300 relative ${
      isSidebarOpen ? 'ml-0 md:ml-80' : 'ml-0'
    }`} style={{ height: '100vh' }}>
      
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between relative">
          {/* Left Side - Mobile Toggle */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="md:hidden w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center"
              title="Toggle sidebar"
            >
              <ChevronRight size={16} />
            </button>
            {/* Desktop spacer to balance layout */}
            <div className="hidden md:block w-32"></div>
          </div>
          
          {/* Centered Logo and Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-white">Gupsup AI</h1>
            </div>
          </div>
          
          {/* Right Side - Action Buttons and User Info */}
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onSearchMessages}
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
                title="Search messages (Ctrl+F)"
              >
                <Search size={16} />
              </button>
              <button
                onClick={onShowAnalytics}
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
                title="View analytics"
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={onExportChat}
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
                title="Export chat (Ctrl+E)"
              >
                <Download size={16} />
              </button>
            </div>
            
            <div className="hidden sm:block bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-300">
                Welcome, <span className="text-primary-500 font-medium">{user?.username}</span>
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-dark-950 min-h-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">What can I help with?</h2>
              <p className="text-gray-400 max-w-md">Ask me anything - from coding help to creative writing, I'm here to assist you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onReply={onMessageReply}
                  onBookmark={onMessageBookmark}
                  onReaction={onMessageReaction}
                  onMessageLike={onMessageLike}
                  onMessageDislike={onMessageDislike}
                  onRegenerateAnswer={onRegenerateAnswer}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-dark-900 border-t border-dark-700 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className={`flex flex-col space-y-3 rounded-xl px-4 py-4 border transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-dark-800/50 border-dark-600'
          }`}>
            {/* Top Row - Buttons and Input */}
            <div className="flex items-end space-x-3">
              {/* File Upload Button */}
              <button 
                onClick={() => setIsFileUploadOpen(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                title="Upload files"
              >
                <Paperclip size={18} />
              </button>
              
              {/* Input Field */}
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything... (Press Ctrl+Enter to enhance your prompt)"
                  className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none text-base"
                  rows="3"
                  style={{ minHeight: '60px', maxHeight: '200px' }}
                  disabled={isLoading}
                />
              </div>
              
              {/* Voice Input Button */}
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              
              {/* Voice Call Button */}
              <button
                onClick={() => setIsVoiceModeOpen(true)}
                disabled={isLoading}
                className="p-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-dark-700"
                title="Voice Call Mode"
              >
                <Phone size={18} />
              </button>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  inputMessage.trim() && !isLoading
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            
            {/* Bottom Row - Enhance Button and Character Count */}
            <div className="flex items-center justify-between">
              {/* Enhance Prompt Button */}
              <button
                onClick={enhancePrompt}
                disabled={!inputMessage.trim() || isLoading || isEnhancing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  inputMessage.trim() && !isLoading && !isEnhancing
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg'
                    : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                }`}
                title="Enhance your prompt with AI"
              >
                <Wand2 size={16} />
                <span className="text-sm font-medium">
                  {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
                </span>
              </button>
              
              {/* Character Count */}
              <div className="text-sm text-gray-400">
                {inputMessage.length} characters
              </div>
            </div>
          </div>
          
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mt-3 p-3 bg-dark-800 rounded-lg border border-dark-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Attached Files ({attachedFiles.length})</span>
                <button
                  onClick={() => setAttachedFiles([])}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 bg-dark-700 rounded">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-dark-600 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm text-white flex-1 truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachedFile(file.id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Recording Indicator */}
          {isRecording && (
            <div className="mt-3 p-3 rounded-xl border-2 border-red-500/30 bg-red-500/10">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-white font-medium">Listening...</span>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line, Ctrl+Enter to enhance prompt
          </p>
        </div>
      </div>
      
      {/* Voice Mode */}
      <VoiceMode 
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onSendMessage={handleVoiceMessage}
        isLoading={isLoading}
        currentTheme={currentTheme}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onFileUpload={handleFileUpload}
      />
    </div>
  )
}

export default ChatArea


