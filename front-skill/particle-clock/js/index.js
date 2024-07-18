const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {
  willReadFrequently: true // 优化频繁读取 可提升性能
});

// 设置画布大小
function setCanvasSize() {
  canvas.width = window.innerWidth * devicePixelRatio; // 设置画布宽度 为屏幕宽度
  canvas.height = window.innerHeight * devicePixelRatio; // 设置画布高度 为屏幕高度
}

setCanvasSize();

/**
 * 获取[min, max]之间的随机整数
 */
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class Particle {
  constructor() {
    this.size = getRandom(2 * devicePixelRatio, 7 * devicePixelRatio); // 粒子大小
    const r = Math.min(canvas.width, canvas.height) / 2; // 圆半径
    const rad = getRandom(0, 360) * Math.PI / 180; // 随机弧度
    const cx = canvas.width / 2; // 圆心x坐标
    const cy = canvas.height / 2; // 圆心y坐标
    this.x = cx + r * Math.cos(rad); // 粒子x坐标
    this.y = cy + r * Math.sin(rad); // 粒子y坐标
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = '#5445544d';
    ctx.fill();
  }

  moveTo(targetX, targetY) {
    const duration = 500; // 动画持续时间
    const startTime = Date.now(); // 动画开始时间
    const startX = this.x; // 动画开始x坐标
    const startY = this.y; // 动画开始y坐标
    const xSpeed = (targetX - startX) / duration; // x速度
    const ySpeed = (targetY - startY) / duration; // y速度

    const _move = () => {
      const currentTime = Date.now(); // 当前时间
      const passTime = currentTime - startTime; // 已过时间
      if (passTime >= duration) {
        this.x = targetX;
        this.y = targetY;
        return;
      }
      this.x = startX + xSpeed * passTime;
      this.y = startY + ySpeed * passTime;
      requestAnimationFrame(_move);
    };

    _move();
  }
}

const particles = [];
let text = null; // 当前时间

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  clear();
  update();
  requestAnimationFrame(draw); // 递归调用
}

function getText() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
} // 获取当前时间

function update() {
  const newText = getText(); // 获取新时间
  if (newText !== text) {
    text = newText;
    const { width, height } = canvas;
    ctx.fillStyle = '#000'; // 设置填充颜色
    ctx.textBaseline = 'middle'; // 设置文本基线
    ctx.textAlign = 'center'; // 设置文本对齐方式
    ctx.font = `${140 * devicePixelRatio}px Arial`; // 设置字体
    clear();
    ctx.fillText(text, width / 2, height / 2); // 绘制文本
    const points = getPoints(); // 获取文本像素点
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i]; // 获取像素点坐标
      let p = particles[i]; // 获取粒子
      if (!p) { // 如果粒子不存在
        p = new Particle(); // 创建粒子
        particles.push(p); // 添加到数组
      }
      p.moveTo(x, y); // 移动到目标位置
      p.draw(); // 绘制粒子
    }

    if (particles.length > points.length) { // 如果粒子数量大于像素点数量
      particles.splice(points.length); // 删除多余的粒子
    }
  } else {
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw(); // 仅绘制粒子
    }
  }
}

function getPoints() {
  const points = []; // 存储像素点
  // 获取文本像素信息
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const gap = 6; // 间隔
  for (let i = 0; i < canvas.width; i += gap) {
    for (let j = 0; j < canvas.height; j += gap) {
      const index = (i + j * canvas.width) * 4; // 获取当前像素点的索引
      const r = data[index]; // 红色通道
      const g = data[index + 1]; // 绿色通道
      const b = data[index + 2]; // 蓝色通道
      const a = data[index + 3]; // 透明度

      if (r === 0 && g === 0 && b === 0 && a === 255) { // 黑色
        points.push([i, j]); // 添加到数组
      }
    }
  }

  return points;
}

draw();
