function generateJWTSecret() {
  const secret = generateSecret(32);
  document.getElementById('jwt-secret').value = secret;
}

function generateCryptoSecret() {
  const secret = generateSecret(32);
  document.getElementById('crypto-secret').value = secret;
}

function generateSessionSecret() {
  const secret = generateSecret(32);
  document.getElementById('session-secret').value = secret;
}

function generateSecret(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let secret = '';
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      secret += chars[array[i] % chars.length];
    }
  } else {
    alert('你的浏览器不支持 Web Crypto API。请使用现代浏览器。');
    return '';
  }
  return secret;
}

function copyToClipboard(id) {
  const input = document.getElementById(id);
  input.select();
  input.setSelectionRange(0, 99999); // 适用于移动设备
  document.execCommand('copy');
  alert('已复制到剪贴板！');
}