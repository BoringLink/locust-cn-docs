---
title: 任务和用户
titleTemplate: 文档
description: 使用多个用户角色、任务集与标签打造可伸缩的 Locust 场景
sidebar_position: 2
lastUpdated: 2025-11-27
---

# 任务与用户建模

复杂系统往往包含多种用户角色（买家、卖家、后台运营等）。本章汇总官方文档 “Tasks”、“TaskSets”、“Events” 章节的最佳实践。

## 多用户协同

```python {1-60} showLineNumbers title="locustfile.py"
from locust import HttpUser, FastHttpUser, task, between

class Buyer(HttpUser):
    wait_time = between(1, 3)

    @task(4)
    def list_products(self):
        self.client.get('/catalog')

    @task(2)
    def checkout(self):
        order = {"item_id": 9, "quantity": 1}
        self.client.post('/checkout', json=order)

class Seller(FastHttpUser):
    wait_time = between(2, 5)

    @task
    def sync_inventory(self):
        self.client.put('/inventory/bulk', json={"sku": "A-1", "stock": 50})
```

- 将不同角色分别定义，便于单独调参。
- 混用 `HttpUser` 与 `FastHttpUser`，在高并发时报价更稳定。

## 使用标签

```python {1-25} showLineNumbers title="tags.py"
from locust import tag

@tag('critical')
@task(3)
def submit_order(self):
    ...
```

- 运行时通过 `--tags critical` 或 `--exclude-tags slow` 选择子集。
- 建议统一标签字典，避免命名冲突。

## SequentialTaskSet/TaskSet

- `SequentialTaskSet`：按顺序执行（登录→浏览→提交）。
- 嵌套 TaskSet 可以模拟更复杂的用户旅程。

```python {1-40} showLineNumbers title="flows/order_flow.py"
from locust import SequentialTaskSet, task

class OrderFlow(SequentialTaskSet):
    @task
    def login(self):
        self.client.post('/login', json={"user": "demo", "password": "demo"})

    @task
    def add_item(self):
        self.client.post('/cart', json={"item_id": 3})

    @task
    def pay(self):
        self.client.post('/orders/pay', json={"method": "card"})
```

## 共享状态与数据隔离

- 使用 `self.environment.runner.user_count` 了解当前用户量。
- 通过 `self.user_data = context` 在 `on_start` 中注入个性化数据。
- 针对支付等流程，使用唯一 ID 防止脏数据。

## 错误可观测性

1. 在任务中捕获业务校验失败，并调用 `response.failure('原因')`。
2. 借助 `events.test_start`/`events.test_stop` 输出环境信息到日志。
3. 使用 `--html` 或 CSV 报告结合外部监控（Grafana、DataDog）。

<!-- <NextReading /> -->
