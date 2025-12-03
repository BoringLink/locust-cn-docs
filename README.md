# Locust 中文文档

<div align="center">
  <img src="./docs/public/Locust-logo-lightmode.svg" alt="Locust Logo" style="max-width: 800px;" />
</div>

> 精准、及时、易读的 Locust 官方中文文档  
> 完整对应 Locust 2.45.5+，与官方英文版保持同步更新

[官方英文文档](https://docs.locust.io)
[中文文档](https://locustcndocs.boringlink.cn)

## Locust 是什么？

Locust 是目前最受欢迎的 Python 编写的开源性能测试工具，官方对它的定位是：

> “An open source load testing tool. Define user behaviour with Python code, and swarm your system with millions of simultaneous users.”

核心优势：

- 用纯 Python 脚本描述所有用户行为，灵活度极高
- 单台机器轻松支持数万甚至十万级并发
- 支持分布式运行，横向扩展几乎无上限
- 内置 Web UI 实时查看 RPS、响应时间、失败率等指标
- 社区活跃，被 Shopify、Mozilla、Microsoft、快手、字节跳动等大量公司用于生产环境

相比传统工具（如 JMeter、Gatling），Locust 更轻量、更易维护、学习成本更低，特别适合 Python 开发者与现代微服务架构团队。

## 本项目目标

为中文社区提供一套：

- 翻译准确、术语统一（首次出现均附英文原词）
- 版本同步及时（官方发布后 1-3 天内完成更新）
- 阅读体验优秀（响应式布局、中文拼音搜索、移动端友好）
- 完全开源免费的 Locust 中文文档

## 简单上手示例（30 秒跑通第一个测试）

```python
# locustfile.py
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)          # 每个用户思考时间 1~3 秒

    @task
    def index(self):
        self.client.get("/")

    @task(3)                           # 权重 3，比上面高 3 倍
    def view_item(self):
        self.client.get("/item?id=12345")
```

运行：

```bash
pip install locust
locust -f locustfile.py --host=https://example.com
```

打开 http://localhost:8089 即可开始压测。

## 欢迎使用与贡献

如果您正在学习或使用 Locust，这份中文文档会帮您大幅降低阅读门槛。
发现翻译问题、遗漏内容、或者希望参与维护，欢迎随时：

- 提交 Issue
- 直接 PR
- 在 Discussions 交流使用经验

感谢所有贡献者和使用者的支持

## 捐助 Donation

如果您觉得这个项目对您有帮助，欢迎通过以下方式支持我：

<div>
  <img src="/docs/public/支付宝收款码.JPG" alt="支付宝收款码" style="width: 200px; margin-right: 20px;" />
</div>
