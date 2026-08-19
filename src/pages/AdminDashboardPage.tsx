import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  BarChart3,
  FolderKanban,
  HandHeart,
  Handshake,
  Images,
  Mail,
  Settings,
  Users,
} from 'lucide-react';

import { AdminLayout } from '../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

type DashboardStats = {
  projects: number;
  initiatives: number;
  images: number;
  messages: number;
  partners: number;
  subscribers: number;
};

const initialStats: DashboardStats = {
  projects: 0,
  initiatives: 0,
  images: 0,
  messages: 0,
  partners: 0,
  subscribers: 0,
};

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState<DashboardStats>(initialStats);

  useEffect(() => {
    loadStats();
  }, []);

  const getCount = async (
    table: string
  ) => {
    const { count, error } =
      await supabase
        .from(table)
        .select('*', {
          count: 'exact',
          head: true,
        });

    if (error) {
      console.error(
        `DASHBOARD COUNT ERROR (${table}):`,
        error
      );

      return 0;
    }

    return count ?? 0;
  };

  const loadStats = async () => {
    setLoading(true);

    const [
      projects,
      initiatives,
      images,
      messages,
      partners,
      subscribers,
    ] = await Promise.all([
      getCount('projects'),
      getCount('initiatives'),
      getCount('gallery_images'),
      getCount('contact_messages'),
      getCount('partners'),
      getCount('newsletter_subscribers'),
    ]);

    setStats({
      projects,
      initiatives,
      images,
      messages,
      partners,
      subscribers,
    });

    setLoading(false);
  };

  const cards = [
    {
      title: 'Projects',
      description:
        'Future and funded projects',
      value: stats.projects,
      icon: FolderKanban,
      path: '/admin/projects',
      tone: 'green',
    },
    {
      title: 'Initiatives',
      description:
        'Humanitarian work on the ground',
      value: stats.initiatives,
      icon: HandHeart,
      path: '/admin/initiatives',
      tone: 'gold',
    },
    {
      title: 'Gallery',
      description:
        'Published field images',
      value: stats.images,
      icon: Images,
      path: '/admin/gallery',
      tone: 'blue',
    },
    {
      title: 'Partners',
      description:
        'Organizations and supporters',
      value: stats.partners,
      icon: Handshake,
      path: '/admin/partners',
      tone: 'purple',
    },
    {
      title: 'Messages',
      description:
        'Visitor contact messages',
      value: stats.messages,
      icon: Mail,
      path: '/admin/messages',
      tone: 'red',
    },
    {
      title: 'Subscribers',
      description:
        'Newsletter subscribers',
      value: stats.subscribers,
      icon: Users,
      path: '/admin/subscribers',
      tone: 'teal',
    },
  ];

  const toneClasses: Record<
    string,
    {
      icon: string;
      soft: string;
      border: string;
    }
  > = {
    green: {
      icon: 'text-[#0C4A2E]',
      soft: 'bg-[#0C4A2E]/10',
      border:
        'hover:border-[#0C4A2E]/20',
    },

    gold: {
      icon: 'text-[#B8872B]',
      soft: 'bg-[#C69A46]/12',
      border:
        'hover:border-[#C69A46]/25',
    },

    blue: {
      icon: 'text-[#356D8D]',
      soft: 'bg-[#356D8D]/10',
      border:
        'hover:border-[#356D8D]/20',
    },

    purple: {
      icon: 'text-[#735C8C]',
      soft: 'bg-[#735C8C]/10',
      border:
        'hover:border-[#735C8C]/20',
    },

    red: {
      icon: 'text-[#B64B4B]',
      soft: 'bg-[#B64B4B]/10',
      border:
        'hover:border-[#B64B4B]/20',
    },

    teal: {
      icon: 'text-[#287A72]',
      soft: 'bg-[#287A72]/10',
      border:
        'hover:border-[#287A72]/20',
    },
  };

  const quickActions = [
    {
      title: 'Manage Projects',
      description:
        'Add, edit and organize future projects and funding details.',
      icon: FolderKanban,
      path: '/admin/projects',
    },
    {
      title: 'Manage Initiatives',
      description:
        'Manage completed and ongoing humanitarian initiatives.',
      icon: HandHeart,
      path: '/admin/initiatives',
    },
    {
      title: 'Manage Gallery',
      description:
        'Upload, reorder and manage images from the field.',
      icon: Images,
      path: '/admin/gallery',
    },
    {
      title: 'Manage Partners',
      description:
        'Add partner organizations, supporters and logos.',
      icon: Handshake,
      path: '/admin/partners',
    },
    {
      title: 'Impact Statistics',
      description:
        'Update the numbers displayed in the impact section.',
      icon: BarChart3,
      path: '/admin/impact',
    },
    {
      title: 'Website Settings',
      description:
        'Update branding, contact information and website content.',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const totalContent =
    stats.projects +
    stats.initiatives +
    stats.images;

  return (
    <AdminLayout title="Dashboard">

      {/* HERO */}
      <section
        className="
          relative
          overflow-hidden
          rounded-[26px]
          bg-[#073B2A]
          text-white
          px-6
          py-7
          lg:px-8
          lg:py-8
          shadow-[0_18px_45px_rgba(7,59,42,0.12)]
          mb-7
        "
      >
        <div
          className="
            absolute
            -top-24
            -right-20
            w-64
            h-64
            rounded-full
            border
            border-[#C69A46]/20
          "
        />

        <div
          className="
            absolute
            -bottom-28
            right-24
            w-56
            h-56
            rounded-full
            bg-white/[0.03]
          "
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div>
            <span
              className="
                inline-flex
                items-center
                gap-2
                text-[11px]
                uppercase
                tracking-[0.16em]
                text-[#E2C47F]
                font-semibold
                mb-3
              "
            >
              Humanity for Palestine – Gaza
            </span>

            <h2
              className="
                text-2xl
                md:text-3xl
                font-bold
                leading-tight
              "
            >
              Welcome back
            </h2>

            <p
              className="
                mt-2
                text-sm
                md:text-base
                text-white/65
                max-w-xl
                leading-7
              "
            >
              Manage your humanitarian website, update field activities,
              and keep your public information accurate and up to date.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-3
              min-w-[250px]
            "
          >
            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.06]
                px-5
                py-4
                backdrop-blur-sm
              "
            >
              <span className="text-xs text-white/55">
                Content Items
              </span>

              <strong className="block mt-1 text-2xl">
                {loading
                  ? '...'
                  : totalContent}
              </strong>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-[#C69A46]/25
                bg-[#C69A46]/10
                px-5
                py-4
              "
            >
              <span className="text-xs text-[#EBD69E]">
                Partners
              </span>

              <strong className="block mt-1 text-2xl text-white">
                {loading
                  ? '...'
                  : stats.partners}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1F2925]">
              Website Overview
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Quick view of the main website content.
            </p>
          </div>
        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-6
            gap-4
          "
        >
          {cards.map((card) => {
            const Icon =
              card.icon;

            const tone =
              toneClasses[
                card.tone
              ];

            return (
              <button
                key={card.title}
                type="button"
                onClick={() =>
                  navigate(
                    card.path
                  )
                }
                className={`
                  group
                  bg-white
                  border
                  border-gray-100
                  ${tone.border}
                  rounded-2xl
                  p-5
                  text-left
                  shadow-[0_5px_20px_rgba(28,40,35,0.035)]
                  hover:shadow-[0_12px_28px_rgba(28,40,35,0.075)]
                  hover:-translate-y-1
                  transition-all
                  duration-300
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`
                      w-11
                      h-11
                      rounded-xl
                      ${tone.soft}
                      flex
                      items-center
                      justify-center
                    `}
                  >
                    <Icon
                      size={21}
                      className={
                        tone.icon
                      }
                    />
                  </div>

                  <ArrowRight
                    size={15}
                    className="
                      text-gray-300
                      group-hover:text-[#0C4A2E]
                      group-hover:translate-x-1
                      transition
                    "
                  />
                </div>

                <div className="mt-5">
                  <strong className="text-[30px] leading-none font-bold text-[#073B2A]">
                    {loading
                      ? '...'
                      : card.value}
                  </strong>

                  <h4 className="mt-3 text-sm font-semibold text-gray-800">
                    {card.title}
                  </h4>

                  <p className="mt-1 text-[11px] leading-5 text-gray-400">
                    {
                      card.description
                    }
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* QUICK MANAGEMENT */}
      <section className="mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#1F2925]">
            Quick Management
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Jump directly to the areas you update most often.
          </p>
        </div>

        <div
          className="
            grid
            sm:grid-cols-2
            xl:grid-cols-3
            gap-4
          "
        >
          {quickActions.map(
            (action) => {
              const Icon =
                action.icon;

              return (
                <button
                  key={
                    action.title
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      action.path
                    )
                  }
                  className="
                    group
                    relative
                    overflow-hidden
                    bg-white
                    border
                    border-gray-100
                    rounded-2xl
                    p-5
                    text-left
                    shadow-sm
                    hover:shadow-md
                    hover:border-[#0C4A2E]/15
                    transition-all
                    duration-300
                  "
                >
                  <span
                    className="
                      absolute
                      left-0
                      top-0
                      bottom-0
                      w-[3px]
                      bg-[#C69A46]
                      opacity-0
                      group-hover:opacity-100
                      transition
                    "
                  />

                  <div className="flex items-start gap-4">
                    <div
                      className="
                        w-11
                        h-11
                        shrink-0
                        rounded-xl
                        bg-[#0C4A2E]/8
                        flex
                        items-center
                        justify-center
                        text-[#0C4A2E]
                      "
                    >
                      <Icon
                        size={21}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">
                          {
                            action.title
                          }
                        </h4>

                        <ArrowRight
                          size={14}
                          className="
                            text-gray-300
                            group-hover:text-[#0C4A2E]
                            group-hover:translate-x-1
                            transition
                          "
                        />
                      </div>

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mt-2
                          leading-6
                        "
                      >
                        {
                          action.description
                        }
                      </p>
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>

    </AdminLayout>
  );
}