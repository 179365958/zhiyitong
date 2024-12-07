const crypto = require('crypto');

// 加密密钥
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const ALGORITHM = 'aes-256-gcm';

// 加密函数
async function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);
    const key = crypto.pbkdf2Sync(SECRET_KEY, salt, 2145, 32, 'sha512');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // 将所有信息打包成一个字符串
    return Buffer.concat([salt, iv, authTag, encrypted]).toString('base64');
}

// 解密函数
async function decrypt(encryptedData) {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    const salt = buffer.slice(0, 64);
    const iv = buffer.slice(64, 80);
    const authTag = buffer.slice(80, 96);
    const encrypted = buffer.slice(96);
    
    const key = crypto.pbkdf2Sync(SECRET_KEY, salt, 2145, 32, 'sha512');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
}

module.exports = {
    encrypt,
    decrypt
};
