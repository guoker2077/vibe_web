<template>
  <div class="login-overlay">
    <div class="ambient-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="mesh-layer"></div>
    </div>

    <div class="login-card">
      <div class="card-glow"></div>
      <div class="card-content">
        <div class="logo-area">
          <div class="logo-circle">
            <svg viewBox="0 0 40 40" fill="none" class="logo-svg">
              <defs>
                <linearGradient id="loginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffffff" />
                  <stop offset="100%" style="stop-color:#c8d6ff" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="17" stroke="url(#loginGrad)" stroke-width="2.5" fill="none" />
              <path d="M20 11V21L27 21" stroke="url(#loginGrad)" stroke-width="2.5" stroke-linecap="round" />
              <circle cx="20" cy="20" r="2" fill="url(#loginGrad)" />
            </svg>
          </div>
          <h1 class="app-name">自律打卡中心</h1>
          <p class="app-desc">{{ step === 'login' ? '登录你的账号' : '验证邮箱完成注册' }}</p>
        </div>

        <!-- 步骤1：邮箱+密码 -->
        <div v-if="step === 'login'" class="form-area">
          <div class="input-group">
            <div class="input-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" class="input-icon">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
                <path d="M22 7l-10 6L2 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="输入邮箱"
              class="text-input"
              @keydown.enter="handleLogin"
            />
          </div>

          <div class="input-group">
            <div class="input-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" class="input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="输入密码"
              class="text-input"
              @keydown.enter="handleLogin"
            />
            <button class="toggle-visibility" @click="showPassword = !showPassword" type="button">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" class="eye-icon">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="eye-icon">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <t-button
            theme="primary"
            block
            size="large"
            class="login-btn"
            :loading="loading"
            :disabled="!email || !password || password.length < 6"
            @click="handleLogin"
          >
            登录
          </t-button>

          <div class="switch-mode">
            没有账号？
            <button class="link-btn" @click="step = 'register'" :disabled="loading">注册新账号</button>
          </div>
        </div>

        <!-- 步骤2：注册 - 邮箱+密码+发送验证码 -->
        <div v-else-if="step === 'register'" class="form-area">
          <div class="input-group">
            <div class="input-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" class="input-icon">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
                <path d="M22 7l-10 6L2 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="输入邮箱"
              class="text-input"
            />
          </div>

          <div class="input-group">
            <div class="input-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" class="input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="设置密码（至少6位）"
              class="text-input"
            />
            <button class="toggle-visibility" @click="showPassword = !showPassword" type="button">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" class="eye-icon">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="eye-icon">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <t-button
            theme="primary"
            block
            size="large"
            class="login-btn"
            :loading="loading"
            :disabled="!email || !password || password.length < 6"
            @click="handleSendOtp"
          >
            发送验证码
          </t-button>

          <div class="switch-mode">
            已有账号？
            <button class="link-btn" @click="step = 'login'" :disabled="loading">去登录</button>
          </div>
        </div>

        <!-- 步骤3：输入验证码 -->
        <div v-else-if="step === 'verify'" class="form-area">
          <div class="verify-hint">
            验证码已发送至 <strong>{{ email }}</strong>
          </div>

          <div class="input-group">
            <div class="input-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" class="input-icon">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <input
              v-model="otpCode"
              type="text"
              placeholder="输入6位验证码"
              maxlength="6"
              class="text-input"
              @keydown.enter="handleVerifyOtp"
              autofocus
            />
          </div>

          <t-button
            theme="primary"
            block
            size="large"
            class="login-btn"
            :loading="loading"
            :disabled="!otpCode || otpCode.length < 6"
            @click="handleVerifyOtp"
          >
            验证并注册
          </t-button>

          <div class="switch-mode">
            <button class="link-btn" @click="step = 'register'" :disabled="loading">重新发送</button>
          </div>
        </div>

        <transition name="fade">
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { loginWithEmail, sendSignUpOtp, verifySignUpOtp } from '../lib/cloudbase';

const emit = defineEmits(['login']);

const step = ref('login'); // login | register | verify
const email = ref('');
const password = ref('');
const otpCode = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref('');
let verifyOtpFn = null;

const handleLogin = async () => {
  if (!email.value) { errorMsg.value = '请输入邮箱'; return; }
  if (!password.value || password.value.length < 6) { errorMsg.value = '密码至少6位'; return; }
  loading.value = true;
  errorMsg.value = '';
  const result = await loginWithEmail(email.value, password.value);
  loading.value = false;
  if (result.success) {
    emit('login');
  } else {
    errorMsg.value = result.error || '登录失败';
  }
};

const handleSendOtp = async () => {
  if (!email.value) { errorMsg.value = '请输入邮箱'; return; }
  if (!password.value || password.value.length < 6) { errorMsg.value = '密码至少6位'; return; }
  loading.value = true;
  errorMsg.value = '';
  const result = await sendSignUpOtp(email.value, password.value);
  loading.value = false;
  if (result.success && result.needVerify) {
    verifyOtpFn = result.verifyOtpFn;
    step.value = 'verify';
  } else {
    errorMsg.value = result.error || '发送验证码失败';
  }
};

const handleVerifyOtp = async () => {
  if (!otpCode.value || otpCode.value.length < 6) { errorMsg.value = '请输入6位验证码'; return; }
  loading.value = true;
  errorMsg.value = '';
  const result = await verifySignUpOtp(verifyOtpFn, otpCode.value);
  loading.value = false;
  if (result.success) {
    emit('login');
  } else {
    errorMsg.value = result.error || '验证码错误';
  }
};

defineExpose({ setLoading: (v) => { loading.value = v; }, setError: (msg) => { errorMsg.value = msg; loading.value = false; } });
</script>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f8;
}

.ambient-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.12) 0%, transparent 70%);
  top: -10%; left: -5%;
  animation: float-slow 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(123, 97, 255, 0.12) 0%, transparent 70%);
  bottom: 10%; right: -5%;
  animation: float-slow 25s ease-in-out infinite reverse;
}

.orb-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.08) 0%, transparent 70%);
  top: 50%; left: 40%;
  animation: float-slow 18s ease-in-out infinite 3s;
}

.mesh-layer {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(0,82,217,0.03) 0%, transparent 50%),
    linear-gradient(225deg, rgba(123,97,255,0.03) 0%, transparent 50%);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes float-slow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.login-card {
  position: relative;
  width: 420px;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 12px 40px rgba(0, 82, 217, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 120px;
  background: radial-gradient(ellipse, rgba(0, 82, 217, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.card-content {
  position: relative;
  padding: 40px 36px 32px;
}

.logo-area {
  text-align: center;
  margin-bottom: 32px;
}

.logo-circle {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0052d9, #7b61ff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 6px 20px rgba(0, 82, 217, 0.3);
}

.logo-svg {
  width: 36px;
  height: 36px;
}

.app-name {
  font-size: 24px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.app-desc {
  font-size: 14px;
  color: #9ba3b0;
  margin: 0;
}

.form-area {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid rgba(0, 82, 217, 0.1);
  border-radius: 14px;
  padding: 4px 6px;
  margin-bottom: 12px;
  transition: border-color 0.3s ease;
}

.input-group:focus-within {
  border-color: rgba(0, 82, 217, 0.4);
  box-shadow: 0 0 0 4px rgba(0, 82, 217, 0.06);
}

.input-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.input-icon {
  width: 20px;
  height: 20px;
  color: #9ba3b0;
}

.text-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  color: #1a1a2e;
  background: transparent;
  padding: 10px 0;
  font-family: inherit;
}

.text-input::placeholder {
  color: #c4c9d4;
  font-weight: 400;
}

.toggle-visibility {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ba3b0;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toggle-visibility:hover {
  color: #5e6c84;
}

.eye-icon {
  width: 20px;
  height: 20px;
}

.login-btn {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-top: 4px;
}

.switch-mode {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #9ba3b0;
}

.link-btn {
  background: none;
  border: none;
  color: #0052d9;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

.verify-hint {
  text-align: center;
  font-size: 14px;
  color: #5e6c84;
  margin-bottom: 16px;
  line-height: 1.5;
}

.verify-hint strong {
  color: #1a1a2e;
}

.error-msg {
  text-align: center;
  font-size: 13px;
  color: #e34d59;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(227, 77, 89, 0.06);
  border-radius: 8px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
