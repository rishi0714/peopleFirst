import { useState } from 'react';
import { agentApi } from '../api/agentApi.js';

export function useAgentChat({ greeting, quickReplies: initialQuickReplies, conversationId }) {
  const [messages, setMessages] = useState([{ role: 'agent', text: greeting }]);
  const [quickReplies, setQuickReplies] = useState(initialQuickReplies);
  const [sending, setSending] = useState(false);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setSending(true);

    try {
      const response = await agentApi.chat(trimmed, conversationId);
      setMessages((m) => [
        ...m,
        { role: 'agent', text: response.reply, suggestions: response.wellbeingSuggestions },
      ]);
      if (response.quickReplies && response.quickReplies.length) {
        setQuickReplies(response.quickReplies);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: 'agent', text: err.message || 'Sorry, I encountered an error.', error: true }]);
    } finally {
      setSending(false);
    }
  }

  return { messages, quickReplies, sending, sendMessage };
}
