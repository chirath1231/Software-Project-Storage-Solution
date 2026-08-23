import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventCalendar from './EventCalendar';
import { NotificationProvider } from '../context/NotificationContext'; // Wrap in context

describe('Event Calendar Component', () => {
  test('opens the schedule modal when button is clicked', () => {
    // Render the component with its required context
    render(
      <NotificationProvider>
        <EventCalendar />
      </NotificationProvider>
    );
    
    // Find the Schedule Meeting button and click it
    const scheduleButton = screen.getByText(/Schedule Meeting/i);
    fireEvent.click(scheduleButton);
    
    // Verify the modal appears by checking for a specific input field
    const titleInputLabel = screen.getByText(/Event Title/i);
    expect(titleInputLabel).toBeInTheDocument();
  });
});