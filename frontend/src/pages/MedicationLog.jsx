import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reminderAPI, familyAPI } from '../api';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Bell, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function MedicationLog() {
  const { user } = useAuth();
  const isElderly = user?.role === 'elderly';

  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elderlyList, setElderlyList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (user?.role === 'family') {
      familyAPI.getMyElderly().then(res => {
        setElderlyList(res.data);
        if (res.data.length > 0) setSelectedUserId(res.data[0].id);
      }).catch(() => {});
    } else {
      loadData();
    }
  }, []);

  useEffect(() => {
    if (selectedUserId || user?.role === 'elderly') loadData();
  }, [selectedUserId, date]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await reminderAPI.getTodayStatus(selectedUserId);
      setTodayStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prevDay = () => setDate(dayjs(date).subtract(1, 'day').format('YYYY-MM-DD'));
  const nextDay = () => {
    const next = dayjs(date).add(1, 'day');
    if (next.isBefore(dayjs().add(1, 'day'))) {
      setDate(next.format('YYYY-MM-DD'));
    }
  };
  const isToday = date === dayjs().format('YYYY-MM-DD');

  const getStatusInfo = (status) => {
    switch (status) {
      case 'taken': return { icon: CheckCircle, text: '已服药', color: 'text-green-600', bg: 'bg-green-100' };
      case 'late': return { icon: Clock, text: '迟服', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'missed': return { icon: AlertTriangle, text: '漏服', color: 'text-red-600', bg: 'bg-red-100' };
      default: return { icon: Bell, text: '待服药', color: 'text-orange-500', bg: 'bg-orange-100' };
    }
  };

  const getMealText = (meal) => {
    const map = { before_meal: '饭前', after_meal: '饭后', empty_stomach: '空腹', before_sleep: '睡前' };
    return map[meal] || '';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className={`${isElderly ? 'text-2xl sm:text-elder-2xl' : 'text-xl sm:text-2xl'} font-bold text-gray-800`}>
        服药记录
      </h1>

      {/* 家属选人 */}
      {user?.role === 'family' && elderlyList.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {elderlyList.map(e => (
            <button key={e.id} onClick={() => setSelectedUserId(e.id)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${
                selectedUserId === e.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border hover:border-blue-300'
              }`}>
              {e.display_name}
            </button>
          ))}
        </div>
      )}

      {/* 日期选择 */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prevDay}
          className={`p-3 rounded-xl ${isElderly ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'} hover:bg-orange-200`}>
          <ChevronLeft className={isElderly ? 'w-8 h-8' : 'w-6 h-6'} />
        </button>
        <div className={`${isElderly ? 'text-elder-xl' : 'text-xl'} font-bold text-gray-800 min-w-[200px] text-center`}>
          {isToday ? '今天' : date}
        </div>
        <button onClick={nextDay} disabled={isToday}
          className={`p-3 rounded-xl ${isElderly ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'} hover:bg-orange-200 disabled:opacity-30`}>
          <ChevronRight className={isElderly ? 'w-8 h-8' : 'w-6 h-6'} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
      ) : todayStatus ? (
        <div className="space-y-4">
          {/* 统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card-elder text-center border-green-200">
              <div className={`${isElderly ? 'text-elder-2xl' : 'text-3xl'} font-bold text-green-600`}>{todayStatus.taken}</div>
              <div className={`${isElderly ? 'text-elder-sm' : 'text-sm'} text-gray-500`}>已服药</div>
            </div>
            <div className="card-elder text-center border-orange-200">
              <div className={`${isElderly ? 'text-elder-2xl' : 'text-3xl'} font-bold text-orange-500`}>{todayStatus.pending}</div>
              <div className={`${isElderly ? 'text-elder-sm' : 'text-sm'} text-gray-500`}>待服药</div>
            </div>
            <div className="card-elder text-center border-red-200">
              <div className={`${isElderly ? 'text-elder-2xl' : 'text-3xl'} font-bold text-red-500`}>{todayStatus.missed}</div>
              <div className={`${isElderly ? 'text-elder-sm' : 'text-sm'} text-gray-500`}>已漏服</div>
            </div>
          </div>

          {/* 明细 */}
          {todayStatus.items.length === 0 ? (
            <div className="card-elder text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">这一天没有服药记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayStatus.items.map((item) => {
                const si = getStatusInfo(item.status);
                const Icon = si.icon;
                return (
                  <div key={item.reminder_id} className="card-elder flex items-center gap-4">
                    <div className={`flex-shrink-0 p-3 ${si.bg} rounded-2xl`}>
                      <Icon className={`w-8 h-8 ${si.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`${isElderly ? 'text-elder-lg' : 'text-lg'} font-bold text-gray-800`}>
                        {item.drug_name}
                      </div>
                      <div className="flex gap-2 items-center text-gray-500 mt-1">
                        <span className="font-medium">{item.reminder_time}</span>
                        {getMealText(item.meal_relation) && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{getMealText(item.meal_relation)}</span>
                        )}
                        <span>{item.dosage}</span>
                      </div>
                    </div>
                    <div className={`flex-shrink-0 px-4 py-2 ${si.bg} rounded-xl`}>
                      <span className={`${si.color} font-bold ${isElderly ? 'text-elder-base' : 'text-sm'}`}>
                        {si.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 完成度进度条 */}
          {todayStatus.total > 0 && (
            <div className="card-elder">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">今日完成度</span>
                <span className="font-bold text-orange-600">
                  {Math.round((todayStatus.taken / todayStatus.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(todayStatus.taken / todayStatus.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
