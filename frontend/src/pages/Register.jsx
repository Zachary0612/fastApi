import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Pill, UserPlus } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    display_name: '',
    role: 'elderly',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full mb-3">
            <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">注册账户</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-center text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">用户名</label>
            <input
              type="text" name="username" value={form.username} onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-400 focus:outline-none"
              placeholder="请输入用户名" required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-400 focus:outline-none"
              placeholder="请输入密码" required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">姓名 / 昵称</label>
            <input
              type="text" name="display_name" value={form.display_name} onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-400 focus:outline-none"
              placeholder="请输入您的姓名" required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">手机号（选填）</label>
            <input
              type="tel" name="phone" value={form.phone} onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-400 focus:outline-none"
              placeholder="请输入手机号"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">您的身份</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'elderly' })}
                className={`py-4 rounded-2xl text-lg font-bold border-2 transition ${
                  form.role === 'elderly'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                👴 老人
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'family' })}
                className={`py-4 rounded-2xl text-lg font-bold border-2 transition ${
                  form.role === 'family'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                👨‍👩‍👧 家属
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-orange-500 text-white text-xl font-bold rounded-2xl hover:bg-orange-600 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>

        <p className="text-center mt-6 text-lg text-gray-500">
          已有账户？
          <Link to="/login" className="text-orange-500 font-bold hover:underline ml-1">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
