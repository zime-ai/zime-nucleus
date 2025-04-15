import React, { useState } from 'react';
import { MeetingUploader } from './components/MeetingUploader';
import { TranscriptUpdater } from './components/TranscriptUpdater';
import { SpeakerNameUpdater } from './components/SpeakerNameUpdater';

type Section = 'meeting' | 'transcript' | 'speaker';

function App() {
  const [currentSection, setCurrentSection] = useState<Section>('meeting');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://app.zime.ai/assets/zime-logo-with-text.png"
                alt="Zime" 
                className="h-8"
              />
            </div>
            <nav className="flex gap-4">
              <button
                onClick={() => setCurrentSection('meeting')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentSection === 'meeting'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                Meeting Uploader
              </button>
              <button
                onClick={() => setCurrentSection('transcript')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentSection === 'transcript'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                Transcript Updater
              </button>
              <button
                onClick={() => setCurrentSection('speaker')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentSection === 'speaker'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                Speaker Name Updater
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      {currentSection === 'meeting' && <MeetingUploader />}
      {currentSection === 'transcript' && <TranscriptUpdater />}
      {currentSection === 'speaker' && <SpeakerNameUpdater />}
    </div>
  );
}

export default App;