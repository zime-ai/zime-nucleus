import { useState } from 'react';
import { MeetingUploader } from './components/MeetingUploader';
import { TranscriptUpdater } from './components/TranscriptUpdater';
import { SpeakerNameUpdater } from './components/SpeakerNameUpdater';
import { DurationUpdater } from './components/DurationUpdater';
import { Upload, FileText, Users, Clock } from 'lucide-react';
import logo from './assets/zime-logo.png';

type Section = 'meeting' | 'transcript' | 'speaker' | 'duration';

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
            className="h-8 w-auto"
          />
          <span className="mt-2 italic text-[#6f3096] text-2xl font-bold">Nucleus</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentSection('meeting')}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'meeting'
                  ? 'bg-orange-100 text-orange-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Upload size={20} />
              Upload Meeting
            </button>
            <button
              onClick={() => setCurrentSection('transcript')}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'transcript'
                  ? 'bg-orange-100 text-orange-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
              Update Transcript
            </button>
            <button
              onClick={() => setCurrentSection('speaker')}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'speaker'
                  ? 'bg-orange-100 text-orange-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              Update Speaker
            </button>
            <button
              onClick={() => setCurrentSection('duration')}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'duration'
                  ? 'bg-orange-100 text-orange-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Clock size={20} />
              Update Duration
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentSection === 'meeting' && <MeetingUploader />}
        {currentSection === 'transcript' && <TranscriptUpdater />}
        {currentSection === 'speaker' && <SpeakerNameUpdater />}
        {currentSection === 'duration' && <DurationUpdater />}
      </div>
    </div>
  );
}

export default App;