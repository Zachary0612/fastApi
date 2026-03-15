# 基于图像识别与多模态交互的家庭协同智能用药提醒系统

## 一、项目概述

| 项目信息 | 内容 |
|---------|------|
| **课程名称** | 图形学与多媒体技术 |
| **项目类型** | 课程自选题 / 多媒体辅助系统 |
| **面向对象** | 老年人、视障/听障人士、家属照护者 |
| **团队规模** | 4 人 |
| **项目定位** | 集药品识别、文字语音并行说明、自动提醒与家庭协同管理于一体的智能用药辅助系统 |

## 二、选题背景与要解决的问题

随着人口老龄化加剧，老年人长期服药的场景越来越普遍，但现实中普遍存在以下问题：

- **药品包装相似**——不同药品外包装难以分辨
- **说明书看不清**——字体小、术语多、老人难以理解
- **用法看不懂**——"一日三次、饭后服用"等规则容易混淆
- **提醒不会设**——不擅长使用手机设定闹钟
- **服药容易忘**——记忆力减退导致漏服、重复服药

现有普通闹钟类应用只能做到简单提醒，无法自动识别药品信息，也难以用通俗、易理解的方式解释药物功效。很多老人并不擅长独立设置提醒，往往需要家属协助管理。

本项目构建一个面向老人和障碍人士的智能用药辅助系统，形成 **"识别药品 → 解释说明 → 自动提醒 → 家庭协同管理"** 的完整闭环。

## 三、系统总体思路

```
拍照上传 → 图像预处理 → OCR文字识别 → 结构化信息提取 → 语义简化
                                                          ↓
        家属协同管理 ← 服药记录 ← 一键确认 ← 定时提醒 ← 文字+语音输出
```

从课程角度看，本项目并非单纯的业务系统，而是一个包含 **图像处理、OCR、自然语言解析、多媒体交互、提醒调度和界面可视化设计** 的综合性多媒体应用。

## 四、技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **后端框架** | FastAPI + SQLAlchemy | Python 异步 Web 框架，自带 API 文档 |
| **数据库** | MySQL 8.0 + PyMySQL | 关系型数据库，utf8mb4 字符集 |
| **图像处理** | OpenCV | 裁剪、去噪、CLAHE 增强、自适应二值化 |
| **文字识别** | EasyOCR | 支持中英文混合 OCR 识别 |
| **语义解析** | 规则引擎 + 关键词映射 | 将医学术语转换为通俗表达 |
| **语音合成** | gTTS + Web Speech API | 服务端 gTTS 生成 MP3 + 浏览器端实时朗读 |
| **前端框架** | React 18 + Vite | 现代前端构建工具链 |
| **UI 样式** | TailwindCSS | 原子化 CSS，移动端优先 |
| **图标** | Lucide React | 轻量 SVG 图标库 |
| **认证** | JWT + bcrypt | JSON Web Token 无状态认证 |

## 五、核心功能模块

### 5.1 药品图像识别模块

| 功能 | 实现 |
|------|------|
| 图像上传 | 支持手机拍照/相册选取，`<input capture="environment">` |
| 图像预处理 | OpenCV 灰度转换 → 高斯去噪 → CLAHE 自适应直方图均衡化 → 自适应二值化 |
| OCR 识别 | EasyOCR 中英文混合识别，置信度 > 0.3 过滤 |
| 信息提取 | 正则表达式提取药品名称、规格、功效、用法用量、频率、注意事项 |

### 5.2 语义解析模块

将原始说明书中的复杂表述转换为老人容易理解的语言：

| 原始表述 | 简化后 |
|---------|--------|
| 清热解毒 | 帮助退烧、消炎 |
| 活血化瘀 | 帮助血液流通 |
| 口服，一次2片，一日3次 | 用嘴吃，每次吃2片，每天吃3次（早中晚各一次） |
| 孕妇禁用 | 怀孕的人不能吃 |
| 忌辛辣 | 吃这个药的时候不要吃辣的 |

### 5.3 文字语音并行输出模块

- **文字展示**：大字体、高对比度、彩色背景卡片区分功效/用法/注意事项
- **语音播报**：后端 gTTS 生成 MP3 音频文件（hash 缓存避免重复生成）
- **浏览器朗读**：前端 Web Speech API 实时 TTS，`rate=0.8` 放慢语速
- **图片辅助**：药盒照片随信息一起展示，帮助视觉识别

### 5.4 智能提醒生成模块

根据药品用法规则自动生成提醒计划：

- 自动识别"一日几次"生成对应时间点（如 08:00、12:00、18:00）
- 识别"饭前/饭后/空腹/睡前"调整提醒时间
- 提取剂量信息（如"每次2片"）
- 支持一键批量创建提醒
- 提醒状态：已服药 / 迟服（超过30分钟）/ 漏服 / 待服药

### 5.5 老人端交互模块（移动端优先）

- **底部 Tab 导航栏**：5 个核心入口，拇指轻松触达
- **大字体**：基准字号 1.2rem，关键信息 2rem+
- **高对比度**：橙色主色调，绿色已完成，红色警告
- **最小触摸区域**：所有可点击元素 ≥ 44px
- **脉冲动画**：待服药卡片呼吸灯效果，吸引注意力
- **一键确认**：底部弹出式确认面板，大按钮"已吃了" / "还没吃"
- **iOS 安全区**：`viewport-fit=cover` + `env(safe-area-inset-bottom)` 适配刘海屏

### 5.6 家庭协同管理模块

- 家属注册时选择"家属"角色
- 通过老人用户名绑定老人账户，支持绑定多位老人
- 家属可代为：拍照识别药品、手动录入药品信息、创建/修改提醒计划
- 家属可查看老人每日服药状态（已服/迟服/漏服）
- 支持解绑操作

## 六、数据库设计

本项目使用 **MySQL 8.0** 数据库，共 5 张核心表：

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `users` | 用户表 | id, username, hashed_password, display_name, role(elderly/family), phone |
| `family_relations` | 家庭关系表 | family_user_id, elderly_user_id, relation_name |
| `drugs` | 药品信息表 | name, specification, efficacy, efficacy_simple, usage_dosage, usage_simple, caution, caution_simple, image_path, ocr_raw_text |
| `reminders` | 服药提醒表 | drug_id, reminder_time(HH:MM), dosage, meal_relation, repeat_days, status |
| `medication_logs` | 服药记录表 | reminder_id, scheduled_time, actual_time, status(taken/missed/late/pending) |

完整的建表脚本位于 `database/init.sql`，包含表结构、索引、外键约束和演示数据。

## 七、API 接口设计

| 模块 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 认证 | `/api/auth/register` | POST | 用户注册（支持 elderly/family 角色） |
| 认证 | `/api/auth/login` | POST | 用户登录，返回 JWT Token |
| 认证 | `/api/auth/me` | GET | 获取当前用户信息 |
| 药品 | `/api/drugs/recognize` | POST | 上传图片进行 OCR 识别 |
| 药品 | `/api/drugs/upload-and-save` | POST | 识别并直接保存药品 |
| 药品 | `/api/drugs/` | GET/POST | 药品列表/手动创建 |
| 药品 | `/api/drugs/{id}` | GET/PUT/DELETE | 药品详情/修改/删除 |
| 药品 | `/api/drugs/{id}/audio` | GET | 获取药品语音说明 |
| 提醒 | `/api/reminders/auto-generate/{drug_id}` | POST | 自动生成提醒方案 |
| 提醒 | `/api/reminders/` | GET/POST | 提醒列表/创建 |
| 提醒 | `/api/reminders/batch` | POST | 批量创建提醒 |
| 提醒 | `/api/reminders/{id}` | PUT/DELETE | 修改/删除提醒 |
| 提醒 | `/api/reminders/{id}/audio` | GET | 获取提醒语音 |
| 记录 | `/api/reminders/logs/confirm` | POST | 确认服药 |
| 记录 | `/api/reminders/logs/` | GET | 查询服药记录 |
| 记录 | `/api/reminders/logs/today-status` | GET | 今日服药状态概览 |
| 家庭 | `/api/family/bind` | POST | 家属绑定老人 |
| 家庭 | `/api/family/my-elderly` | GET | 家属查看绑定的老人 |
| 家庭 | `/api/family/my-family` | GET | 老人查看绑定的家属 |
| 家庭 | `/api/family/unbind/{id}` | DELETE | 解绑 |

启动后端后可访问 **http://localhost:8000/docs** 查看完整的 Swagger API 文档。

## 八、项目结构

```
├── database/
│   └── init.sql                    # MySQL 完整建表脚本（含演示数据）
│
├── backend/                        # 后端（FastAPI + Python）
│   ├── app/
│   │   ├── main.py                 # 应用入口、中间件、路由注册
│   │   ├── config.py               # MySQL 连接配置
│   │   ├── database.py             # SQLAlchemy 引擎与会话
│   │   ├── models.py               # ORM 数据模型（5 张表）
│   │   ├── schemas.py              # Pydantic 请求/响应模型
│   │   ├── auth.py                 # JWT 认证与密码加密
│   │   ├── routers/
│   │   │   ├── auth.py             # 注册、登录、获取用户信息
│   │   │   ├── drugs.py            # 药品 CRUD、OCR 识别、语音生成
│   │   │   ├── reminders.py        # 提醒 CRUD、自动生成、服药确认
│   │   │   └── family.py           # 家庭绑定、解绑、关系查询
│   │   └── services/
│   │       ├── ocr_service.py      # OpenCV 预处理 + EasyOCR 识别 + 信息提取
│   │       ├── semantic_service.py  # 语义简化 + 提醒方案生成
│   │       └── tts_service.py      # gTTS 语音合成（hash 缓存）
│   ├── requirements.txt
│   └── run.py                      # Uvicorn 启动脚本
│
├── frontend/                       # 前端（React + Vite + TailwindCSS）
│   ├── src/
│   │   ├── main.jsx                # 入口
│   │   ├── App.jsx                 # 路由配置
│   │   ├── api.js                  # Axios API 封装（含 Token 拦截器）
│   │   ├── index.css               # 全局样式（适老化 + 移动端优先）
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx     # 全局认证状态管理
│   │   ├── components/
│   │   │   └── Layout.jsx          # 布局（顶栏 + 侧栏 + 移动端底部 Tab）
│   │   └── pages/
│   │       ├── Login.jsx           # 登录页
│   │       ├── Register.jsx        # 注册页（老人/家属角色选择）
│   │       ├── ElderlyHome.jsx     # 老人端首页（今日提醒 + 一键确认）
│   │       ├── FamilyHome.jsx      # 家属端首页（老人状态概览）
│   │       ├── DrugRecognize.jsx   # 拍照识药（上传→识别→保存→生成提醒）
│   │       ├── DrugList.jsx        # 药品列表
│   │       ├── DrugDetail.jsx      # 药品详情（原文+简化+语音+编辑）
│   │       ├── ReminderList.jsx    # 提醒列表（确认/编辑/删除）
│   │       ├── MedicationLog.jsx   # 服药记录（日历+完成度进度条）
│   │       └── FamilyManage.jsx    # 家庭管理（绑定/解绑老人）
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html                  # PWA 适配 meta 标签
│
└── README.md
```

## 九、快速启动

### 1. 初始化 MySQL 数据库

确保 MySQL 已安装并运行，然后执行建表脚本：

```bash
mysql -u root -p123456 < database/init.sql
```

或在 MySQL 客户端（如 Navicat、DBeaver、MySQL Workbench）中打开 `database/init.sql` 执行。

执行成功后将创建数据库 `medication_reminder`，包含 5 张表和 3 个演示账号：

| 账号 | 密码 | 角色 | 姓名 |
|------|------|------|------|
| `laowang` | `123456` | 老人 | 王大爷 |
| `laozhang` | `123456` | 老人 | 张奶奶 |
| `xiaoming` | `123456` | 家属 | 小明 |

### 2. 启动后端

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 安装依赖
pip install -r requirements.txt

# 启动
python run.py
```

后端运行在 **http://localhost:8000** ，API 文档在 **http://localhost:8000/docs**

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端运行在 **http://localhost:3000**

### 4. 手机访问

前端启动后，在同一局域网内的手机浏览器访问 `http://你的电脑IP:3000` 即可体验移动端界面。

## 十、适老化与移动端设计要点

本系统以"**移动端优先、老人友好**"为设计原则：

| 设计要点 | 实现方式 |
|---------|---------|
| **底部 Tab 导航** | 移动端固定底部 5 个标签页，拇指轻松触达 |
| **大字体** | 老人模式基准 1.2rem，标题最大 3rem |
| **高对比度** | 橙色(#EA580C)主色 + 白底 + 深色文字 |
| **最小触摸区域** | 触屏设备所有可点击元素 ≥ 44×44px |
| **底部弹出面板** | 服药确认弹窗在移动端从底部滑出，符合单手操作习惯 |
| **iOS 安全区适配** | `viewport-fit=cover` + `env(safe-area-inset-bottom)` |
| **脉冲动画** | 待服药卡片呼吸灯效果，视觉提醒 |
| **语音播报** | 每条药品信息和提醒均可一键语音朗读 |
| **简化操作** | 拍照→识别→保存→生成提醒全流程最少3步完成 |
| **桌面端兼容** | sm(640px)以上自动切换侧边栏布局 |

## 十一、项目创新点

1. **完整闭环**：覆盖"识别→解释→提醒→反馈→家属协同"全流程
2. **多模态并行输出**：功效和用法同时以文字 + 语音方式呈现
3. **语义简化引擎**：将医学术语自动转换为老人易懂的口语化表达
4. **家庭协同场景**：家属可远程帮老人管理药品和提醒
5. **移动端优先设计**：底部 Tab 导航 + 底部弹出面板 + 安全区适配
6. **无障碍体验**：大字体、高对比、语音播报、最小触摸区域等

## 十二、人员分工

| 成员 | 负责模块 | 主要任务 | 预期产出 |
|------|---------|---------|---------|
| 成员 1 | 图像识别与 OCR | 图片预处理、EasyOCR 识别、关键字段提取 | OCR 服务、字段提取接口 |
| 成员 2 | 语义解析与提醒生成 | 功效/用法/频率提取，语义简化，提醒规则生成 | 解析模块、提醒生成逻辑 |
| 成员 3 | 老人端与多模态交互 | 大字体界面、语音播报、提醒页面、服药确认 | 老人端页面、语音交互 |
| 成员 4 | 家属端与系统整合 | 家属协同管理、数据库、接口联调、系统测试 | 家属端页面、后端整合 |

## 十三、工期安排（6 周）

| 阶段 | 时间 | 主要内容 |
|------|------|---------|
| 第 1 周 | 需求分析与方案设计 | 用户场景、系统流程、技术选型、界面草图 |
| 第 2 周 | 识别原型开发 | 药盒拍照上传、图像预处理、OCR 基础识别 |
| 第 3 周 | 说明解析与提醒逻辑 | 功效/用法/频率提取，自动生成提醒计划 |
| 第 4 周 | 多模态交互实现 | 文字语音并行输出、老人端提醒页面、无障碍设计 |
| 第 5 周 | 家庭协同与系统联调 | 家属端录入管理、数据库联调、日志记录 |
| 第 6 周 | 测试优化与汇报准备 | 测试修复、答辩 PPT、项目文档 |
