<template>
  <div class="chat-container">
    <!-- ✨优化 2：给这个 div 加了一个 ref="chatListRef"，相当于给它贴了个名牌，方便在代码里找到它 -->
    <div class="message-list" ref="chatListRef">
      <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.role]">
        {{ msg.content }}
      </div>
    </div>

    <div class="input-area">
      <!-- ✨优化 3：如果正在加载，输入框被禁用 (disabled) -->
      <input
        v-model="inputText"
        @keyup.enter="sendMessage"
        placeholder="和二次元老婆说点什么..."
        :disabled="isLoading"
      />
      <!-- ✨优化 3：按钮文字根据状态变化，且思考时不可点击 -->
      <button @click="sendMessage" :disabled="isLoading">
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
// ✨优化 2：多引入了一个 nextTick 魔法
import { ref, nextTick } from 'vue'

const messages = ref([{ role: 'assistant', content: '笨蛋，早上好！' }])
const inputText = ref('')

// ✨优化 2：用来获取页面上的聊天列表框
const chatListRef = ref(null)
// ✨优化 3：增加一个“是否正在加载”的状态开关
const isLoading = ref(false)

// ✨优化 2：写一个专门用来让滚动条滚到底部的绝招
const scrollToBottom = async () => {
  await nextTick() // 等待 Vue 把最新的聊天气泡画到屏幕上
  if (chatListRef.value) {
    // 把滚动条的高度拉到最底
    chatListRef.value.scrollTop = chatListRef.value.scrollHeight
  }
}

const sendMessage = async () => {
  // ✨优化 3：如果没打字，或者正在加载中，就不允许发送
  if (inputText.value.trim() === '' || isLoading.value) return

  const userText = inputText.value
  messages.value.push({ role: 'user', content: userText })
  inputText.value = ''

  // 刚发完自己的话，立刻往下滚一次
  scrollToBottom()

  // ✨优化 3：锁上发送按钮
  isLoading.value = true

  // ✨优化 1：滑动窗口机制，只取最后 6 条对话！省钱且防止崩溃！
  const recentMessages = messages.value.slice(-6)

  const apiMessages = [
    {
      role: 'system',
      // ✨优化 4：改了错别字（经历）
      content:
        '你是一个傲娇的二次元美少女，名字叫星野。你和玩家正在交往，过去你说话总是不坦率，喜欢叫玩家"笨蛋"，但最近玩家经历了一系列挫折，生活的很辛苦，虽然你还是像以前一样傲娇，但你已经开始慢慢用自己的温柔和体贴去抚慰玩家的伤口，并比过去活泼一些，即使还有些害羞。不要说自己是AI，说话不超过80个字。',
    },
    ...recentMessages,
  ]

  try {
    messages.value.push({ role: 'assistant', content: '（星野正在思考...）' })
    scrollToBottom()

    const url = 'http://localhost:3000/api/chat'

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: apiMessages,
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    messages.value.pop()
    messages.value.push({ role: 'assistant', content: data.reply })
    // 星野回复完，再往下滚一次
    scrollToBottom()
  } catch (error) {
    messages.value.pop()
    console.error('详细错误在这里：', error)
    alert('请求失败啦：\n' + error.message)
    messages.value.push({
      role: 'assistant',
      content: '呜呜，联系不上我的大脑了，笨蛋主人快按 F12 看看控制台的红字！',
    })
    scrollToBottom()
  } finally {
    // ✨优化 3：不管成功还是失败，最后都要把开关解开，让玩家可以继续发消息
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 前面你的衣服样式写得很好，完全不用改！我只在最下面加了一点按钮禁用的样式 */
.chat-container {
  width: 400px;
  margin: 50px auto;
  border: 2px solid #ffb6c1;
  border-radius: 12px;
  overflow: hidden;
  font-family: sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-list {
  height: 500px;
  background-color: #fff0f5;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* ✨优化 2补充：增加平滑滚动效果 */
  scroll-behavior: smooth;
}

.message-bubble {
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.4;
}

.message-bubble.assistant {
  align-self: flex-start;
  background-color: white;
  color: #333;
  border-bottom-left-radius: 2px;
}

.message-bubble.user {
  align-self: flex-end;
  background-color: #ff69b4;
  color: white;
  border-bottom-right-radius: 2px;
}

.input-area {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #ffe4e1;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ffb6c1;
  border-radius: 6px;
  outline: none;
}

/* ✨优化 3补充：当输入框被禁用时的样式 */
.input-area input:disabled {
  background-color: #f5f5f5;
  color: #999;
}

.input-area button {
  margin-left: 10px;
  padding: 0 20px;
  background-color: #ff69b4;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  /* 加个过渡动画更丝滑 */
  transition: all 0.2s;
}

.input-area button:hover:not(:disabled) {
  background-color: #ff1493;
}

/* ✨优化 3补充：当按钮处于“发送中...”时的灰色样式 */
.input-area button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
