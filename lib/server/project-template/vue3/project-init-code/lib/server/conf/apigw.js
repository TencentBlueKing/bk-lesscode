module.exports = process.env.NODE_ENV === 'production'
// 线上环境配置（npm run build时使用）
  ? {
    stageName: '${stageName}',
  }
// 本地调试配置（npm run dev时使用）
  : {
    stageName: 'stag',
  };
