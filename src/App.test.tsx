import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Meeting Upload Form', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks();
  });

  it('renders the initial meeting form', () => {
    render(<App />);
    expect(screen.getByText('Meeting #1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete meeting/i })).not.toBeInTheDocument();
  });

  it('adds a new meeting when clicking Add Another Meeting', async () => {
    render(<App />);
    const addButton = screen.getByText('Add Another Meeting');
    await userEvent.click(addButton);
    
    expect(screen.getByText('Meeting #2')).toBeInTheDocument();
    expect(screen.getAllByText(/meeting #/i)).toHaveLength(2);
  });

  it('deletes a meeting when clicking delete button (except first meeting)', async () => {
    render(<App />);
    const addButton = screen.getByText('Add Another Meeting');
    await userEvent.click(addButton);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete meeting/i });
    await userEvent.click(deleteButtons[0]);
    
    expect(screen.queryByText('Meeting #2')).not.toBeInTheDocument();
  });

  it('handles file upload for a meeting', async () => {
    render(<App />);
    
    const file = new File(['dummy content'], 'recording.mp4', { type: 'video/mp4' });
    const fileInput = screen.getByLabelText(/meeting recording/i);
    
    await userEvent.upload(fileInput, file);
    
    expect(screen.getByText(/recording\.mp4/)).toBeInTheDocument();
  });

  it('shows success message after successful upload', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ callId: '12345' }),
    });

    render(<App />);
    
    // Fill in required fields
    await userEvent.type(screen.getByPlaceholder(/daily tech scrum/i), 'Test Meeting');
    await userEvent.type(screen.getByPlaceholder(/billu@innerfit\.me$/i), 'test@example.com');
    
    // Upload file
    const file = new File(['dummy content'], 'recording.mp4', { type: 'video/mp4' });
    const fileInput = screen.getByLabelText(/meeting recording/i);
    await userEvent.upload(fileInput, file);
    
    // Click upload button
    const uploadButton = screen.getByText('Upload All Meetings');
    await userEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/call uploaded successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/12345/)).toBeInTheDocument();
    });
  });

  it('shows error message when upload fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<App />);
    
    // Upload file
    const file = new File(['dummy content'], 'recording.mp4', { type: 'video/mp4' });
    const fileInput = screen.getByLabelText(/meeting recording/i);
    await userEvent.upload(fileInput, file);
    
    // Click upload button
    const uploadButton = screen.getByText('Upload All Meetings');
    await userEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});