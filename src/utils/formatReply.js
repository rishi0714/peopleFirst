const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function formatReply(text) {
  if (!text) return '';
  const escaped = text.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
  return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}
