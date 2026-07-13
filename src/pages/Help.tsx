import { useMemo, useState, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ChevronDown, Mail, Phone, Search } from 'lucide-react';
import clsx from 'clsx';
import { sendSupportMessage } from '../api/support';

const faqs = [
  {
    question: 'How do I add a new book to the catalog?',
    answer:
      'Open Add Books from the sidebar, enter the book details, and save the record. Once saved, the book becomes searchable in the catalog and can be checked out if available.',
  },
  {
    question: 'How do I check out a book to a member?',
    answer:
      'Go to Check-out Books, search for the member or book, and use the Check Out action on an available record. The system records the borrowed date and calculates the return date from your library preferences.',
  },
  {
    question: 'How are overdue fines calculated?',
    answer:
      'Overdue fines are calculated from the due date using your configured fine-per-day amount in Settings. Returned books can display any fine due after the return action completes.',
  },
  {
    question: 'How do reservations work?',
    answer:
      'Reservations let members queue for books that are borrowed or unavailable. When the book is returned, admins can review pending reservations and notify the next member.',
  },
  {
    question: 'How do I reset my admin password?',
    answer:
      'Use the Forgot password link on the sign-in page or update your password from Settings under the Security tab. For locked accounts, contact support.',
  },
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const mapValidationError = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('subject')) {
    return { field: 'subject' as const, message };
  }

  if (normalized.includes('message')) {
    return { field: 'message' as const, message };
  }

  return { field: undefined, message };
};

export const Help = () => {
  const [search, setSearch] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(faqs[0].question);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ subject?: string; message?: string }>({});

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqs;

    return faqs.filter((faq) => faq.question.toLowerCase().includes(query));
  }, [search]);

  const contactMutation = useMutation({
    mutationFn: sendSupportMessage,
    onSuccess: () => {
      setSuccess(true);
      setErrorMessage(null);
      setFieldErrors({});
      setSubject('');
      setMessage('');
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Unable to send your message. Please try again.');

      if (error instanceof AxiosError && error.response?.status === 400) {
        const mapped = mapValidationError(message);

        if (mapped.field) {
          setFieldErrors({ [mapped.field]: mapped.message });
          setErrorMessage(null);
          return;
        }
      }

      setFieldErrors({});
      setErrorMessage(message);
    },
  });

  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  const canSubmit = Boolean(trimmedSubject && trimmedMessage) && !contactMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!trimmedSubject || !trimmedMessage) {
      setFieldErrors({
        subject: !trimmedSubject ? 'Subject is required' : undefined,
        message: !trimmedMessage ? 'Message is required' : undefined,
      });
      return;
    }

    contactMutation.mutate({ subject: trimmedSubject, message: trimmedMessage });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8 font-sans">
      <div>
        <h1 className="text-[20px] font-bold text-charcoal">Help & Support</h1>
        <p className="mt-1 text-[13px] text-gray-500">Find answers or reach out to our team</p>
      </div>

      <div className="flex justify-center py-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for help articles..."
            className="w-full rounded-full border border-gray-200 bg-white py-4 pl-13 pr-5 text-[15px] text-charcoal shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/15"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-gray-50 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sm:p-6">
          <h2 className="text-[18px] font-bold text-charcoal">Frequently Asked Questions</h2>

          <div className="mt-5 divide-y divide-gray-100">
            {filteredFaqs.map((faq) => {
              const isOpen = openQuestion === faq.question;

              return (
                <div
                  key={faq.question}
                  className={clsx(
                    'transition-colors',
                    isOpen ? 'border-l-4 border-amber-gold bg-amber-gold/5' : 'hover:bg-gray-50/70'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(isOpen ? null : faq.question)}
                    className="flex w-full items-center justify-between gap-5 px-4 py-4 text-left"
                  >
                    <span className="text-[14px] font-semibold text-charcoal">{faq.question}</span>
                    <ChevronDown
                      className={clsx(
                        'h-5 w-5 shrink-0 transition-transform',
                        isOpen ? 'rotate-180 text-amber-gold' : 'text-gray-400'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <p className="px-4 pb-5 text-[14px] leading-6 text-gray-500">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-[15px] font-semibold text-charcoal">No results found</p>
              <p className="mt-1 text-[13px] text-gray-500">
                Try another keyword or use the contact form.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-50 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sm:p-6">
          <h2 className="text-[18px] font-bold text-charcoal">Still need help?</h2>
          <p className="mt-1 text-[13px] text-gray-500">
            Our support team typically responds within 24 hours.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          {success ? (
            <div className="mt-6 rounded-xl border border-amber-gold/20 bg-amber-gold/10 px-4 py-5">
              <p className="text-[15px] font-semibold text-charcoal">
                Message sent. Our support team will respond within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-4 text-[13px] font-semibold text-amber-gold hover:text-amber-gold/80"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Subject
                </span>
                <input
                  required
                  value={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                    if (fieldErrors.subject) {
                      setFieldErrors((current) => ({ ...current, subject: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.subject)}
                  className={clsx(
                    'w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-all focus:ring-2 focus:ring-amber-gold/15',
                    fieldErrors.subject
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-200 focus:border-amber-gold'
                  )}
                  placeholder="What can we help with?"
                />
                {fieldErrors.subject && (
                  <p className="mt-2 text-[13px] font-medium text-red-600">{fieldErrors.subject}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                  Message
                </span>
                <textarea
                  required
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (fieldErrors.message) {
                      setFieldErrors((current) => ({ ...current, message: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.message)}
                  rows={6}
                  className={clsx(
                    'w-full resize-none rounded-xl border px-4 py-3 text-[14px] outline-none transition-all focus:ring-2 focus:ring-amber-gold/15',
                    fieldErrors.message
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-200 focus:border-amber-gold'
                  )}
                  placeholder="Tell us what happened..."
                />
                {fieldErrors.message && (
                  <p className="mt-2 text-[13px] font-medium text-red-600">{fieldErrors.message}</p>
                )}
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-full bg-amber-gold px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-gold/90 disabled:opacity-70"
              >
                {contactMutation.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3 text-[13px] text-gray-500">
              <Mail className="h-4 w-4 text-amber-gold" />
              support@oraculum.edu
            </div>
            <div className="flex items-center gap-3 text-[13px] text-gray-500">
              <Phone className="h-4 w-4 text-amber-gold" />
              +1 (555) 014-0986
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
