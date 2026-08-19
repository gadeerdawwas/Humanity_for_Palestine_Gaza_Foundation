import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Mail,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSubscribers = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('newsletter_subscribers')
      .select('id,email,created_at')
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('LOAD SUBSCRIBERS ERROR:', loadError);
      setError(loadError.message || 'Failed to load subscribers.');
      setSubscribers([]);
    } else {
      setSubscribers((data as Subscriber[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const copyEmail = async (subscriber: Subscriber) => {
    try {
      await navigator.clipboard.writeText(subscriber.email);
      setCopiedId(subscriber.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (copyError) {
      console.error('COPY EMAIL ERROR:', copyError);
      setError('Could not copy the email address.');
    }
  };

  const deleteSubscriber = async (subscriber: Subscriber) => {
    const confirmed = window.confirm(
      `Remove "${subscriber.email}" from the newsletter?`
    );

    if (!confirmed) return;

    setDeletingId(subscriber.id);
    setError('');
    setSuccess('');

    const { error: deleteError } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', subscriber.id);

    if (deleteError) {
      console.error('DELETE SUBSCRIBER ERROR:', deleteError);
      setError(deleteError.message || 'Failed to delete subscriber.');
    } else {
      setSubscribers((previous) =>
        previous.filter((item) => item.id !== subscriber.id)
      );
      setSuccess('Subscriber removed successfully.');
    }

    setDeletingId(null);
  };

  const filteredSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return subscribers;

    return subscribers.filter((subscriber) =>
      subscriber.email.toLowerCase().includes(term)
    );
  }, [subscribers, search]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <AdminLayout title="Subscribers">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Newsletter Subscribers
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            View and manage people subscribed to website updates.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#0C4A2E]/10 flex items-center justify-center">
            <Users size={20} className="text-[#0C4A2E]" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Total Subscribers</p>
            <p className="text-xl font-bold text-[#073B2A]">
              {loading ? '...' : subscribers.length}
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subscribers..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading subscribers...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0C4A2E]/10 flex items-center justify-center">
              <Mail className="text-[#0C4A2E]" size={26} />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              No subscribers found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Newsletter subscriptions from the website will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">
                    Subscriber
                  </th>
                  <th className="text-left px-6 py-4 font-medium">
                    Subscription Date
                  </th>
                  <th className="text-right px-6 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-t border-gray-100 hover:bg-gray-50/70 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0C4A2E]/10 flex items-center justify-center shrink-0">
                          <Mail size={18} className="text-[#0C4A2E]" />
                        </div>

                        <a
                          href={`mailto:${subscriber.email}`}
                          className="font-medium text-gray-800 hover:text-[#0C4A2E] break-all"
                        >
                          {subscriber.email}
                        </a>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(subscriber.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => copyEmail(subscriber)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Copy email"
                        >
                          {copiedId === subscriber.id ? (
                            <Check size={18} />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSubscriber(subscriber)}
                          disabled={deletingId === subscriber.id}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                          title="Delete subscriber"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}