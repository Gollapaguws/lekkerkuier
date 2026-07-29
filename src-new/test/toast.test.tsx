import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { ToastProvider, useToast, ToastContainer } from '../src/components/Toast';

// Helper: render a component that can trigger toasts
function ToastTester() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast('Success message', 'success')}>Show Success</button>
      <button onClick={() => toast('Error message', 'error')}>Show Error</button>
      <button onClick={() => toast('Info message')}>Show Info</button>
      <button onClick={() => toast('Warning!', 'warning')}>Show Warning</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <ToastTester />
      <ToastContainer />
    </ToastProvider>
  );
}

describe('Toast Context', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast when triggered', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders error toast with correct icon', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error message')).toBeInTheDocument();
    // Dismiss button and icon both have ✕ — check the icon span specifically
    const icons = screen.getAllByText('✕');
    expect(icons.length).toBeGreaterThanOrEqual(2); // icon + dismiss button
  });

  it('defaults to info variant', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show Info'));

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('auto-dismisses after 4 seconds', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(4000); });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('can manually dismiss a toast', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show Warning'));

    const dismissBtn = screen.getByLabelText('Dismiss');
    fireEvent.click(dismissBtn);

    expect(screen.queryByText('Warning!')).not.toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('throws when useToast is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      useToast();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow('useToast must be used within ToastProvider');
    spy.mockRestore();
  });

  it('has accessible live region when toasts present', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Show Success'));

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });
});
