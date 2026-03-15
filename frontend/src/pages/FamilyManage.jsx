import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { familyAPI } from '../api';
import { Users, UserPlus, Unlink, Loader2 } from 'lucide-react';

export default function FamilyManage() {
  const { user } = useAuth();
  const isFamily = user?.role === 'family';

  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bindForm, setBindForm] = useState({ elderly_username: '', relation_name: '家属' });
  const [binding, setBinding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRelations();
  }, []);

  const loadRelations = async () => {
    setLoading(true);
    try {
      if (isFamily) {
        const res = await familyAPI.getMyElderly();
        setRelations(res.data);
      } else {
        const res = await familyAPI.getMyFamily();
        setRelations(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBind = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBinding(true);
    try {
      await familyAPI.bind(bindForm);
      setSuccess('绑定成功！');
      setBindForm({ elderly_username: '', relation_name: '家属' });
      loadRelations();
    } catch (err) {
      setError(err.response?.data?.detail || '绑定失败');
    } finally {
      setBinding(false);
    }
  };

  const handleUnbind = async (elderlyId) => {
    if (!confirm('确定要解除绑定吗？')) return;
    try {
      await familyAPI.unbind(elderlyId);
      loadRelations();
    } catch (err) {
      alert('解绑失败');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">家庭管理</h1>

      {/* 绑定表单 - 仅家属 */}
      {isFamily && (
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-500" />
            绑定老人账户
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl mb-4">{success}</div>
          )}

          <form onSubmit={handleBind} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">老人的用户名</label>
              <input
                type="text"
                value={bindForm.elderly_username}
                onChange={(e) => setBindForm({ ...bindForm, elderly_username: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-400 focus:outline-none"
                placeholder="请输入老人注册时的用户名"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">您与老人的关系</label>
              <select
                value={bindForm.relation_name}
                onChange={(e) => setBindForm({ ...bindForm, relation_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-400 focus:outline-none"
              >
                <option value="儿子">儿子</option>
                <option value="女儿">女儿</option>
                <option value="儿媳">儿媳</option>
                <option value="女婿">女婿</option>
                <option value="孙子">孙子</option>
                <option value="孙女">孙女</option>
                <option value="家属">家属</option>
                <option value="护工">护工</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={binding}
              className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl text-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {binding ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {binding ? '绑定中...' : '绑定老人'}
            </button>
          </form>
        </div>
      )}

      {/* 已绑定列表 */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-500" />
          {isFamily ? '已绑定的老人' : '我的家属'}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : relations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {isFamily ? '还没有绑定老人，请在上方输入老人用户名进行绑定' : '还没有家属绑定您的账户'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {relations.map(person => (
              <div key={person.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <div className="font-bold text-gray-800 text-lg">{person.display_name}</div>
                  <div className="text-sm text-gray-500">
                    用户名：{person.username}
                    {person.phone && ` · 手机：${person.phone}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    角色：{person.role === 'elderly' ? '老人' : '家属'}
                  </div>
                </div>
                {isFamily && (
                  <button
                    onClick={() => handleUnbind(person.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 font-medium"
                  >
                    <Unlink className="w-4 h-4" /> 解绑
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-3">💡 使用说明</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• 家属可以绑定多位老人，帮助他们管理药品和提醒</li>
          <li>• 绑定后，您可以帮老人拍照识别药品、创建吃药提醒</li>
          <li>• 您可以随时查看老人的服药记录，了解是否有漏服情况</li>
          <li>• 老人端会以大字体、语音播报的方式接收提醒</li>
        </ul>
      </div>
    </div>
  );
}
