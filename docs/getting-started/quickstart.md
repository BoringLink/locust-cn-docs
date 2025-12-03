---
title: 快速上手
titleTemplate: 快速开始
description: 5分钟跑通第一个压测任务，15分钟学会写出可复现、可分享、可落CI的生产级 Locust 场景
sidebar_position: 2
lastUpdated: 2025-12-03
---

# 快速上手 Locust（从 0 到生产级压测）

开始之前，确保你已经[安装 Locust](/getting-started/installation)

- **5 分钟**：写出第一个 `locustfile.py` 并看到实时吞吐曲线
- **15 分钟**：把试验脚本升级为团队可复用、可追踪、可自动化的生产级压测模板

## 跑通第一个压测

### 创建 `locustfile.py`

```python title="locustfile.py"
from locust import HttpUser, task, between

class QuickUser(HttpUser):
    # 模拟真实用户思考时间 1~3 秒
    wait_time = between(1, 3)

    @task(3)  # 权重 3，最常执行
    def browse_homepage(self):
        self.client.get("/")

    @task(2)
    def view_product(self):
        self.client.get("/product/123")

    @task(1)
    def add_to_cart(self):
        self.client.post("/cart", json={"product_id": 123, "qty": 1})
```

### 1.2 两种启动方式任选其一

**方式 A：可视化 Web UI**

```bash
locust -f locustfile.py
```

通过终端或直接打开 http://localhost:8089 → 填写 User 数量和 Spawn Rate → 开始测试

**方式 B：无头模式**

```bash
locust -f locustfile.py --headless -u 200 -r 20 --run-time 2m --csv=quick_report
```

你可以：

- 查看实时 RPS 曲线
- 查看平均 / P95 / P99 RT
- 查看失败率统计
- 导出 CSV + HTML 报告

恭喜！你已经完成 Locust 的“Hello World”！

## 升级为生产级、可复现的压测模板

下面 4 个步骤能让你直接跨越到工程化阶段。

### 1. 明确压测目标（写进脚本注释，防止遗忘）

```python
# 压测目标：
# - 验证商品详情页在 500 RPS 下 P95 < 600ms
# - 模拟真实流量比例：浏览商品 50%、查看详情 30%、加入购物车 20%
```

### 2. 编写带权重的真实场景 + 自定义失败标记

```python {1-45} showLineNumbers title="locustfile.py"
from locust import HttpUser, task, between

class Shopper(HttpUser):
    host = "https://your-app.com"          # 统一设置域名
    wait_time = between(1, 5)              # 更真实的思考时间

    @task(5)   # 50% 流量
    def list_products(self):
        self.client.get("/api/products?limit=20")

    @task(3)   # 30% 流量
    def view_product_detail(self):
        # 可加入参数化，让每次请求不同商品
        product_id = self.environment.runner.user_count % 1000 + 1000
        resp = self.client.get(f"/api/products/{product_id}")
        if resp.status_code != 200:
            resp.failure("商品详情加载失败")

    @task(2)   # 20% 流量
    def add_to_cart(self):
        payload = {"product_id": 1001, "quantity": 1}
        resp = self.client.post("/api/cart/add", json=payload)
        if resp.json().get("success") is not True:
            resp.failure("加入购物车失败")
```

### 3. 选择最适合你当前阶段的运行方式

<ResponsiveTable :headers="['场景', '推荐命令', '说明']" :rows="[
  ['本地调试', '`locust -f locustfile.py`', 'Web UI 实时调参'],
  ['CI 自动化验证', '`locust --headless -u 500 -r 50 --run-time 10m --csv=report --html=report.html`', '自动出报告,失败时 exit code 非 0'],
  ['大规模分布式压测', 'Master: `locust -f locustfile.py --master`<br>Worker: `locust -f locustfile.py --worker --master-host=Master IP`', '单机轻松破万 RPS']
]" :allow-html="true" />

### 4.保存结果

1. **固定参数写进配置文件 `locust.conf`**（推荐）

   ```ini title="locust.conf"
   users = 500
   spawn-rate = 50
   run-time = 15m
   headless = true
   csv = reports/result
   html = reports/result.html
   ```

2. **指定配置文件**

   ```bash
   locust -c locust.conf
   ```

3. **关键数据直接截图或导出**
   - Web UI 导航栏 → Download Data（CSV）
   - 失败请求明细 → Exceptions 标签页

## 常见问题速查

<ResponsiveTable :headers="['问题', '解决方案']" :rows="[
  ['本地 CPU 100%', '改用 FastHttpUser (性能提升 5~10 倍)'],
  ['连接被目标服务器拒绝', '目标服务器的白名单添加 Locust 机器 IP,或在脚本里设置 `self.client.headers` 伪装 User Agent'],
  ['Web UI 不刷新', '确认防火墙放通 8089、5557、5558 端口'],
  ['想参数化大量商品 ID', '使用 SequentialTaskSet + CSV 数据文件']
]"  />

## 下一步推荐阅读

- [编写专业 Locustfile（参数化、数据池、事件钩子）](/writing-locustfile/basics)
- [官方英文文档](https://docs.locust.io/en/stable/quickstart.html)

现在，你已经拥有一个**真正可落地、可分享、可追溯**的 Locust 压测模板了。把这份文档发给团队新成员，他们也能在 15 分钟内独立跑出标准压测报告。

祝你压出所有瓶颈！
