const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://47.114.117.255', 'http://www.echotube.me', 'https://www.echotube.me'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning')
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'author', 'user'], default: 'user' },
  expiryDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const VideoSchema = new mongoose.Schema({
  title: String,
  videoId: String,
  videoSource: { type: String, enum: ['youtube', 'bilibili'], default: 'youtube' },
  subtitles: String,
  keywords: [{
    word: String,
    translation: String,
    phonetic: String,
    audioUrl: String,
    partOfSpeech: String,
    definition: String,
    exampleSentence: String,
    exampleTranslation: String,
    synonyms: String,
    etymology: String,
    imageUrl: String,
    contextFromVideo: String
  }],
  checkInRecords: [{
    date: Date,
    step: Number
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Video = mongoose.model('Video', VideoSchema);
const Config = mongoose.model('Config', ConfigSchema);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未提供认证令牌' });
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: '令牌无效或已过期' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: '用户名或密码错误' });
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: '用户名或密码错误' });
    if (user.expiryDate && new Date() > user.expiryDate) {
      return res.status(403).json({ error: '账户已过期' });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role, expiryDate: user.expiryDate }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, role, expiryDate } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: '用户名已存在' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      role,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined
    });
    await user.save();
    res.status(201).json({ message: '用户创建成功', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { password, role, expiryDate } = req.body;
    const updateData = { role, expiryDate };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: '用户更新成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/videos', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'author') {
      query.createdBy = req.user.id;
    }
    const videos = await Video.find(query).populate('createdBy', 'username');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: '视频不存在' });
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/videos', authenticateToken, async (req, res) => {
  try {
    const video = new Video({ ...req.body, createdBy: req.user.id });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: '视频不存在' });
    if (req.user.role !== 'admin' && video.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此视频' });
    }
    const updatedVideo = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: '视频不存在' });
    if (req.user.role !== 'admin' && video.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限删除此视频' });
    }
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: '视频删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/videos/:id/checkin', authenticateToken, async (req, res) => {
  try {
    const { step } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: '视频不存在' });
    video.checkInRecords.push({ date: new Date(), step: step });
    await video.save();
    res.json({ message: '打卡成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/config/:key', authenticateToken, async (req, res) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    res.json(config ? config.value : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    await Config.findOneAndUpdate(
      { key },
      { key, value, updatedAt: new Date() },
      { upsert: true }
    );
    res.json({ message: '配置保存成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backup/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const videos = await Video.find();
    const users = await User.find().select('-password');
    const configs = await Config.find();
    res.json({
      version: '1.0',
      timestamp: new Date(),
      data: { videos, users, configs }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/backup/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data } = req.body;
    if (data.videos) {
      await Video.deleteMany({});
      await Video.insertMany(data.videos);
    }
    if (data.configs) {
      await Config.deleteMany({});
      await Config.insertMany(data.configs);
    }
    res.json({ message: '备份恢复成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '英语学习平台后端服务运行正常',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ 默认管理员账户已创建 (admin/admin123)');
    }
  } catch (error) {
    console.error('❌ 初始化管理员账户失败:', error);
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`🚀 服务器运行在端口 \${PORT}\`);
  initializeAdmin();
});
