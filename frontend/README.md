# Time Glass 前端

这是Time Glass应用的前端部分，使用React、Next.js、Tailwind CSS和shadcn/ui构建。

## 技术栈

- [Next.js](https://nextjs.org/) - React框架
- [React](https://reactjs.org/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - 组件库

## 开发环境要求

- Node.js 18.0.0或更高版本
- npm 9.0.0或更高版本

## 安装

1. 安装依赖：
   ```bash
   cd frontend
   npm install
   ```

## 开发

启动开发服务器：

```bash
npm run dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 构建

构建生产版本：

```bash
npm run build
```

## 运行生产版本

```bash
npm start
```

## 项目结构

- `app/` - Next.js应用路由和页面
- `components/` - React组件
  - `ui/` - shadcn/ui组件
- `lib/` - 工具函数和共享代码
- `public/` - 静态资源

## 与后端通信

前端通过API与后端通信。API端点配置在环境变量中。
