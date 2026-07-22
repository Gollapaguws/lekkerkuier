import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
          <p className="heading text-3xl text-[var(--lk-accent)]">Something glitched</p>
          <p className="text-[var(--lk-text-muted)] text-sm max-w-sm">
            A component crashed. The stream is still live at{' '}
            <a href="/autodj.mp3" className="text-[var(--lk-primary)] hover:underline">
              /autodj.mp3
            </a>.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="btn-glow px-6 py-2 text-sm mt-2"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
