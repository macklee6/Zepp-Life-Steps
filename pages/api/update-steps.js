// 使用 require 而不是 import，避免 ES 模块问题
const zeppLifeSteps = require('./ZeppLifeSteps');

// 将 module.exports 修改为 export default
export default async function handler(req, res) {
  // 支持POST和GET两种请求方式
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 根据请求方法从不同地方获取参数
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;

    if (!account || !password) {
      return res.status(400).json({ success: false, message: '账号和密码不能为空' });
    }

    // 设置默认步数，对于GET请求，需要将steps参数转为整数
    const targetSteps = steps ? 
      (req.method === 'GET' ? parseInt(steps) : steps) : 
      Math.floor(Math.random() * 10000) + 20000;
      
    console.log('目标步数:', targetSteps);

    // 登录获取token
    console.log('开始登录流程...');
    const { loginToken, userId } = await zeppLifeSteps.login(account, password);
    console.log('登录成功,获取到loginToken和userId');

    // 获取app token
    console.log('开始获取appToken...');
    const appToken = await zeppLifeSteps.getAppToken(loginToken);
    console.log('获取appToken成功');

    // 修改步数
    console.log('开始更新步数...');
    const result = await zeppLifeSteps.updateSteps(loginToken, appToken, targetSteps);
    console.log('步数更新结果:', result);

    // 返回结果
    const response = {
      success: true,
      message: `步数修改成功: ${targetSteps}`,
      data: result
    };
    console.log('返回响应:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('API处理失败:', error);
    const response = {
      success: false,
      message: error.message || '服务器内部错误'
    };
    console.log('返回错误响应:', response);
    res.status(500).json(response);
  }
} 