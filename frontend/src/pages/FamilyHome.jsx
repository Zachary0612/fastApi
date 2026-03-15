import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { familyAPI, reminderAPI } from '../api';
import {
  Users, Camera, Pill, Bell, ClipboardList, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';

export default function FamilyHome() {
  const { user } = useAuth();
  const [elderlyList, setElderlyList] = useState([]);
  const [selectedElderly, setSelectedElderly] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadElderly();
  }, []);

  useEffect(() => {
    if (selectedElderly) {
      loadTodayStatus(selectedElderly.id);
    }
  }, [selectedElderly]);

  const loadElderly = async () => {
    try {
      const res = await familyAPI.getMyElderly();
      setElderlyList(res.data);
      if (res.data.length > 0) {
        setSelectedElderly(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayStatus = async (userId) => {
    try {
      const res = await reminderAPI.getTodayStatus(userId);
      setTodayStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'late': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'missed': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-orange-500" />;
    }
  };

  const getMealText = (meal) => {
    const map = { before_meal: '饭前', after_meal: '饭后', empty_stomach: '空腹', before_sleep: '睡前' };
    return map[meal] || '';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 问候 */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-blue-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {user?.display_name}，欢迎回来
        </h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">管理家人的用药提醒</p>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { to: '/recognize', icon: Camera, label: '识药', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
          { to: '/drugs', icon: Pill, label: '药品', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
          { to: '/reminders', icon: Bell, label: '提醒', bg: 'bg-green-50', iconColor: 'text-green-500' },
          { to: '/family', icon: Users, label: '家庭', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`${item.bg} rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:shadow-md transition active:scale-95 border border-transparent hover:border-gray-200`}
          >
            <item.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${item.iconColor}`} />
            <span className="font-medium text-gray-700 text-sm sm:text-base">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* 老人选择与状态 */}
      {elderlyList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 text-center">
          <Users className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-base sm:text-lg text-gray-500 mb-4">还没有绑定老人账户</p>
          <Link
            to="/family"
            className="inline-block px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition active:scale-95"
          >
            去绑定老人
          </Link>
        </div>
      ) : (
        <>
          {/* 老人切换 */}
          {elderlyList.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {elderlyList.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedElderly(e)}
                  className={`px-4 py-2 sm:px-5 sm:py-3 rounded-2xl font-bold whitespace-nowrap transition active:scale-95 ${
                    selectedElderly?.id === e.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {e.display_name}
                </button>
              ))}
            </div>
          )}

          {/* 今日状态 */}
          {todayStatus && (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {selectedElderly?.display_name} 今日服药
              </h2>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-green-50 rounded-2xl p-3 sm:p-4 text-center border border-green-200">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{todayStatus.taken}</div>
                  <div className="text-xs sm:text-sm text-green-700">已服药</div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-3 sm:p-4 text-center border border-orange-200">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500">{todayStatus.pending}</div>
                  <div className="text-xs sm:text-sm text-orange-700">待服药</div>
                </div>
                <div className="bg-red-50 rounded-2xl p-3 sm:p-4 text-center border border-red-200">
                  <div className="text-2xl sm:text-3xl font-bold text-red-500">{todayStatus.missed}</div>
                  <div className="text-xs sm:text-sm text-red-700">已漏服</div>
                </div>
              </div>

              {/* 用卡片列表替代表格，移动端友好 */}
              {todayStatus.items.length > 0 && (
                <div className="space-y-2">
                  {todayStatus.items.map((item) => (
                    <div key={item.reminder_id} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center gap-3">
                      <div className="flex-shrink-0 w-14 text-center">
                        <div className="text-base sm:text-lg font-bold text-gray-800">{item.reminder_time}</div>
                        {getMealText(item.meal_relation) && (
                          <div className="text-xs text-gray-400">{getMealText(item.meal_relation)}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.drug_name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{item.dosage}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getStatusIcon(item.status)}
                        <span className="text-xs sm:text-sm font-medium">
                          {item.status === 'taken' ? '已服' :
                           item.status === 'late' ? '迟服' :
                           item.status === 'missed' ? '漏服' : '待服'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
