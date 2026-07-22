import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { api } from '../api/client';
import { useToast } from '../components/Toast';

interface Message {
  id: string;
  name: string;
  message: string;
  time: string;
  type: 'chat' | 'request';
}

const PLACEHOLDER: Message[] = [
  { id: '1', name: 'RadioBot', message: 'Welcome to the Lekker Kuier chat! Drop your requests below. 🎵', time: 'Now', type: 'chat' },
  { id: '2', name: 'Listener_42', message: 'Can you play some Astrix?', time: '2m ago', type: 'request' },
  { id: '3', name: 'System', message: 'Stream is live at 320kbps. Next show starts in 1 hour.', time: '5m ago', type: 'chat' },
];

export function Chat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(PLACEHOLDER);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const submit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true);
    setError(null);

    const msg: Message = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      time: 'Just now',
      type: 'request',
    };

    try {
      await api.sendChat({ name: msg.name, message: msg.message });
      setMessages((prev) => [...prev, msg]);
      setMessage('');
      toast('Message sent!', 'success');
    } catch (err) {
      // Add locally anyway; clear error on next successful send
      setMessages((prev) => [...prev, { ...msg, id: Date.now().toString() + '-local' }]);
      setMessage('');
      setError('Offline — message saved locally.');
      toast('Offline — message saved locally.', 'warning');
    } finally {
      setSending(false);
    }
  }, [name, message]);

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8 pb-24">
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        <h1 className="heading text-2xl md:text-4xl mb-2">Listener Chat & Requests</h1>
        <p className="text-[var(--lk-text-muted)] text-sm mb-6">
          Chat with the community and send song requests to the current DJ.
        </p>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 glass p-4 overflow-y-auto mb-4 space-y-3 min-h-[300px] max-h-[50vh]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.type === 'request' ? 'opacity-80' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--lk-primary)] to-[var(--lk-accent)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {msg.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{msg.name}</span>
                  {msg.type === 'request' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--lk-primary)]/15 text-[var(--lk-primary)]">
                      REQUEST
                    </span>
                  )}
                  <span className="text-[11px] text-[var(--lk-text-muted)]">{msg.time}</span>
                </div>
                <p className="text-sm mt-0.5">{msg.message}</p>
              </div>
            </div>
          ))}
          {error && <p className="text-xs text-[var(--lk-accent)] text-center">{error}</p>}
        </div>

        {/* Input */}
        <form onSubmit={submit} className="glass p-3 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={30}
            required
            className="w-24 md:w-32 bg-white/5 border border-[var(--lk-primary)]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--lk-primary)] flex-shrink-0"
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={name ? 'Type a message or request…' : 'Enter your name first'}
            maxLength={300}
            required
            disabled={!name.trim()}
            className="flex-1 bg-white/5 border border-[var(--lk-primary)]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--lk-primary)]"
          />
          <button type="submit" disabled={sending || !name.trim() || !message.trim()} className="btn-glow px-4 py-2 text-sm flex-shrink-0 disabled:opacity-50">
            {sending ? '…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
