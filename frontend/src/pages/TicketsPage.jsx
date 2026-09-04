import { useEffect, useState } from 'react';
import { ticketApi } from '../api/ticketApi.js';
import { DateUtils } from '../utils/dateUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import { Card, CardHeader, CardBody } from '../components/Card.jsx';

const CATEGORIES = [
  { value: 'LATE_SUBMISSION', label: 'Late Submission (Missed cutoff: End-of-week or 25th of month)' },
  { value: 'POST_DATE_CORRECTION', label: 'Post-Date Leave Correction (Leave date has already passed)' },
  { value: 'TECHNICAL_ERROR', label: 'Technical Error Encountered while applying' },
  { value: 'POLICY_EXCEPTION', label: 'Policy Exception / Discretionary Request' },
];

export default function TicketsPage() {
  const [ticketType, setTicketType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [tickets, setTickets] = useState(null);

  function loadTickets() {
    ticketApi.getTickets().then(setTickets).catch(() => setTickets([]));
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null);
    setSubmitting(true);
    try {
      await ticketApi.createTicket({ ticketType, subject, description });
      setAlert({ variant: 'success', text: 'Ticket submitted successfully! An HR administrator will review it.' });
      setTicketType('');
      setSubject('');
      setDescription('');
      loadTickets();
    } catch (err) {
      setAlert({ variant: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Support Tickets Desk"
        subtitle="File tickets for late submissions after cutoffs, post-date corrections, technical errors, or policy exceptions."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>Create Support Ticket</CardHeader>
          <CardBody>
            {alert && <Alert variant={alert.variant} className="mb-4">{alert.text}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4.5">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Ticket Reason / Category *</label>
                <select
                  required
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                >
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Detailed Explanation &amp; Leave Dates *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why the request is late, or details of the adjustment required..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full justify-center">
                {submitting ? 'Submitting ticket...' : 'Submit Support Ticket'}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>My Submitted Tickets</CardHeader>
          <div className="max-h-[500px] space-y-3 overflow-y-auto p-5">
            {tickets === null ? (
              <div className="text-slate-400 text-sm">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No support tickets filed yet.</div>
            ) : (
              tickets.map((t, i) => (
                <div key={i} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{t.subject}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                          : 'bg-amber-50 text-amber-800 ring-amber-600/20'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="mb-2 text-xs font-medium text-slate-400">
                    {t.ticketType} &bull; Filed {DateUtils.formatDateTime(t.createdAt)}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-600">{t.description}</div>
                  {t.resolutionComment && (
                    <div className="mt-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 p-2.5 text-xs text-indigo-900 leading-relaxed">
                      <strong>Admin Response:</strong> {t.resolutionComment}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
