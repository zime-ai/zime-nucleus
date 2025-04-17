import { useState } from 'react';
import { Hash, Users, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface Speaker {
  currentName: string;
  newName: string;
}

export function SpeakerNameUpdater() {
  const [callId, setCallId] = useState('');
  const [numSpeakers, setNumSpeakers] = useState('');
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleNumSpeakersChange = (value: string) => {
    const num = parseInt(value) || 0;
    setNumSpeakers(value);
    setSpeakers(Array(num).fill(null).map(() => ({ currentName: '', newName: '' })));
  };

  const handleSpeakerChange = (index: number, field: keyof Speaker, value: string) => {
    setSpeakers(prev => prev.map((speaker, i) => 
      i === index ? { ...speaker, [field]: value } : speaker
    ));
  };

  const handleUpdate = async () => {
    if (!callId.trim() || speakers.length === 0) return;
    
    setIsUpdating(true);
    setStatus(null);
    
    try {
      // Format the update_speakers object as per API requirement
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

      if (data.error_message) {
        setStatus({
          type: 'error',
          message: `${data.error_message}. Check current speaker name`
        });
        return;
      }

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: 'Failed to update speaker names. Check the Call ID'
        });
        return;
      }

      setStatus({
        type: 'success',
        message: data.message || 'Updated successfully.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to connect to server. Check the Call ID'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          {status && (
            <div className={`mb-6 p-4 rounded-lg ${
              status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {status.type === 'success' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
                <span className={status.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {status.message}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-6">
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
                value={numSpeakers}
                onChange={(e) => handleNumSpeakersChange(e.target.value)}
                placeholder="Enter number of speakers"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
              />
            </div>

            {speakers.map((speaker, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="flex items-center gap-2 text-gray-700 mb-4">
                  <Users size={18} />
                  Speaker {index + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Current Name (as on call link) *
                    </label>
                    <input
                      type="text"
                      value={speaker.currentName}
                      onChange={(e) => handleSpeakerChange(index, 'currentName', e.target.value)}
                      placeholder="Enter current speaker name"
                      required
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      New Name *
                    </label>
                    <input
                      type="text"
                      value={speaker.newName}
                      onChange={(e) => handleSpeakerChange(index, 'newName', e.target.value)}
                      placeholder="Enter new speaker name"
                      required
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleUpdate}
              disabled={isUpdating || !callId.trim() || speakers.length === 0 || !speakers.every(s => s.currentName.trim() && s.newName.trim())}
              className={`flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg transition-colors ${
                isUpdating || !callId.trim() || speakers.length === 0 || !speakers.every(s => s.currentName.trim() && s.newName.trim())
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