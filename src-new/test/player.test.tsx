import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Player } from '../src/components/Player';
import { MemoryRouter } from 'react-router-dom';

describe('Player', () => {
  const audioRef = { current: null } as React.RefObject<HTMLAudioElement | null>;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Player fetches nowPlaying on mount
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve(''),
    });
    // Mock HTMLMediaElement.play to return a resolved Promise
    // jsdom's implementation returns undefined, which breaks .catch()
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it('renders play button when not playing', () => {
    render(
      <MemoryRouter>
        <Player playing={false} onTogglePlay={() => {}} audioRef={audioRef} />
      </MemoryRouter>
    );

    const btn = screen.getByLabelText('Play');
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toBe('▶');
  });

  it('renders pause button when playing', () => {
    render(
      <MemoryRouter>
        <Player playing={true} onTogglePlay={() => {}} audioRef={audioRef} />
      </MemoryRouter>
    );

    const btn = screen.getByLabelText('Pause');
    expect(btn).toBeInTheDocument();
  });

  it('calls onTogglePlay when clicked', async () => {
    const onToggle = vi.fn();
    render(
      <MemoryRouter>
        <Player playing={false} onTogglePlay={onToggle} audioRef={audioRef} />
      </MemoryRouter>
    );

    const btn = screen.getByLabelText('Play');
    await userEvent.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders an audio element', () => {
    render(
      <MemoryRouter>
        <Player playing={false} onTogglePlay={() => {}} audioRef={audioRef} />
      </MemoryRouter>
    );

    const audio = document.querySelector('audio');
    expect(audio).toBeTruthy();
  });

  it('shows the station name', () => {
    render(
      <MemoryRouter>
        <Player playing={false} onTogglePlay={() => {}} audioRef={audioRef} />
      </MemoryRouter>
    );

    expect(screen.getByText('Lekker Kuier Psy Radio')).toBeInTheDocument();
  });
});
