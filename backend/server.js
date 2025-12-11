require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB 连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning')
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err));

// ============================================
// 数据模型
// ============================================

// 用户模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'author', 'viewer'], default: 'viewer' },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 视频模型
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  youtubeUrl: String,
  subtitleContent: String,
  keywords: [{
    word: String,
    translation: String,
    phonetic: String,
    definition: String,
    example: String,
    exampleTranslation: String,
    audioUrl: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', VideoSchema);

// 学习记录模型
const StudyRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  completedSteps: [Number],
  lastStudiedAt: { type: Date, default: Date.now }
});

const StudyRecord = mongoose.model('StudyRecord', StudyRecordSchema);

// ============================================
// 认证中间件
// ============================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '令牌无效或已过期' });
    }
    req.user = user;
    next();
  });
};

// ============================================
// 认证路由
// ============================================

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 检查账户是否过期
    if (user.expiryDate && new Date() > user.expiryDate) {
      return res.status(403).json({ error: '账户已过期' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        expiryDate: user.expiryDate
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 验证令牌
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ============================================
// 用户管理路由（仅管理员）
// ============================================

// 创建用户
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }

    const { username, password, role, expiryDate } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      password: hashedPassword,
      role,
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    await user.save();
    res.status(201).json({ message: '用户创建成功', userId: user._id });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有用户
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除用户
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ============================================
// 视频管理路由
// ============================================

// 获取所有视频
app.get('/api/videos', authenticateToken, async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个视频
app.get('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建视频
app.post('/api/videos', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'author'].includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    const video = new Video({
      ...req.body,
      createdBy: req.user.userId
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error('创建视频错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新视频
app.put('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'author'].includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除视频
app.delete('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'author'].includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: '视频删除成功' });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ============================================
// 学习记录路由
// ============================================

// 更新学习记录
app.post('/api/study-records', authenticateToken, async (req, res) => {
  try {
    const { videoId, completedSteps } = req.body;

    let record = await StudyRecord.findOne({
      userId: req.user.userId,
      videoId
    });

    if (record) {
      record.completedSteps = completedSteps;
      record.lastStudiedAt = new Date();
      await record.save();
    } else {
      record = new StudyRecord({
        userId: req.user.userId,
        videoId,
        completedSteps
      });
      await record.save();
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取学习记录
app.get('/api/study-records/:videoId', authenticateToken, async (req, res) => {
  try {
    const record = await StudyRecord.findOne({
      userId: req.user.userId,
      videoId: req.params.videoId
    });

    res.json(record || { completedSteps: [] });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ============================================
// 健康检查
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '英语学习平台后端服务运行正常',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📍 API 地址: http://localhost:${PORT}`);
});

// 初始化管理员账户（仅在首次运行时）
async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ 默认管理员账户已创建 (admin/admin123)');
    }
  } catch (error) {
    console.error('初始化管理员账户失败:', error);
  }
}

mongoose.connection.once('open', () => {
  initializeAdmin();
});
