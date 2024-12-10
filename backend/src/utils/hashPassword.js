const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    const saltRounds = 10; // 盐的轮数
    return await bcrypt.hash(password, saltRounds);
};

module.exports = hashPassword;
