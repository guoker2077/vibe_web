import cloudbase from '@cloudbase/js-sdk';

const ENV_ID = 'testcode1-d6gvr6853406258e0';

let app = null;
let db = null;
let authInstance = null;
let isReady = false;
let readyResolve = null;
const readyPromise = new Promise((resolve) => {
  readyResolve = resolve;
});

// 初始化 CloudBase
function initCloudBase() {
  if (app) return;
  app = cloudbase.init({
    env: ENV_ID,
    region: 'ap-shanghai',
  });
  db = app.database();
  authInstance = app.auth({ persistence: 'local' });
}

// 匿名登录
async function signInAnonymously() {
  initCloudBase();
  try {
    const { data, error } = await authInstance.signInAnonymously();
    if (error) {
      console.error('匿名登录失败:', error);
      return false;
    }
    isReady = true;
    readyResolve(true);
    return true;
  } catch (e) {
    console.error('匿名登录异常:', e);
    return false;
  }
}

// 确保 SDK 已就绪
async function ensureReady() {
  if (isReady) return true;
  return readyPromise;
}

// 初始化并登录
export async function init() {
  initCloudBase();
  await signInAnonymously();
  return isReady;
}

// 获取数据库实例
export function getDb() {
  return db;
}

// ============ Tasks CRUD ============

// 获取所有事务
export async function getTasks() {
  await ensureReady();
  try {
    const result = await db.collection('tasks').orderBy('createdAt', 'desc').get();
    return result.data || [];
  } catch (e) {
    console.error('获取事务失败:', e);
    return [];
  }
}

// 添加事务
export async function addTask(task) {
  await ensureReady();
  try {
    const result = await db.collection('tasks').add({
      ...task,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result._id;
  } catch (e) {
    console.error('添加事务失败:', e);
    return null;
  }
}

// 更新事务
export async function updateTask(id, updates) {
  await ensureReady();
  try {
    const result = await db.collection('tasks').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
    return result.updated > 0;
  } catch (e) {
    console.error('更新事务失败:', e);
    return false;
  }
}

// 删除事务
export async function deleteTask(id) {
  await ensureReady();
  try {
    const result = await db.collection('tasks').doc(id).remove();
    return result.deleted > 0;
  } catch (e) {
    console.error('删除事务失败:', e);
    return false;
  }
}

// 切换完成状态
export async function toggleTaskComplete(id, completed) {
  return updateTask(id, { completed });
}

// 清除已完成事务
export async function clearCompletedTasks() {
  await ensureReady();
  try {
    const _ = db.command;
    const result = await db.collection('tasks').where({ completed: true }).remove();
    return result.deleted;
  } catch (e) {
    console.error('清除已完成事务失败:', e);
    return 0;
  }
}

// 监听事务变化（实时同步）
export function watchTasks(onChange, onError) {
  if (!db) return null;
  try {
    const watcher = db.collection('tasks').watch({
      onChange: (snapshot) => {
        if (onChange) onChange(snapshot);
      },
      onError: (err) => {
        if (onError) onError(err);
      },
    });
    return watcher;
  } catch (e) {
    console.error('监听事务失败:', e);
    return null;
  }
}

// ============ Alarms CRUD ============

// 获取所有提醒
export async function getAlarms() {
  await ensureReady();
  try {
    const result = await db.collection('alarms').orderBy('createdAt', 'desc').get();
    return result.data || [];
  } catch (e) {
    console.error('获取提醒失败:', e);
    return [];
  }
}

// 添加提醒
export async function addAlarm(alarm) {
  await ensureReady();
  try {
    const result = await db.collection('alarms').add({
      ...alarm,
      enabled: true,
      triggered: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result._id;
  } catch (e) {
    console.error('添加提醒失败:', e);
    return null;
  }
}

// 更新提醒
export async function updateAlarm(id, updates) {
  await ensureReady();
  try {
    const result = await db.collection('alarms').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
    return result.updated > 0;
  } catch (e) {
    console.error('更新提醒失败:', e);
    return false;
  }
}

// 删除提醒
export async function deleteAlarm(id) {
  await ensureReady();
  try {
    const result = await db.collection('alarms').doc(id).remove();
    return result.deleted > 0;
  } catch (e) {
    console.error('删除提醒失败:', e);
    return false;
  }
}

// 切换提醒开关
export async function toggleAlarmEnabled(id, enabled) {
  return updateAlarm(id, { enabled, triggered: false });
}

// 清除已关闭的提醒
export async function clearDisabledAlarms() {
  await ensureReady();
  try {
    const result = await db.collection('alarms').where({ enabled: false }).remove();
    return result.deleted;
  } catch (e) {
    console.error('清除已关闭提醒失败:', e);
    return 0;
  }
}

// 获取活跃提醒（用于闹钟检查）
export async function getActiveAlarms() {
  await ensureReady();
  try {
    const result = await db.collection('alarms').where({ enabled: true }).get();
    return result.data || [];
  } catch (e) {
    console.error('获取活跃提醒失败:', e);
    return [];
  }
}

// 标记提醒已触发
export async function markAlarmTriggered(id) {
  return updateAlarm(id, { triggered: true });
}

// 监听提醒变化（实时同步）
export function watchAlarms(onChange, onError) {
  if (!db) return null;
  try {
    const watcher = db.collection('alarms').watch({
      onChange: (snapshot) => {
        if (onChange) onChange(snapshot);
      },
      onError: (err) => {
        if (onError) onError(err);
      },
    });
    return watcher;
  } catch (e) {
    console.error('监听提醒失败:', e);
    return null;
  }
}
