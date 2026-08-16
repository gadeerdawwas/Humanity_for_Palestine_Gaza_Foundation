import { BookOpen, HeartHandshake, HeartPulse, Plus } from 'lucide-react';

type ServiceItem = { number: string; title: string; description: string; accent: string; icon: string };

const icons = { heart: HeartHandshake, hands: HeartPulse, book: BookOpen, plus: Plus };

type ServiceCardProps = { item: ServiceItem };

export function ServiceCard({ item }: ServiceCardProps) {
  const Icon = icons[item.icon as keyof typeof icons];
  return (
    <article className={`service-card accent-${item.accent}`}>
      <div className="service-card-top"><span className="service-number">{item.number}</span><span className="service-icon"><Icon size={28} strokeWidth={1.35} /></span></div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <span className="service-card-detail" aria-hidden="true" />
    </article>
  );
}
