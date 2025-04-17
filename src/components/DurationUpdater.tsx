import { useState } from 'react';
import { Hash, Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function DurationUpdater() {
  const [callIds, setCallIds] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdate = async () => {
    if (!callIds.trim()) return;
    
    setIsUpdating(true);
    setStatus(null);
    
    try {
      // Convert comma-separated string to array of numbers and remove any whitespace
      const callIdsArray = callIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      const response = await fetch('https://nodejs-prod.zime.ai/updateDuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callIds: callIdsArray
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: `${data.message || 'Failed to update call duration'}. Check call IDs`
        });
        return;
      }

      setStatus({
        type: 'success',
        message: data.data || 'Call duration updated successfully'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to connect to server. Check call IDs'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          {/* Info Message */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2 text-blue-700">
              <AlertCircle size={20} className="text-blue-500 mt-0.5" />
              <span>Use this to update the call duration only when transcript of the call is generated</span>
            </div>
          </div>

          {/* Status Message */}
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
                Call IDs *
              </label>
              <input
                type="text"
                value={callIds}
                onChange={(e) => setCallIds(e.target.value)}
                placeholder="Enter call IDs separated by commas (e.g., 42296, 42295)"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={isUpdating || !callIds.trim()}
              className={`flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg transition-colors ${
                isUpdating || !callIds.trim()
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
                  Update Duration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 