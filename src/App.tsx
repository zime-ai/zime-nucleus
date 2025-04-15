import React, { useState } from 'react';
import { MeetingUploader } from './components/MeetingUploader';
import { TranscriptUpdater } from './components/TranscriptUpdater';
import { SpeakerNameUpdater } from './components/SpeakerNameUpdater';
import { Upload, FileText, Users } from 'lucide-react';
import logo from './assets/zime-logo.png';

type Section = 'meeting' | 'transcript' | 'speaker';

function App() {
  const [currentSection, setCurrentSection] = useState<Section>('meeting');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b flex flex-col items-center">
          <img 
            src={logo}
            alt="Zime" 
            className="h-6 w-auto"
          />
          <span className="mt-2 italic text-[#6f3096] text-2xl font-bold">Nucleus</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-6">
          <button
            onClick={() => setCurrentSection('meeting')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              currentSection === 'meeting'
                ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Upload size={20} />
            <span>Meeting Uploader</span>
          </button>

          <button
            onClick={() => setCurrentSection('transcript')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              currentSection === 'transcript'
                ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText size={20} />
            <span>Transcript Updater</span>
          </button>

          <button
            onClick={() => setCurrentSection('speaker')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              currentSection === 'speaker'
                ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            <span>Speaker Name Updater</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentSection === 'meeting' && <MeetingUploader />}
        {currentSection === 'transcript' && <TranscriptUpdater />}
        {currentSection === 'speaker' && <SpeakerNameUpdater />}
      </div>
    </div>
  );
}

export default App;