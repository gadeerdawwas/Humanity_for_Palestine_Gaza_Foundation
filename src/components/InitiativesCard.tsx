import {
  ArrowUpLeft,
  ArrowUpRight,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

type InitiativeItem = {
  id: string;
  title: string;
  category: string;
  accent: string;
  status: 'ongoing' | 'completed';
  image: string;
  description: string;
};

type InitiativesCardProps = {
  item: InitiativeItem;
  learnMore: string;
  statusOngoing: string;
  statusCompleted: string;
  language: 'ar' | 'en';
};

export function InitiativesCard({
  item,
  learnMore,
  statusOngoing,
  statusCompleted,
  language,
}: InitiativesCardProps) {
  const navigate = useNavigate();

  const Arrow =
    language === 'ar'
      ? ArrowUpLeft
      : ArrowUpRight;

  const statusLabel =
    item.status === 'ongoing'
      ? statusOngoing
      : statusCompleted;

  const openDetails = () => {
    navigate(`/initiatives/${item.id}`);
  };

  return (
    <article
      className={`project-card accent-${item.accent}`}
    >
      <div className="project-cover">

        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
          />
        ) : (
          <div className="project-cover-placeholder" />
        )}

        <span
          className={`project-status ${item.status}`}
        >
          <i />
          {statusLabel}
        </span>
      </div>

      <div className="project-body">

        <span className="project-tag">
          {item.category}
        </span>

        <h3>{item.title}</h3>

        <p>{item.description}</p>

        <button
          className="project-link"
          type="button"
          onClick={openDetails}
        >
          {learnMore}

          <Arrow size={15} />
        </button>

      </div>
    </article>
  );
}