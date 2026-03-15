import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Pill, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full mb-3">
            <Pill className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">智能用药提醒</h1>
          <p className="text-gray-500 mt-1 text-base sm:text-lg">登录您的账户</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-center text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-400 focus:outline-none transition"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">密码</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-400 focus:outline-none transition pr-14"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-500 text-white text-xl font-bold rounded-2xl hover:bg-orange-600 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <p className="text-center mt-6 text-lg text-gray-500">
          还没有账户？
          <Link to="/register" className="text-orange-500 font-bold hover:underline ml-1">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
