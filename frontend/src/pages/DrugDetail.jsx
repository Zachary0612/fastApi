import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { drugAPI, reminderAPI } from '../api';
import { Volume2, Edit3, Trash2, Bell, ArrowLeft, Loader2 } from 'lucide-react';

export default function DrugDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isElderly = user?.role === 'elderly';
  const audioRef = useRef(null);

  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadDrug();
  }, [id]);

  const loadDrug = async () => {
    try {
      const res = await drugAPI.getOne(id);
      setDrug(res.data);
      setEditForm(res.data);
    } catch (err) {
      alert('加载失败');
      navigate('/drugs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await drugAPI.update(id, editForm);
      setEditing(false);
      loadDrug();
    } catch (err) {
      alert('更新失败');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个药品吗？')) return;
    try {
      await drugAPI.delete(id);
      navigate('/drugs');
    } catch (err) {
      alert('删除失败');
    }
  };

  const playDrugAudio = async () => {
    try {
      const res = await drugAPI.getAudio(id);
      if (audioRef.current) {
        audioRef.current.src = res.data.url;
        audioRef.current.play();
      }
    } catch {
      // 回退到浏览器 TTS
      if ('speechSynthesis' in window && drug) {
        const text = `药品名称：${drug.name}。${drug.efficacy_simple || ''}。${drug.usage_simple || ''}。${drug.caution_simple || ''}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleAutoReminder = async () => {
    try {
      const res = await reminderAPI.autoGenerate(id);
      if (confirm(`${res.data.description}\n\n是否创建这些提醒？`)) {
        await reminderAPI.createBatch(res.data.reminders);
        alert('提醒已创建！');
        navigate('/reminders');
      }
    } catch (err) {
      alert('生成提醒失败');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  if (!drug) return null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <audio ref={audioRef} className="hidden" />

      {/* 返回 */}
      <button onClick={() => navigate('/drugs')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 active:scale-95">
        <ArrowLeft className="w-5 h-5" /> 返回药品列表
      </button>

      {/* 药品头部 */}
      <div className="card-elder border-orange-200">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className={`${isElderly ? 'text-2xl sm:text-elder-2xl' : 'text-xl sm:text-2xl'} font-bold text-orange-600`}>
              {drug.name}
            </h1>
            {drug.specification && (
              <p className="text-gray-500 mt-1 text-sm sm:text-base">规格：{drug.specification}</p>
            )}
          </div>
          {drug.image_path && (
            <img src={`/uploads/${drug.image_path}`} alt={drug.name}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-gray-200 flex-shrink-0" />
          )}
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 mt-4">
          <button onClick={playDrugAudio}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium active:scale-95 text-sm sm:text-base">
            <Volume2 className="w-5 h-5" /> 语音播报
          </button>
          <button onClick={handleAutoReminder}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-100 text-green-700 rounded-xl font-medium active:scale-95 text-sm sm:text-base">
            <Bell className="w-5 h-5" /> 生成提醒
          </button>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium active:scale-95 text-sm sm:text-base">
            <Edit3 className="w-5 h-5" /> 编辑
          </button>
          <button onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium active:scale-95 text-sm sm:text-base">
            <Trash2 className="w-5 h-5" /> 删除
          </button>
        </div>
      </div>

      {editing ? (
        /* 编辑模式 */
        <div className="space-y-4">
          {[
            { key: 'name', label: '药品名称' },
            { key: 'specification', label: '规格' },
            { key: 'efficacy', label: '功效（原文）' },
            { key: 'efficacy_simple', label: '功效（简化）' },
            { key: 'usage_dosage', label: '用法用量（原文）' },
            { key: 'usage_simple', label: '用法用量（简化）' },
            { key: 'frequency', label: '频率' },
            { key: 'caution', label: '注意事项（原文）' },
            { key: 'caution_simple', label: '注意事项（简化）' },
            { key: 'notes', label: '备注' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block font-medium text-gray-700 mb-1">{label}</label>
              <textarea
                value={editForm[key] || ''}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                rows={2}
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={handleUpdate}
              className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">
              保存修改
            </button>
            <button onClick={() => { setEditing(false); setEditForm(drug); }}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">
              取消
            </button>
          </div>
        </div>
      ) : (
        /* 展示模式 */
        <div className="space-y-4">
          {drug.efficacy_simple && (
            <InfoCard
              title="💊 功效说明" original={drug.efficacy} simplified={drug.efficacy_simple}
              color="green" isElderly={isElderly}
              onSpeak={() => {
                const u = new SpeechSynthesisUtterance(drug.efficacy_simple);
                u.lang = 'zh-CN'; u.rate = 0.8; speechSynthesis.speak(u);
              }}
            />
          )}
          {drug.usage_simple && (
            <InfoCard
              title="📋 用法用量" original={drug.usage_dosage} simplified={drug.usage_simple}
              color="blue" isElderly={isElderly}
              onSpeak={() => {
                const u = new SpeechSynthesisUtterance(drug.usage_simple);
                u.lang = 'zh-CN'; u.rate = 0.8; speechSynthesis.speak(u);
              }}
            />
          )}
          {drug.caution_simple && (
            <InfoCard
              title="⚠️ 注意事项" original={drug.caution} simplified={drug.caution_simple}
              color="red" isElderly={isElderly}
              onSpeak={() => {
                const u = new SpeechSynthesisUtterance(drug.caution_simple);
                u.lang = 'zh-CN'; u.rate = 0.8; speechSynthesis.speak(u);
              }}
            />
          )}
          {drug.notes && (
            <div className="card-elder">
              <span className="font-bold text-gray-700">📝 备注</span>
              <p className="mt-2 text-gray-600">{drug.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, original, simplified, color, isElderly, onSpeak }) {
  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`card-elder ${c.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-700">{title}</span>
        <button onClick={onSpeak}
          className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200" aria-label="朗读">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
      {original && <p className="text-gray-500 text-sm mb-2">原文：{original}</p>}
      <p className={`${isElderly ? 'text-elder-base' : 'text-lg'} ${c.text} ${c.bg} p-3 rounded-xl font-medium`}>
        {simplified}
      </p>
    </div>
  );
}
