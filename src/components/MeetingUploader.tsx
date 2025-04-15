import { useState } from 'react';
import { Calendar, Clock, Mail, Plus, Upload, Users, Trash2, CheckCircle, XCircle, Loader2, X } from 'lucide-react';

interface Meeting {
  id: number;
  title: string;
  email: string;
  attendees: string;
  startTime: string;
  duration: string;
  recording: File | null;
}

interface UploadStatus {
  meetingId: number;
  status: 'pending' | 'success' | 'error';
  callId?: string;
  error?: string;
  progress?: number;
  xhr?: XMLHttpRequest;
}

export function MeetingUploader() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: '',
      email: '',
      attendees: '',
      startTime: '',
      duration: '',
      recording: null,
    },
  ]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addMeeting = () => {
    setMeetings([
      ...meetings,
      {
        id: meetings.length + 1,
        title: '',
        email: '',
        attendees: '',
        startTime: '',
        duration: '',
        recording: null,
      },
    ]);
  };

  const deleteMeeting = (id: number) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id));
    setUploadStatuses(uploadStatuses.filter(status => status.meetingId !== id));
  };

  const handleInputChange = (
    id: number,
    field: keyof Meeting,
    value: string | File | null
  ) => {
    setMeetings(
      meetings.map((meeting) =>
        meeting.id === id ? { ...meeting, [field]: value } : meeting
      )
    );
  };

  const handleFileChange = (id: number, file: File | null) => {
    if (file && !file.name.toLowerCase().endsWith('.mp4')) {
      setUploadStatuses(prev => [
        ...prev.filter(status => status.meetingId !== id),
        {
          meetingId: id,
          status: 'error',
          error: 'Only MP4 files are allowed'
        }
      ]);
      return;
    }
    handleInputChange(id, 'recording', file);
    // Clear any previous error when a valid file is selected
    setUploadStatuses(prev => prev.filter(status => status.meetingId !== id));
  };

  const validateMeeting = (meeting: Meeting): string | null => {
    if (!meeting.title.trim()) return 'Meeting title is required';
    if (!meeting.email.trim()) return 'Email is required';
    if (!meeting.attendees.trim()) return 'Attendees are required';
    if (!meeting.startTime) return 'Start time is required';
    if (!meeting.duration) return 'Duration is required';
    if (!meeting.recording) return 'Recording file is required';
    return null;
  };

  const cancelUpload = (meetingId: number) => {
    const status = uploadStatuses.find(s => s.meetingId === meetingId);
    if (status?.xhr) {
      status.xhr.abort();
      setUploadStatuses(prev => prev.map(s => 
        s.meetingId === meetingId 
          ? { ...s, status: 'error', error: 'Upload cancelled' } 
          : s
      ));
    }
  };

  const uploadMeeting = async (meeting: Meeting) => {
    const validationError = validateMeeting(meeting);
    if (validationError) {
      setUploadStatuses(prev => [
        ...prev,
        {
          meetingId: meeting.id,
          status: 'error',
          error: validationError
        }
      ]);
      return;
    }

    const formData = new FormData();
    formData.append('title', meeting.title);
    formData.append('email', meeting.email);
    formData.append('attendees', meeting.attendees);
    formData.append('meeting_start_time', meeting.startTime);
    formData.append('video_duration', meeting.duration);
    if (meeting.recording) {
      formData.append('file', meeting.recording);
    }

    // Set initial upload status
    setUploadStatuses(prev => [
      ...prev,
      {
        meetingId: meeting.id,
        status: 'pending',
        progress: 0
      }
    ]);

    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadStatuses(prev => prev.map(status => 
              status.meetingId === meeting.id 
                ? { ...status, progress, xhr } 
                : status
            ));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            if (response.error_messages) {
              setUploadStatuses(prev => prev.map(status => 
                status.meetingId === meeting.id 
                  ? { ...status, status: 'error', error: response.error_messages } 
                  : status
              ));
              reject(new Error(response.error_messages));
            } else {
              setUploadStatuses(prev => prev.map(status => 
                status.meetingId === meeting.id 
                  ? { ...status, status: 'success', callId: response.data?.callId } 
                  : status
              ));
              resolve(response);
            }
          } else {
            const error = JSON.parse(xhr.responseText);
            const errorMessage = error.error_messages || 'Upload failed';
            setUploadStatuses(prev => prev.map(status => 
              status.meetingId === meeting.id 
                ? { ...status, status: 'error', error: errorMessage } 
                : status
            ));
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener('error', () => {
          setUploadStatuses(prev => prev.map(status => 
            status.meetingId === meeting.id 
              ? { ...status, status: 'error', error: 'Network error occurred' } 
              : status
          ));
          reject(new Error('Network error occurred'));
        });

        xhr.open('POST', 'https://nodejs-prod.zime.ai/uploadVideosAndProcess');
        xhr.send(formData);
      });
    } catch (error) {
      setUploadStatuses(prev => prev.map(status => 
        status.meetingId === meeting.id 
          ? { ...status, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' } 
          : status
      ));
      throw error;
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadStatuses([]);
    
    try {
      await Promise.all(meetings.map(meeting => uploadMeeting(meeting)));
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = (meeting: Meeting): boolean => {
    return Boolean(
      meeting.title.trim() &&
      meeting.email.trim() &&
      meeting.attendees.trim() &&
      meeting.startTime &&
      meeting.duration &&
      meeting.recording
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white p-8 rounded-lg shadow-sm space-y-6 relative"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Meeting #{meeting.id}</h2>
              {meeting.id !== 1 && (
                <button
                  onClick={() => deleteMeeting(meeting.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete meeting"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            {uploadStatuses.find(status => status.meetingId === meeting.id) && (
              <div className={`p-4 rounded-lg ${
                uploadStatuses.find(status => status.meetingId === meeting.id)?.status === 'success'
                  ? 'bg-green-50 text-green-700'
                  : uploadStatuses.find(status => status.meetingId === meeting.id)?.status === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {uploadStatuses.find(status => status.meetingId === meeting.id)?.status === 'success' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>Call uploaded successfully! Meeting Link: <a href={`https://app.zime.ai/meeting/${
                      uploadStatuses.find(status => status.meetingId === meeting.id)?.callId
                    }`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{`https://app.zime.ai/meeting/${
                      uploadStatuses.find(status => status.meetingId === meeting.id)?.callId
                    }`}</a></span>
                  </div>
                ) : uploadStatuses.find(status => status.meetingId === meeting.id)?.status === 'error' ? (
                  <div className="flex items-center gap-2">
                    <XCircle size={20} className="text-red-500" />
                    <span>{uploadStatuses.find(status => status.meetingId === meeting.id)?.error}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Uploading... {uploadStatuses.find(status => status.meetingId === meeting.id)?.progress}%</span>
                    </div>
                    <button
                      onClick={() => cancelUpload(meeting.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Calendar size={18} />
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meeting.title}
                  onChange={(e) =>
                    handleInputChange(meeting.id, 'title', e.target.value)
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  placeholder="Enter meeting title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Mail size={18} />
                  Organiser Email ID *
                </label>
                <input
                  type="email"
                  value={meeting.email}
                  onChange={(e) =>
                    handleInputChange(meeting.id, 'email', e.target.value)
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  placeholder="Enter organiser mail ID i.e. kartik@zime.ai"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Users size={18} />
                  Attendees Email ID (separated by comma) *
                </label>
                <input
                  type="text"
                  value={meeting.attendees}
                  onChange={(e) =>
                    handleInputChange(meeting.id, 'attendees', e.target.value)
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  placeholder="Enter attendees mail ID i.e. kartik@zime.ai, ashish@zime.ai, sanchit@zime.ai"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Calendar size={18} />
                  Meeting Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={meeting.startTime}
                  onChange={(e) =>
                    handleInputChange(meeting.id, 'startTime', e.target.value)
                  }
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Clock size={18} />
                  Meeting Duration (seconds) *
                </label>
                <input
                  type="number"
                  value={meeting.duration}
                  onChange={(e) =>
                    handleInputChange(meeting.id, 'duration', e.target.value)
                  }
                  placeholder="550"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Upload size={18} />
                  Recording File (MP4) *
                </label>
                <input
                  type="file"
                  accept=".mp4,video/mp4"
                  onChange={(e) =>
                    handleFileChange(meeting.id, e.target.files?.[0] || null)
                  }
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center">
          <button
            onClick={addMeeting}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Add Another Meeting
          </button>

          <button
            onClick={handleUpload}
            disabled={isUploading || !meetings.every(isFormValid)}
            className={`flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg transition-colors ${
              isUploading || !meetings.every(isFormValid)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-orange-600'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload All Meetings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 