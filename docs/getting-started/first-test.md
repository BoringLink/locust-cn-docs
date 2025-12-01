---
title: Locust第一个测试 | 从零构建可复现的压测场景
description: 结合 Web UI 与 CLI，构建可复现的 Locust 首个压测任务
sidebar_position: 3
lastUpdated: 2025-11-27
---

# 第一个测试

本章延续 [快速开始](/getting-started/quickstart)，帮助你把试验脚本升级为可复用的“场景模板”，确保团队成员都能快速跑通。

## 1. 规划场景

1. 明确目标（例如“验证商品列表在 300 RPS 下的延迟”）。
2. 收集关键 API 与典型用户路径。
3. 设定成功指标：如 P95 响应时间 < 800ms、失败率 < 1%。

> 需要英文对照时，随时查阅 [官方 Getting started 指南 (2.45.5)](https://docs.locust.io/en/stable/quickstart.html)。

## 2. 拆分任务

```python {1-30} showLineNumbers title="locustfile.py"
from locust import HttpUser, task, between

class Shopper(HttpUser):
    wait_time = between(1, 2)

    @task(5)
    def list_products(self):
        self.client.get('/api/products?limit=20')

    @task(2)
    def view_product(self):
        item_id = 1001
        self.client.get(f'/api/products/{item_id}')

    @task
    def add_to_cart(self):
        payload = {"item_id": 1001, "quantity": 1}
        response = self.client.post('/api/cart', json=payload)
        if response.status_code != 200:
            response.failure('无法添加购物车')
```

- 使用不同权重表达真实访问比例。
- 通过 `response.failure()` 在 UI 与日志中记录自定义错误。

## 3. 选择运行模式

| 需求     | 推荐命令                                              | 说明                        |
| -------- | ----------------------------------------------------- | --------------------------- |
| 调试任务 | `locust -f locustfile.py`                             | 使用 Web UI，实时调整用户数 |
| 自动化   | `locust --headless -u 300 -r 30 --run-time 5m`        | 适合集成到 CI               |
| 扩容     | `locust -f locustfile.py --master --expect-workers 4` | 搭配 Worker 进程            |

## 4. 记录实验参数

1. 把 CLI 参数写入 `README` 或 `locust.conf`，确保可追踪。
2. 勾选 Web UI 左上角的“Download Data”，或使用 `--csv`/`--html` 输出。
3. 使用 Git 标签记录脚本版本，对齐后端代码基线。

## 5. 分享结果

- 复制 Web UI 截图或 CSV 中的关键数据。
- 说明请求模型、峰值负载、瓶颈分析与改进建议。

<!-- <NextReading /> -->
