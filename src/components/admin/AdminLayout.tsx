import {
  ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  NavLink,
  useNavigate,
} from 'react-router-dom';

import { supabase } from '@/lib/supabase';

import {
  BarChart3,
  FolderKanban,
  HandHeart,
  Handshake,
  HeartHandshake,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';

interface Props {
  children: ReactNode;
  title: string;
}

const menu = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    path: '/admin/projects',
    icon: FolderKanban,
  },
  {
    name: 'Initiatives',
    path: '/admin/initiatives',
    icon: HandHeart,
  },
  {
    name: 'Gallery',
    path: '/admin/gallery',
    icon: Images,
  },
  {
    name: 'Services',
    path: '/admin/services',
    icon: HeartHandshake,
  },
  {
    name: 'Messages',
    path: '/admin/messages',
    icon: Mail,
  },
  {
    name: 'Impact Stats',
    path: '/admin/impact',
    icon: BarChart3,
  },
  {
    name: 'Partners',
    path: '/admin/partners',
    icon: Handshake,
  },
  {
    name: 'Subscribers',
    path: '/admin/subscribers',
    icon: Users,
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
];

export function AdminLayout({
  children,
  title,
}: Props) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [logoUrl, setLogoUrl] =
    useState('');

  useEffect(() => {
    const loadLogo = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_logo_url')
        .maybeSingle();

      if (error) {
        console.error(
          'LOAD ADMIN LOGO ERROR:',
          error
        );
        return;
      }

      setLogoUrl(
        data?.value?.trim() || ''
      );
    };

    loadLogo();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F6F7F4] flex">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky
          top-0 left-0 z-50

          w-72 h-screen

          bg-[#073B2A]
          text-white

          flex flex-col

          transform
          transition-transform
          duration-300

          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }

          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div
          className="
            h-20
            shrink-0
            flex
            items-center
            justify-between
            px-5
            border-b
            border-white/10
          "
        >
          <div className="flex items-center gap-3 min-w-0">

            {logoUrl ? (
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Humanity for Palestine"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="
                  w-11 h-11
                  shrink-0
                  rounded-xl
                  bg-white/10
                  flex items-center
                  justify-center
                  font-bold
                  text-[#E2C47F]
                "
              >
                H
              </div>
            )}

            <div className="min-w-0">
              <h2 className="font-bold text-[15px] leading-tight text-white truncate">
                Humanity for Palestine
              </h2>

              <span className="text-[11px] text-white/55">
                Administration
              </span>
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path ===
                  '/admin'
                }
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({
                  isActive,
                }) =>
                  `
                    flex
                    items-center
                    gap-3

                    px-4
                    py-2.5

                    rounded-xl

                    transition-all
                    duration-200

                    ${
                      isActive
                        ? 'bg-white text-[#073B2A] font-semibold shadow-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `
                }
              >
                <Icon size={19} />

                <span>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="
            shrink-0
            p-4
            border-t
            border-white/10
          "
        >
          <button
            type="button"
            onClick={logout}
            className="
              w-full

              flex
              items-center
              gap-3

              px-4
              py-3

              rounded-xl

              text-white/80

              hover:bg-red-500/20
              hover:text-white

              transition
            "
          >
            <LogOut size={20} />

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <header
          className="
            h-20
            bg-white

            border-b
            border-gray-200

            flex
            items-center
            justify-between

            px-5
            lg:px-8
          "
        >
          <div className="flex items-center gap-4">

            <button
              type="button"
              className="lg:hidden"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open sidebar"
            >
              <Menu size={25} />
            </button>

            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#073B2A]">
                {title}
              </h1>

              <p className="text-xs text-gray-400 hidden sm:block">
                Humanity for Palestine – Gaza
              </p>
            </div>
          </div>

          {/* Header Logo */}
          {logoUrl ? (
            <div className="h-11 w-11 rounded-xl bg-[#F7F5EE] border border-gray-100 flex items-center justify-center overflow-hidden p-1.5">
              <img
                src={logoUrl}
                alt="Humanity for Palestine"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="
                h-10
                w-10

                rounded-full

                bg-[#073B2A]
                text-white

                flex
                items-center
                justify-center

                font-bold
              "
            >
              H
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}