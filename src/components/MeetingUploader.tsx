import { useState } from 'react';
import { Calendar, Clock, Mail, Plus, Upload, Users, Trash2, CheckCircle, XCircle, Loader2, X, FileText } from 'lucide-react';

interface Meeting {
  id: number;
  title: string;
  email: string;
  attendees: string;
  startTime: string;
  recording: File | null;
  dealName?: string;
  dealStageDuringCall?: string;
  currentDealStage?: string;
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
      recording: null,
      dealName: '',
      dealStageDuringCall: '',
      currentDealStage: '',
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
        recording: null,
        dealName: '',
        dealStageDuringCall: '',
        currentDealStage: '',
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
    if (file && !file.name.toLowerCase().endsWith('.mp4') && !file.name.toLowerCase().endsWith('.mp3')) {
      setUploadStatuses(prev => [
        ...prev.filter(status => status.meetingId !== id),
        {
          meetingId: id,
          status: 'error',
          error: 'Only MP4 and MP3 files are allowed'
        }
      ]);
      return;
    }
    handleInputChange(id, 'recording', file);
    // Clear any previous error when a valid file is selected
    setUploadStatuses(prev => prev.filter(status => status.meetingId !== id));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMeeting = (meeting: Meeting): string | null => {
    if (!meeting.title.trim()) return 'Meeting title is required';
    if (!meeting.email.trim()) return 'Email is required';
    if (!validateEmail(meeting.email.trim())) return 'Please enter a valid email address';
    if (!meeting.attendees.trim()) return 'Attendees are required';
    if (!meeting.startTime) return 'Start time is required';
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
    if (meeting.recording) {
      formData.append('file', meeting.recording);
    }
    // Add deal info if provided
    if (meeting.dealName?.trim()) {
      formData.append('deal_name', meeting.dealName);
    }
    if (meeting.dealStageDuringCall?.trim()) {
      formData.append('deal_stage_during_call', meeting.dealStageDuringCall);
    }
    if (meeting.currentDealStage?.trim()) {
      formData.append('current_deal_stage', meeting.currentDealStage);
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
            if (response.error) {
              const errorMessage = `${response.error.message}\n${response.error.details}`;
              setUploadStatuses(prev => prev.map(status => 
                status.meetingId === meeting.id 
                  ? { ...status, status: 'error', error: errorMessage } 
                  : status
              ));
              reject(new Error(errorMessage));
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
            let errorMessage = 'Upload failed';
            if (error.error && error.error.message && error.error.details) {
              errorMessage = `${error.error.message}\n${error.error.details}`;
            }
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
      validateEmail(meeting.email.trim()) &&
      meeting.attendees.trim() &&
      meeting.startTime &&
      meeting.recording
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="space-y-6">
            {/* Upload Status - Moved to top */}
            {uploadStatuses
              .filter((status) => status.meetingId === meeting.id)
              .map((status, index) => (
                <div
                  key={index}
                  className={`mb-6 ${
                    status.status === 'pending' ? 'bg-white p-6 rounded-lg shadow-sm' : 
                    status.status === 'success' ? 'bg-green-50 p-4 rounded-lg' :
                    'bg-red-50 p-4 rounded-lg'
                  }`}
                >
                  {status.status === 'pending' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center gap-2">
                          <Loader2 size={20} className="animate-spin text-orange-500" />
                          <span>Uploading meeting recording...</span>
                        </div>
                        <button
                          onClick={() => cancelUpload(meeting.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 text-right">{status.progress}%</div>
                    </div>
                  )}
                  {status.status === 'success' && (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={20} className="text-green-500" />
                      <a 
                        href={`https://app.zime.ai/meeting/${status.callId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600 underline"
                      >
                        https://app.zime.ai/meeting/{status.callId}
                      </a>
                    </div>
                  )}
                  {status.status === 'error' && (
                    <div className="flex items-start gap-2 text-red-700">
                      <XCircle size={20} className="text-red-500 mt-1" />
                      <span className="whitespace-pre-line">{status.error}</span>
                    </div>
                  )}
                </div>
              ))}

            {/* Meeting Details Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users size={24} />
                Meeting Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                    placeholder="Enter meeting title"
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  />
                </div>

                <div>
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
                    placeholder="Enter organiser email"
                    required
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none ${
                      meeting.email && !validateEmail(meeting.email) ? 'border-red-500' : ''
                    }`}
                  />
                  {meeting.email && !validateEmail(meeting.email) && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Users size={18} />
                    Attendees *
                  </label>
                  <input
                    type="text"
                    value={meeting.attendees}
                    onChange={(e) =>
                      handleInputChange(meeting.id, 'attendees', e.target.value)
                    }
                    placeholder="Enter attendees"
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
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
                    <Upload size={18} />
                    Recording File (MP4, MP3) *
                  </label>
                  <input
                    type="file"
                    accept=".mp4,.mp3,video/mp4,audio/mp3"
                    onChange={(e) =>
                      handleFileChange(meeting.id, e.target.files?.[0] || null)
                    }
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Deal Information Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FileText size={24} />
                Deal Information (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <FileText size={18} />
                    Deal Name
                  </label>
                  <input
                    type="text"
                    value={meeting.dealName}
                    onChange={(e) =>
                      handleInputChange(meeting.id, 'dealName', e.target.value)
                    }
                    placeholder="Enter deal name"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <FileText size={18} />
                    Stage Name during the call
                  </label>
                  <input
                    type="text"
                    value={meeting.dealStageDuringCall}
                    onChange={(e) =>
                      handleInputChange(meeting.id, 'dealStageDuringCall', e.target.value)
                    }
                    placeholder="Enter deal stage during call"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <FileText size={18} />
                    Current Deal Stage
                  </label>
                  <input
                    type="text"
                    value={meeting.currentDealStage}
                    onChange={(e) =>
                      handleInputChange(meeting.id, 'currentDealStage', e.target.value)
                    }
                    placeholder="Enter current deal stage"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 flex justify-end">
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
                Upload Meeting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 