import { NODE_ICON_ALIASES, NODE_ICON_PATHS, NODE_ICON_TAGS } from './nodeIconsData.ts'

export { NODE_ICON_GROUPS, NODE_ICON_PATHS } from './nodeIconsData.ts'

export function nodeIconName(key: string | undefined): string {
  if (!key) return 'circle-dot'
  return NODE_ICON_ALIASES[key] ?? key
}

export function nodeIconPath(key: string | undefined): string {
  return NODE_ICON_PATHS[nodeIconName(key)] ?? FALLBACK
}

const FALLBACK = NODE_ICON_PATHS['circle-dot'] ?? ''

const ZH: Record<string, string> = {
  学习: 'school', 读书: 'book', 书: 'book', 笔记: 'notebook', 笔: 'pencil', 写: 'pencil',
  作业: 'notebook', 考试: 'certificate', 证书: 'certificate', 毕业: 'school', 学校: 'school',
  语言: 'language', 英语: 'abc', 单词: 'abc', 字母: 'abc', 翻译: 'language', 数学: 'calculator',
  数字: 'numbers', 公式: 'sum', 科学: 'flask', 实验: 'flask', 化学: 'flask', 物理: 'atom',
  地理: 'world', 历史: 'history', 文件: 'file', 文档: 'file', 文件夹: 'folder',
  编程: 'code', 代码: 'code', 程序: 'code', 开发: 'code', 终端: 'terminal', 命令行: 'terminal',
  数据库: 'database', 数据: 'database', 服务器: 'server', 网络: 'network', 接口: 'plug',
  前端: 'browser', 后端: 'server', 网页: 'browser', 浏览器: 'browser', 网站: 'world-www',
  安全: 'shield', 加密: 'lock', 密码: 'key', 钥匙: 'key', 锁: 'lock', 测试: 'flask',
  版本: 'git-branch', 分支: 'git-branch', 部署: 'rocket', 云: 'cloud', 芯片: 'cpu',
  电脑: 'device-desktop', 手机: 'device-mobile', 键盘: 'keyboard', 鼠标: 'mouse',
  机器人: 'robot', 人工智能: 'robot', 算法: 'binary-tree', 组件: 'components',
  运动: 'run', 跑步: 'run', 健身: 'barbell', 举重: 'barbell', 瑜伽: 'yoga', 拉伸: 'stretching',
  游泳: 'swimming', 骑车: 'bike', 自行车: 'bike', 篮球: 'ball-basketball', 足球: 'ball-football',
  网球: 'ball-tennis', 羽毛球: 'ball-volleyball', 跳绳: 'jump-rope', 爬山: 'mountain',
  登山: 'mountain', 步行: 'walk', 睡觉: 'bed', 睡眠: 'bed', 心脏: 'heart', 心: 'heart',
  肺: 'lungs', 大脑: 'brain', 脑: 'brain', 牙: 'dental', 眼睛: 'eye', 手: 'hand-stop',
  医生: 'stethoscope', 医院: 'building-hospital', 药: 'pill', 健康: 'heartbeat',
  吃: 'tools-kitchen', 做饭: 'tools-kitchen', 饮食: 'salad', 蔬菜: 'salad', 沙拉: 'salad',
  水果: 'apple', 苹果: 'apple', 面包: 'bread', 蛋糕: 'cake', 咖啡: 'coffee', 茶: 'teapot',
  酒: 'beer', 啤酒: 'beer', 水: 'droplet', 牛奶: 'milk', 米饭: 'bowl', 面: 'bowl',
  披萨: 'pizza', 汉堡: 'burger', 鸡蛋: 'egg', 肉: 'meat', 鱼: 'fish', 糖: 'candy',
  自然: 'plant', 树: 'tree', 花: 'flower', 草: 'plant', 叶子: 'leaf', 种子: 'seedling',
  发芽: 'seedling', 太阳: 'sun', 月亮: 'moon', 星星: 'star', 星: 'star', 云朵: 'cloud',
  雨: 'cloud-rain', 雪: 'snowflake', 风: 'wind', 火: 'flame', 闪电: 'bolt', 雷: 'bolt',
  山: 'mountain', 海: 'sailboat', 地球: 'world', 动物: 'paw', 猫: 'cat', 狗: 'dog',
  鸟: 'feather', 蝴蝶: 'butterfly', 宠物: 'paw',
  旅行: 'plane', 飞机: 'plane', 火车: 'train', 汽车: 'car', 车: 'car', 船: 'ship',
  公交: 'bus', 地铁: 'train', 地图: 'map', 位置: 'pin', 导航: 'compass', 路线: 'route',
  房子: 'home', 家: 'home', 建筑: 'building', 公司: 'building-skyscraper', 商店: 'building-store',
  办公室: 'building', 城市: 'building-community',
  创作: 'brush', 画画: 'brush', 画笔: 'brush', 设计: 'palette', 颜色: 'palette',
  调色: 'color-swatch', 音乐: 'music', 唱歌: 'microphone', 话筒: 'microphone',
  耳机: 'headphones', 吉他: 'guitar-pick', 钢琴: 'piano', 相机: 'camera',
  摄影: 'camera', 照片: 'photo', 视频: 'video', 电影: 'movie', 剪辑: 'scissors',
  写作: 'writing', 剧本: 'masks-theater', 舞台: 'masks-theater', 游戏: 'device-gamepad',
  手柄: 'device-gamepad', 骰子: 'dice', 棋: 'chess', 拼图: 'puzzle', 魔法: 'wand',
  钱: 'coin', 金币: 'coin', 工资: 'cash', 购物: 'shopping-cart', 商品: 'package',
  礼物: 'gift', 快递: 'truck-delivery', 支付: 'credit-card', 银行: 'building-bank',
  投资: 'chart-line', 图表: 'chart-bar', 统计: 'chart-pie', 增长: 'trending-up',
  时间: 'clock', 日历: 'calendar', 闹钟: 'alarm', 计时: 'stopwatch', 提醒: 'bell',
  消息: 'message', 聊天: 'message-circle', 邮件: 'mail', 电话: 'phone', 分享: 'share',
  团队: 'users', 人: 'user', 朋友: 'users', 会议: 'presentation',
  目标: 'target', 计划: 'checklist', 清单: 'checklist', 完成: 'checks',
  想法: 'bulb', 灵感: 'bulb', 灯: 'bulb', 奖杯: 'trophy', 奖牌: 'medal', 冠军: 'crown',
  皇冠: 'crown', 徽章: 'badge', 等级: 'stairs', 升级: 'stairs',
  火箭: 'rocket', 起飞: 'rocket', 工具: 'tool', 齿轮: 'settings', 电池: 'battery',
  能量: 'bolt', 宝石: 'diamond', 钻石: 'diamond', 收藏: 'bookmark', 标签: 'tag',
  搜索: 'search', 问号: 'help', 警告: 'alert-triangle', 禁止: 'forbid', 无限: 'infinity',
  循环: 'refresh', 开关: 'toggle-right', 锚: 'anchor', 桥: 'building-bridge', 钥匙扣: 'keyframe',
}

const CJK = /[㐀-鿿]/

function expand(query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  if (!CJK.test(q)) return q.split(/[\s,]+/).filter(Boolean)

  const out: string[] = []
  let i = 0
  while (i < q.length) {
    let hit = ''
    for (let len = Math.min(6, q.length - i); len >= 1; len--) {
      const word = q.slice(i, i + len)
      if (ZH[word]) {
        hit = ZH[word]
        i += len
        break
      }
    }
    if (hit) out.push(...hit.split(' '))
    else i += 1
  }
  return out
}

export function searchNodeIcons(query: string, limit = 240): string[] {
  const terms = expand(query)
  if (!terms.length) return []

  const hits: { name: string; rank: number }[] = []
  for (const name of Object.keys(NODE_ICON_PATHS)) {
    let best = 9
    for (const t of terms) {
      const at = name.indexOf(t)
      const rank =
        at === 0 ? 0 : at > 0 ? 1 : (NODE_ICON_TAGS[name]?.includes(t) ?? false) ? 2 : 9
      if (rank < best) best = rank
    }
    if (best < 9) hits.push({ name, rank: best })
  }
  hits.sort((a, b) => a.rank - b.rank || a.name.length - b.name.length)
  return hits.slice(0, limit).map((h) => h.name)
}
