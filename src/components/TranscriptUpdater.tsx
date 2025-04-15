import React, { useState } from 'react';
import { Hash, RefreshCw, Loader2 } from 'lucide-react';

export function TranscriptUpdater() {
  const [callId, setCallId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!callId.trim()) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('https://api-v1-prod-ift.innerfit.me/core/updateTranscript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: callId.trim()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update transcript');
      }

      alert('Transcript update initiated successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update transcript');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm">
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

            <button
              onClick={handleUpdate}
              disabled={isUpdating || !callId.trim()}
              className={`flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg transition-colors ${
                isUpdating || !callId.trim()
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
                  Update Transcript
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 