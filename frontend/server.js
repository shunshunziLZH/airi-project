// 👇 【终极魔法】：第一行必须是这个！它会自动去读同目录下的 .env 文件
require('dotenv').config() 

const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')

// 🕵️ 【侦察兵】：让管家大声喊出来他有没有拿到钥匙！
console.log('====================================')
if (process.env.MODELSCOPE_API_KEY) {
  console.log('✅ 管家大喊：我拿到钥匙啦！前缀是：', process.env.MODELSCOPE_API_KEY.substring(0, 6) + '***')
} else {
  console.log('❌ 糟糕：管家的口袋是空的！(undefined)')
}
console.log('====================================')

const app = express()
app.use(cors()) 
app.use(express.json()) 

// 管家用钥匙配置大模型
const openai = new OpenAI({
  apiKey: process.env.MODELSCOPE_API_KEY, 
  baseURL: 'https://api-inference.modelscope.cn/v1' 
})

app.post('/api/chat', async (req, res) => {
  try {
    const frontendMessages = req.body.messages

    const completion = await openai.chat.completions.create({
      model: "Qwen/Qwen3.5-27B", 
      messages: frontendMessages,
      temperature: 0.8,
    })

    const realReply = completion.choices[0].message.content
    res.json({ reply: realReply })

  } catch (error) {
    console.error('大模型接口报错：', error.message || error)
    res.status(500).json({ error: error.message || '大脑连接失败' })
  }
})

app.listen(3000, () => {
  console.log('🤖 管家已就绪！正在监听 http://localhost:3000')
})