import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Mail,
  MailOpen,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
}

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'read'>('all');

  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('contact_messages')
      .select('id,name,email,phone,message,status,created_at')
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('LOAD MESSAGES ERROR:', loadError);
      setError(loadError.message || 'Failed to load messages.');
      setMessages([]);
    } else {
      setMessages((data as ContactMessage[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markAsRead = async (message: ContactMessage) => {
    if (message.status === 'read') return true;

    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', message.id);

    if (updateError) {
      console.error('MARK READ ERROR:', updateError);
      setError(updateError.message);
      return false;
    }

    setMessages((previous) =>
      previous.map((item) =>
        item.id === message.id ? { ...item, status: 'read' } : item
      )
    );

    return true;
  };

  const openMessage = async (message: ContactMessage) => {
    setError('');
    await markAsRead(message);
    setSelected({ ...message, status: 'read' });
  };

  const toggleReadStatus = async (message: ContactMessage) => {
    setWorkingId(message.id);
    setError('');
    setSuccess('');

    const nextStatus = message.status === 'read' ? 'new' : 'read';

    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ status: nextStatus })
      .eq('id', message.id);

    if (updateError) {
      console.error('UPDATE MESSAGE ERROR:', updateError);
      setError(updateError.message || 'Failed to update message.');
    } else {
      setMessages((previous) =>
        previous.map((item) =>
          item.id === message.id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      if (selected?.id === message.id) {
        setSelected({ ...message, status: nextStatus });
      }

      setSuccess(
        nextStatus === 'read'
          ? 'Message marked as read.'
          : 'Message marked as new.'
      );
    }

    setWorkingId(null);
  };

  const deleteMessage = async (message: ContactMessage) => {
    const confirmed = window.confirm(
      `Delete the message from "${message.name}"?`
    );

    if (!confirmed) return;

    setWorkingId(message.id);
    setError('');
    setSuccess('');

    const { error: deleteError } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', message.id);

    if (deleteError) {
      console.error('DELETE MESSAGE ERROR:', deleteError);
      setError(deleteError.message || 'Failed to delete message.');
    } else {
      setMessages((previous) =>
        previous.filter((item) => item.id !== message.id)
      );

      if (selected?.id === message.id) {
        setSelected(null);
      }

      setSuccess('Message deleted successfully.');
    }

    setWorkingId(null);
  };

  const filteredMessages = useMemo(() => {
    const term = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesFilter =
        filter === 'all' || message.status === filter;

      const matchesSearch =
        !term ||
        message.name.toLowerCase().includes(term) ||
        message.email.toLowerCase().includes(term) ||
        message.phone?.toLowerCase().includes(term) ||
        message.message.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [messages, search, filter]);

  const newCount = messages.filter(
    (message) => message.status === 'new'
  ).length;

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <AdminLayout title="Messages">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Contact Messages
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage messages received through the website contact form.
        </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-sm text-gray-500">All Messages</p>
          <p className="text-3xl font-bold text-[#073B2A] mt-2">
            {messages.length}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-sm text-gray-500">New Messages</p>
          <p className="text-3xl font-bold text-[#073B2A] mt-2">
            {newCount}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-sm text-gray-500">Read Messages</p>
          <p className="text-3xl font-bold text-[#073B2A] mt-2">
            {messages.length - newCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'new', 'read'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition ${
                  filter === item
                    ? 'bg-[#0C4A2E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0C4A2E]/10 flex items-center justify-center">
              <Mail className="text-[#0C4A2E]" size={26} />
            </div>
            <h3 className="font-semibold text-gray-800 mt-4">
              No messages found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              New website messages will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((message) => {
              const isNew = message.status === 'new';

              return (
                <div
                  key={message.id}
                  className={`p-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-gray-50 transition ${
                    isNew ? 'bg-green-50/30' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openMessage(message)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isNew ? (
                        <Mail size={17} className="text-[#0C4A2E]" />
                      ) : (
                        <MailOpen size={17} className="text-gray-400" />
                      )}

                      <p
                        className={`truncate ${
                          isNew
                            ? 'font-bold text-gray-900'
                            : 'font-medium text-gray-700'
                        }`}
                      >
                        {message.name}
                      </p>

                      {isNew && (
                        <span className="text-[10px] uppercase tracking-wide bg-[#0C4A2E] text-white px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {message.email}
                    </p>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                      {message.message}
                    </p>
                  </button>

                  <div className="flex items-center justify-between lg:justify-end gap-3">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(message.created_at)}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleReadStatus(message)}
                      disabled={workingId === message.id}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                      title={
                        isNew ? 'Mark as read' : 'Mark as new'
                      }
                    >
                      <Check size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteMessage(message)}
                      disabled={workingId === message.id}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                      title="Delete message"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  Message from {selected.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(selected.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-medium text-gray-800 mt-1">
                    {selected.name}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Email</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="font-medium text-[#0C4A2E] mt-1 block break-all"
                  >
                    {selected.email}
                  </a>
                </div>

                {selected.phone && (
                  <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                    <p className="text-xs text-gray-400">Phone</p>
                    <a
                      href={`tel:${selected.phone}`}
                      className="font-medium text-[#0C4A2E] mt-1 block"
                    >
                      {selected.phone}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Message
                </p>
                <div className="border border-gray-100 rounded-2xl p-5 text-gray-700 whitespace-pre-wrap leading-7">
                  {selected.message}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 pt-5">
                <a
                  href={`mailto:${selected.email}`}
                  className="text-center px-5 py-3 rounded-xl bg-[#0C4A2E] text-white font-medium hover:bg-[#083A24]"
                >
                  Reply by Email
                </a>

                <button
                  type="button"
                  onClick={() => deleteMessage(selected)}
                  className="px-5 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}