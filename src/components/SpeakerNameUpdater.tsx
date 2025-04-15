import React, { useState, useEffect } from 'react';
import { Hash, Users, User, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface SpeakerInput {
  id: number;
  currentName: string;
  newName: string;
}

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

export function SpeakerNameUpdater() {
  const [callId, setCallId] = useState('');
  const [numSpeakers, setNumSpeakers] = useState('');
  const [speakers, setSpeakers] = useState<SpeakerInput[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  useEffect(() => {
    const num = parseInt(numSpeakers) || 0;
    setSpeakers(prevSpeakers => {
      const newSpeakers = Array(num).fill(null).map((_, index) => ({
        id: index + 1,
        currentName: prevSpeakers[index]?.currentName || '',
        newName: prevSpeakers[index]?.newName || ''
      }));
      return newSpeakers;
    });
  }, [numSpeakers]);

  const handleSpeakerNameChange = (id: number, field: 'currentName' | 'newName', value: string) => {
    setSpeakers(prevSpeakers =>
      prevSpeakers.map(speaker =>
        speaker.id === id ? { ...speaker, [field]: value } : speaker
      )
    );
  };

  const handleUpdate = async () => {
    if (!callId.trim() || speakers.length === 0) return;
    
    setIsUpdating(true);
    setStatus(null);
    
    try {
      const update_speakers: { [key: string]: string } = {};
      speakers.forEach(speaker => {
        if (speaker.currentName.trim() && speaker.newName.trim()) {
          update_speakers[speaker.currentName.trim()] = speaker.newName.trim();
        }
      });

      const response = await fetch('https://nodejs-prod.zime.ai/updateSpeaker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: parseInt(callId.trim()),
          update_speakers
        }),
      });

      const data = await response.json();

      if (data.data?.error_message) {
        setStatus({
          type: 'error',
          text: `${data.data.error_message}. Please check the current speaker name.`
        });
        return;
      }

      if (response.ok && data.statusCode === 201) {
        setStatus({
          type: 'success',
          text: data.data.message || 'Updated successfully.'
        });
      } else {
        setStatus({
          type: 'error',
          text: 'Failed to update speaker names. Please check the current speaker name.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error 
          ? `${error.message}. Please check the current speaker name.`
          : 'Failed to update speaker names. Please check the current speaker name.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isFormValid = () => {
    return (
      callId.trim() &&
      numSpeakers &&
      parseInt(numSpeakers) > 0 &&
      speakers.length > 0 &&
      speakers.every(s => s.currentName.trim() && s.newName.trim())
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-6">
            {status && (
              <div className={`p-4 rounded-lg flex items-center gap-2 ${
                status.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 mb-2">
                <Hash size={18} />
                Call ID *
              </label>
              <input
                type="number"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                placeholder="Enter the call ID"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 mb-2">
                <Users size={18} />
                Number of Speakers *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numSpeakers}
                onChange={(e) => setNumSpeakers(e.target.value)}
                placeholder="Enter number of speakers"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
              />
            </div>

            {speakers.length > 0 && (
              <div className="space-y-6">
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="p-4 border rounded-lg space-y-4">
                    <h3 className="flex items-center gap-2 text-gray-700 font-medium">
                      <User size={18} />
                      Speaker {speaker.id}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-700">
                          Current Name (as on call link) *
                        </label>
                        <input
                          type="text"
                          value={speaker.currentName}
                          onChange={(e) => handleSpeakerNameChange(speaker.id, 'currentName', e.target.value)}
                          placeholder="Enter current speaker name"
                          required
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-700">
                          New Name *
                        </label>
                        <input
                          type="text"
                          value={speaker.newName}
                          onChange={(e) => handleSpeakerNameChange(speaker.id, 'newName', e.target.value)}
                          placeholder="Enter new speaker name"
                          required
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={isUpdating || !isFormValid()}
              className={`flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg transition-colors ${
                isUpdating || !isFormValid()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-orange-600'
              }`}
            >
              {isUpdating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Update Speaker Names
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 