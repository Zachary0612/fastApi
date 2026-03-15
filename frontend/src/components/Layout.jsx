import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, Camera, Pill, Bell, ClipboardList, Users, LogOut
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isElderly = user?.role === 'elderly';

  const elderlyNav = [
    { path: '/', label: '首页', icon: Home },
    { path: '/recognize', label: '识药', icon: Camera },
    { path: '/reminders', label: '提醒', icon: Bell },
    { path: '/drugs', label: '药品', icon: Pill },
    { path: '/logs', label: '记录', icon: ClipboardList },
  ];

  const familyNav = [
    { path: '/', label: '首页', icon: Home },
    { path: '/recognize', label: '识药', icon: Camera },
    { path: '/reminders', label: '提醒', icon: Bell },
    { path: '/drugs', label: '药品', icon: Pill },
    { path: '/family', label: '家庭', icon: Users },
  ];

  const sideNavItems = isElderly ? [
    { path: '/', label: '首页', icon: Home },
    { path: '/recognize', label: '拍照识药', icon: Camera },
    { path: '/drugs', label: '我的药品', icon: Pill },
    { path: '/reminders', label: '吃药提醒', icon: Bell },
    { path: '/logs', label: '服药记录', icon: ClipboardList },
  ] : [
    { path: '/', label: '首页', icon: Home },
    { path: '/recognize', label: '拍照识药', icon: Camera },
    { path: '/drugs', label: '药品管理', icon: Pill },
    { path: '/reminders', label: '提醒管理', icon: Bell },
    { path: '/logs', label: '服药记录', icon: ClipboardList },
    { path: '/family', label: '家庭管理', icon: Users },
  ];

  const bottomNav = isElderly ? elderlyNav : familyNav;

  return (
    <div className={`min-h-screen bg-elder-bg ${isElderly ? 'elder-mode' : ''}`}>
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Pill className={`${isElderly ? 'w-10 h-10' : 'w-7 h-7'} text-orange-500`} />
            <span className={`font-bold text-orange-600 ${isElderly ? 'text-xl' : 'text-lg'}`}>
              智能用药提醒
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className={`${isElderly ? 'text-base' : 'text-sm'} text-gray-600 max-w-[120px] truncate`}>
              {user?.display_name}
            </span>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              {isElderly ? '老人' : '家属'}
            </span>

            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              aria-label="退出登录"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">退出</span>
            </button>

            <button
              onClick={logout}
              className="sm:hidden p-2 text-gray-400 hover:text-red-500 rounded-lg"
              aria-label="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 主体内容区域 */}
      <div className="flex">
        {/* 桌面端侧边栏 - 仅 sm 及以上显示 */}
        <nav className="hidden sm:flex flex-col w-56 min-h-[calc(100vh-64px)] bg-white shadow-md p-4 gap-2 flex-shrink-0">
          {sideNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                location.pathname === item.path
                  ? 'bg-orange-100 text-orange-700 font-bold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${isElderly ? 'text-lg py-4' : 'text-base'}`}
            >
              <item.icon className={isElderly ? 'w-7 h-7' : 'w-5 h-5'} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 页面内容 - 移动端底部预留安全间距 */}
        <main className="flex-1 p-4 sm:p-6 pb-28 sm:pb-6 max-w-6xl w-full">
          {children}
        </main>
      </div>

      {/* ========== 移动端底部 Tab 导航栏 ========== */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-stretch justify-around">
          {bottomNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors relative ${
                  isActive ? 'text-orange-600' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-orange-500 rounded-b-full" />
                )}
                <item.icon className={`${isElderly ? 'w-8 h-8' : 'w-6 h-6'} ${isActive ? 'text-orange-600' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`${isElderly ? 'text-sm mt-1' : 'text-xs mt-0.5'} font-medium ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
