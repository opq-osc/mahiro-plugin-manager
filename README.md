# Mahiro Memes

使用于 [Mahiro](https://github.com/opq-osc/mahiro) 的插件管理组件，拥有一些hack指令。


## usage:

### 安装插件依赖

```bash
pnpm add mahiro-plugin-manager
```

### 加载插件

```typescript
...
import manager from 'mahiro-plugin-manager'

...
mahiro.use(manager({
  superAdmins: [123456]
}))
...
```

### 使用插件

私聊或在群里发送「插件管理」获得帮助
