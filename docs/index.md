---
layout: home
title: Locust 中文文档
titleTemplate: 简单、可扩展的性能测试工具

hero:
  name: Locust
  text: 性能测试框架
  tagline: 简单、可扩展、开源 - 用 Python 编写性能测试
  image:
    src: /assets/branding/Locust-logo.svg
    alt: Locust Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started/installation
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/locustio/locust

features:
  - icon: 🐍
    title: 纯 Python 编写
    details: 使用熟悉的 Python 代码定义用户行为，无需学习新的 DSL 或配置语言

  - icon: 🚀
    title: 分布式可扩展
    details: 支持分布式负载测试，可以在多台机器上运行，模拟数百万并发用户

  - icon: 📊
    title: 实时 Web UI
    details: 提供美观的 Web 界面，实时查看测试统计数据和图表

  - icon: 🔧
    title: 高度可定制
    details: 灵活的架构设计，可以测试任何系统，不仅限于 Web 应用

  - icon: ⚡
    title: 性能卓越
    details: 基于事件驱动，单机可模拟数千并发用户

  - icon: 🌐
    title: 开源免费
    details: MIT 许可证，完全开源，社区活跃
---

## 文档信息架构（基于 Locust 2.45.5）

- 入门（Getting started）
  - 认识 Locust：了解工具定位、特性与许可，确认是否满足团队需求
  - 安装与首个测试：完成 `locust` 安装、运行 Web UI，并熟悉常用 CLI 选项
- 编写 Locustfile（Writing Locust tests）
  - 基础语法：掌握 `HttpUser`、任务、权重、等待时间与资源结构
  - 用户与任务建模：拆分任务集、为不同角色建模，并使用标签/事件钩子
- 运行测试（Running your Locust tests）
  - 配置与优化：管理 CLI 参数、`locust.conf`、环境变量以及观察指标
  - 分布式压测：搭建 Master/Worker、横向扩容、在容器或云环境中运行
- API & 进阶（API / Other functionalities）
  - API 导览：定位 2.45.5 的核心类、装饰器与事件钩子
  - 进阶能力：自定义负载形状、扩展协议、采集统计与日志

> 如果需要英文原版，请访问 [Locust 官方文档（2.45.5）](https://docs.locust.io/en/stable/)；中文站点保持内容同步，并在首次出现术语时提示“中文(English)”以确保阅读准确性。

## 为什么选择 Locust？

Locust 是一个易于使用、可编写脚本且可扩展的性能测试工具。你可以使用常规的 Python 代码定义用户行为，而不是被困在 UI 或特定领域的语言中。

这使得 Locust 可以无限扩展，并且对开发人员非常友好。

## 快速示例

```python {1-3} showLineNumbers title="locustfile.py"
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def index(self):
        self.client.get("/")

    @task(3)
    def view_item(self):
        self.client.get("/item?id=1")
```

## 接下来

<div class="vp-doc" style="margin-top: 2rem;">

- [安装 Locust](/getting-started/installation) - 开始你的第一个性能测试
- [编写测试文件](/writing-locustfile/basics) - 学习如何编写 Locust 测试
- [API 参考](/api/) - 查看完整的 API 文档

</div>
