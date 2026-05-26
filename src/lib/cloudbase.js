import cloudbase from '@cloudbase/js-sdk';

const ENV_ID = 'testcode1-d6gvr6853406258e0';
const ACCESS_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3Rlc3Rjb2RlMS1kNmd2cjY4NTM0MDYyNThlMC5hcC1zaGFuZ2hhaS50Y2ItYXBpLnRlbmNlbnRjbG91ZGFwaS5jb20iLCJzdWIiOiJhbm9uIiwiYXVkIjoidGVzdGNvZGUxLWQ2Z3ZyNjg1MzQwNjI1OGUwIiwiZXhwIjo0MDgzMzkxOTUwLCJpYXQiOjE3Nzk3MDg3NTAsIm5vbmNlIjoibEx3SUFwQy1ROW02Y1B2R2E3SjdIdyIsImF0X2hhc2giOiJsTHdJQXBDLVE5bTZjUHZHYTdKN0h3IiwibmFtZSI6IkFub255bW91cyIsInNjb3BlIjoiYW5vbnltb3VzIiwicHJvamVjdF9pZCI6InRlc3Rjb2RlMS1kNmd2cjY4NTM0MDYyNThlMCIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.Z4mLGoRVOSr1p7qh3gdHvi43BOTK9I1OJiHSUDoTO4QvYYfY-TRoHJziC09emrUaB1AH1KAIyoZ6Y381H3kgRgLY3Qm1PNHQDWvrSGXMQ1o741uuAsgyUTvGyP8jj4mZ6SjP418VVt4uf8KkNfusa0GQufT8CKeXVA04KO1lDYMDmOq29rkeKvEt4_DxJ01UR9GFEw6NirqtklBSZDG9A9yHChA5abRn6j6Ky0-FwJPB3lPLB9b4LVBG_qqhj45VSWqEzF6l3iEjCWXG00IaXfHNb48EKn6Pm7IfGB73cvCm_yAOk5vhzd-7j71FTEK8tPAII5FRJU2bAsGorBpp0g';

let app = null;
let db = null;
let authInstance = null;
let isReady = false;
let readyResolve = null;
const readyPromise = new Promise((resolve) => {
  readyResolve = resolve;
});

function initCloudBase() {
  if (app) return;
  app = cloudbase.init({
    env: ENV_ID,
    region: 'ap-shanghai',
    accessKey: ACCESS_KEY,
    auth: { detectSessionInUrl: true },
  });
  db = app.database();
  authInstance = app.auth({ persistence: 'local' });
}

async function ensureReady() {
  if (isReady) return true;
  return readyPromise;
}

// ============ 邮箱密码登录 ============

// 检查是否已登录（真实邮箱密码认证用户）
export async function isLoggedIn() {
  initCloudBase();
  try {
    const { data, error } = await authInstance.getSession();
    if (error || !data?.session) return false;

    const user = data.user || data.session?.user;
    if (!user) return false;

    // 排除匿名会话
    if (user.is_anonymous) return false;

    // 必须通过密码认证才算真正登录
    const providers = user.app_metadata?.providers;
    if (!Array.isArray(providers) || !providers.includes('password')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// 邮箱密码登录（已有账号）
export async function loginWithEmail(email, password) {
  initCloudBase();
  try {
    const { data, error } = await authInstance.signInWithPassword({
      username: email,
      password,
    });

    if (error) {
      return { success: false, error: error.message || '登录失败' };
    }

    isReady = true;
    readyResolve(true);
    localStorage.setItem('cloudbase_auth_password_login', 'true');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || '登录异常' };
  }
}

// 发送注册验证码到邮箱
// 返回 { needVerify: true, verifyOtpFn } 或 { success: false, error }
export async function sendSignUpOtp(email, password) {
  initCloudBase();
  try {
    const { data, error } = await authInstance.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message || '发送验证码失败' };
    }

    // data.verifyOtp 是一个函数，用于验证 OTP
    return {
      success: true,
      needVerify: true,
      verifyOtpFn: data.verifyOtp,
    };
  } catch (e) {
    return { success: false, error: e.message || '发送验证码异常' };
  }
}

// 验证注册验证码
export async function verifySignUpOtp(verifyOtpFn, code) {
  try {
    const { data, error } = await verifyOtpFn({ token: code });

    if (error) {
      return { success: false, error: error.message || '验证码错误' };
    }

    isReady = true;
    readyResolve(true);
    localStorage.setItem('cloudbase_auth_password_login', 'true');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || '验证码验证异常' };
  }
}

// 登出
export async function logout() {
  initCloudBase();
  try {
    await authInstance.signOut();
  } catch (e) {
    console.error('登出失败:', e);
  }
  isReady = false;
  localStorage.removeItem('cloudbase_auth_password_login');
}

// 初始化（检查已有会话，仅当密码认证用户才视为已登录）
export async function init() {
  initCloudBase();

  // 检查 localStorage 中是否有密码登录的会话标记
  const sessionFlag = localStorage.getItem('cloudbase_auth_password_login');
  if (sessionFlag === 'true') {
    const loggedIn = await isLoggedIn();
    if (loggedIn) {
      isReady = true;
      readyResolve(true);
      return isReady;
    }
    localStorage.removeItem('cloudbase_auth_password_login');
  } else {
    // 没有密码登录标记，清除可能存在的匿名/非密码会话
    try {
      const { data } = await authInstance.getSession();
      if (data?.session) {
        await authInstance.signOut();
      }
    } catch {
      // 无会话可清，忽略
    }
  }

  return isReady;
}

export function getDb() {
  return db;
}

export function getApp() {
  return app;
}

// ============ Profile ============

export async function getProfile() {
  await ensureReady();
  try {
    const result = await db.collection('profiles').limit(1).get();
    return result.data && result.data.length > 0 ? result.data[0] : null;
  } catch (e) {
    console.error('获取档案失败:', e);
    return null;
  }
}

export async function saveProfile(profile) {
  await ensureReady();
  try {
    const { _id, _openid, ...data } = profile;
    const existing = await getProfile();
    if (existing) {
      await db.collection('profiles').doc(existing._id).update({
        ...data,
        updatedAt: new Date(),
      });
      return existing._id;
    } else {
      const result = await db.collection('profiles').add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return result._id;
    }
  } catch (e) {
    console.error('保存档案失败:', e);
    return null;
  }
}

// ============ CheckIn Records ============

export async function getCheckInRecords(date) {
  await ensureReady();
  try {
    const result = await db.collection('checkins')
      .where({ date })
      .orderBy('createdAt', 'desc')
      .get();
    return result.data || [];
  } catch (e) {
    console.error('获取打卡记录失败:', e);
    return [];
  }
}

export async function addCheckIn(record) {
  await ensureReady();
  try {
    const result = await db.collection('checkins').add({
      ...record,
      createdAt: new Date(),
    });
    return result._id;
  } catch (e) {
    console.error('添加打卡记录失败:', e);
    return null;
  }
}

export async function removeCheckIn(id) {
  await ensureReady();
  try {
    const result = await db.collection('checkins').doc(id).remove();
    return result.deleted > 0;
  } catch (e) {
    console.error('删除打卡记录失败:', e);
    return false;
  }
}

export async function getCheckInRange(startDate, endDate) {
  await ensureReady();
  try {
    const _ = db.command;
    const result = await db.collection('checkins')
      .where({
        date: _.gte(startDate).and(_.lte(endDate))
      })
      .orderBy('date', 'asc')
      .get();
    return result.data || [];
  } catch (e) {
    console.error('获取打卡范围失败:', e);
    return [];
  }
}

// ============ Custom CheckIn Items ============

export async function getCustomItems() {
  await ensureReady();
  try {
    const result = await db.collection('custom_items').orderBy('createdAt', 'asc').get();
    return result.data || [];
  } catch (e) {
    console.error('获取自定义项失败:', e);
    return [];
  }
}

export async function addCustomItem(item) {
  await ensureReady();
  try {
    const result = await db.collection('custom_items').add({
      ...item,
      createdAt: new Date(),
    });
    return result._id;
  } catch (e) {
    console.error('添加自定义项失败:', e);
    return null;
  }
}

export async function deleteCustomItem(id) {
  await ensureReady();
  try {
    const result = await db.collection('custom_items').doc(id).remove();
    return result.deleted > 0;
  } catch (e) {
    console.error('删除自定义项失败:', e);
    return false;
  }
}

// ============ Weight Records ============

export async function getWeightRecords() {
  await ensureReady();
  try {
    const result = await db.collection('weight_records').orderBy('date', 'desc').get();
    return result.data || [];
  } catch (e) {
    console.error('获取体重记录失败:', e);
    return [];
  }
}

export async function addWeightRecord(record) {
  await ensureReady();
  try {
    const existing = await db.collection('weight_records')
      .where({ date: record.date })
      .get();
    if (existing.data && existing.data.length > 0) {
      await db.collection('weight_records').doc(existing.data[0]._id).update({
        weight: record.weight,
        updatedAt: new Date(),
      });
      return existing.data[0]._id;
    }
    const result = await db.collection('weight_records').add({
      ...record,
      createdAt: new Date(),
    });
    return result._id;
  } catch (e) {
    console.error('添加体重记录失败:', e);
    return null;
  }
}

export async function deleteWeightRecord(id) {
  await ensureReady();
  try {
    const result = await db.collection('weight_records').doc(id).remove();
    return result.deleted > 0;
  } catch (e) {
    console.error('删除体重记录失败:', e);
    return false;
  }
}

// ============ Body Photos ============

export async function getBodyPhotos() {
  await ensureReady();
  try {
    const result = await db.collection('body_photos').orderBy('date', 'desc').get();
    return result.data || [];
  } catch (e) {
    console.error('获取身材照片失败:', e);
    return [];
  }
}

export async function addBodyPhoto(record) {
  await ensureReady();
  try {
    const result = await db.collection('body_photos').add({
      ...record,
      createdAt: new Date(),
    });
    return result._id;
  } catch (e) {
    console.error('添加身材照片失败:', e);
    return null;
  }
}

export async function deleteBodyPhoto(id) {
  await ensureReady();
  try {
    const result = await db.collection('body_photos').doc(id).remove();
    return result.deleted > 0;
  } catch (e) {
    console.error('删除身材照片失败:', e);
    return false;
  }
}

// ============ File Upload ============

export async function uploadFile(filePath, cloudPath) {
  await ensureReady();
  try {
    const result = await app.uploadFile({
      cloudPath,
      filePath,
    });
    return result.fileID;
  } catch (e) {
    console.error('上传文件失败:', e);
    return null;
  }
}

export async function getTempFileURL(fileID) {
  await ensureReady();
  try {
    const result = await app.getTempFileURL({
      fileList: [fileID],
    });
    if (result.fileList && result.fileList.length > 0) {
      return result.fileList[0].tempFileURL;
    }
    return null;
  } catch (e) {
    console.error('获取临时URL失败:', e);
    return null;
  }
}

export async function deleteFile(fileID) {
  await ensureReady();
  try {
    await app.deleteFile({
      fileList: [fileID],
    });
    return true;
  } catch (e) {
    console.error('删除文件失败:', e);
    return false;
  }
}

// ============ Alarms ============

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

export async function toggleAlarmEnabled(id, enabled) {
  return updateAlarm(id, { enabled, triggered: false });
}

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

export async function markAlarmTriggered(id) {
  return updateAlarm(id, { triggered: true });
}
