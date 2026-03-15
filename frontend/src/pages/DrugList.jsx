import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { drugAPI, familyAPI } from '../api';
import { Pill, Plus, Search, Loader2 } from 'lucide-react';

export default function DrugList() {
  const { user } = useAuth();
  const isElderly = user?.role === 'elderly';
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [elderlyList, setElderlyList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (user?.role === 'family') {
      familyAPI.getMyElderly().then(res => {
        setElderlyList(res.data);
        if (res.data.length > 0) {
          setSelectedUserId(res.data[0].id);
        }
      }).catch(() => {});
    } else {
      loadDrugs();
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) loadDrugs(selectedUserId);
  }, [selectedUserId]);

  const loadDrugs = async (userId) => {
    setLoading(true);
    try {
      const res = await drugAPI.getAll(userId);
      setDrugs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = drugs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className={`${isElderly ? 'text-2xl sm:text-elder-2xl' : 'text-xl sm:text-2xl'} font-bold text-gray-800`}>
          {isElderly ? '我的药品' : '药品管理'}
        </h1>
        <Link to="/recognize"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm sm:text-base active:scale-95 shadow whitespace-nowrap">
          <Plus className="w-5 h-5" /> 添加
        </Link>
      </div>

      {/* 家属选人 */}
      {user?.role === 'family' && elderlyList.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {elderlyList.map(e => (
            <button key={e.id} onClick={() => setSelectedUserId(e.id)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap active:scale-95 transition ${
                selectedUserId === e.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border'
              }`}>
              {e.display_name}
            </button>
          ))}
        </div>
      )}

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索药品名称..."
          className={`w-full pl-12 pr-4 ${isElderly ? 'py-3 sm:py-4 text-base sm:text-elder-base' : 'py-3 text-base'} border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none`}
        />
      </div>

      {/* 药品列表 */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Pill className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className={`${isElderly ? 'text-base sm:text-elder-base' : 'text-base sm:text-lg'} text-gray-500`}>
            {search ? '没有找到匹配的药品' : '还没有添加药品，去拍照识药吧'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(drug => (
            <Link key={drug.id} to={`/drugs/${drug.id}`}
              className="card-elder hover:shadow-lg transition flex items-center gap-3 active:scale-[0.98]">
              {drug.image_path ? (
                <img src={`/uploads/${drug.image_path}`} alt={drug.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Pill className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className={`${isElderly ? 'text-lg sm:text-elder-lg' : 'text-base sm:text-lg'} font-bold text-gray-800 truncate`}>
                  {drug.name}
                </div>
                {drug.specification && (
                  <div className="text-gray-500 text-xs sm:text-sm">{drug.specification}</div>
                )}
                {drug.efficacy_simple && (
                  <div className={`text-xs sm:text-sm text-green-600 mt-0.5 truncate`}>
                    {drug.efficacy_simple}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
