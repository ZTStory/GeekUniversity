# GeekUniversity

## 浏览器工作原理

浏览器从输入一个 url 到最终渲染出界面总共经历了 5 个部分

### 1、HTTP 请求

通过手动拼接 Request 报文及解析 Response 报文，进一步了解 HTTP 请求的细节

### 2、HTML 解析

通过 FSM 将文本拆解为 Tag+attribute、通过 stack 将 tag 组解析为 DOM 树

### 3、CSS 计算

通过 css 库收集 css 规则，根据选择器将其与元素匹配，在将每个元素对应的样式根据 specificity 计算得出最终的 computedStyle，形成带有样式的 DOM 树

### 4、Layout 排版

这里着重处理了 flex 布局下的排版，先将元素收进 flexLines，对每一行的子元素进行主轴与交叉轴的位置计算，最终得到带有位置属性的 DOM 树

### 5、render 成图像

利用 images 库将 viewport 作为画布按照 DOM 树子元素位置进行一一绘制，得到最终的图片

最终交给浏览器渲染展示
