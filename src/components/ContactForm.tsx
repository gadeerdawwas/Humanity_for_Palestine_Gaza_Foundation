import { useState, type FormEvent } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useReveal } from '@/hooks/useReveal';

type ContactFormProps = { copy: any };

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ copy }: ContactFormProps) {
  const form = copy.contactForm;
  const ref = useReveal<HTMLDivElement>();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim() || null;
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      setStatus('error');
      setErrorMsg(form.error);
      return;
    }

    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      phone,
      message,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(form.error);
      return;
    }

    setStatus('success');
    (e.target as HTMLFormElement).reset();
  };

  if (status === 'success') {
    return (
      <section className="contact-section" id="contact-form">
        <div className="section-shell">
          <div className="contact-success reveal" ref={ref}>
            <span className="contact-success-icon"><CheckCircle2 size={48} strokeWidth={1.25} /></span>
            <p>{form.success}</p>
            <button className="outline-button" type="button" onClick={() => setStatus('idle')}>
              {form.another}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-section" id="contact-form">
      <div className="section-shell">
        <div className="contact-layout reveal" ref={ref}>
          <div className="contact-heading">
            <span className="section-kicker"><i />{form.title}</span>
            <h2>{form.title}</h2>
            <p>{form.subtitle}</p>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-field">
                <span>{form.name}</span>
                <input type="text" name="name" placeholder={form.namePlaceholder} required autoComplete="name" />
              </label>
              <label className="form-field">
                <span>{form.email}</span>
                <input type="email" name="email" placeholder={form.emailPlaceholder} required autoComplete="email" dir="ltr" />
              </label>
            </div>
            <label className="form-field">
              <span>{form.phone}</span>
              <input type="tel" name="phone" placeholder={form.phonePlaceholder} autoComplete="tel" dir="ltr" />
            </label>
            <label className="form-field">
              <span>{form.message}</span>
              <textarea name="message" placeholder={form.messagePlaceholder} required rows={5} />
            </label>
            {status === 'error' && (
              <div className="form-error">
                <AlertCircle size={18} /> {errorMsg || form.error}
              </div>
            )}
            <button type="submit" className="donate-button contact-submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? (
                <><Loader2 size={18} className="spin" /> {form.submitting}</>
              ) : (
                <>{form.submit} <Send size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
