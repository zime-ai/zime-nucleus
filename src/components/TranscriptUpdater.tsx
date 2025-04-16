import { useState } from 'react';
import { Hash, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function TranscriptUpdater() {
  const [callId, setCallId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdate = async () => {
    if (!callId.trim()) return;
    
    setIsUpdating(true);
    setStatus(null);
    
    try {
      const response = await fetch(`https://nodejs-prod.zime.ai/rerunTranscript?id=${callId.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: `${data.message || 'Failed to update transcript'}. Check the Call ID`
        });
        return;
      }

      setStatus({
        type: 'success',
        message: 'Transcript update initiated successfully. ETA - 10 mins'
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