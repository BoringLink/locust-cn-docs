---
title: 编写 Locustfile 基础
description: 了解用户类、任务、等待时间与项目结构，打造可维护的压测脚本
sidebar_position: 1
lastUpdated: 2025-11-27
---

# 编写 Locustfile 基础

本章对应官方文档 “Writing a locustfile” 的核心部分，聚焦如下问题：

1. 如何组织用户类与任务？
2. 如何拆分模块以便复用？
3. 如何在脚本中加入指标与断言？

> 英文结构请参考 [Writing a locustfile (2.45.5)](https://docs.locust.io/en/stable/writing-a-locustfile.html)。

## 项目结构范例

```text
load-tests/
├─ locustfile.py
├─ users/
│  ├─ shoppers.py
│  └─ admins.py
├─ tasks/
│  ├─ cart.py
│  └─ auth.py
└─ utils/
   └─ data_builder.py
```

- 将不同角色的逻辑放入 `users/`，避免单文件过长。
- 把常用任务拆成独立模块，方便组合。

## 定义用户类

```python {1-30} showLineNumbers title="users/shoppers.py"
from locust import HttpUser, between
from tasks.cart import CartTasks

class ShopperUser(HttpUser, CartTasks):
    host = 'https://api.example.com'
    wait_time = between(0.5, 2)
```

- 通过 mixin 继承把任务分组。
- `host` 可以在 CLI 中覆盖，保持脚本可配置。

## 描述任务

```python {1-40} showLineNumbers title="tasks/cart.py"
from locust import task

class CartTasks:
    @task(5)
    def list_products(self):
        self.client.get('/catalog')

    @task(2)
    def view_product(self):
        product_id = 1001
        self.client.get(f'/products/{product_id}')

    @task
    def add_to_cart(self):
        payload = {"item_id": 1001, "quantity": 1}
        response = self.client.post('/cart', json=payload)
        if response.status_code != 200:
            response.failure('无法加入购物车')
```

- 在任务内使用 `response.failure()` 或 `response.success()` 记录自定义状态。
- 通过权重表达真实用户比例。

## 控制等待时间

| 函数                | 作用           | 适用场景                 |
| ------------------- | -------------- | ------------------------ |
| `between(min, max)` | 随机等待区间   | 模拟真实用户随机浏览     |
| `constant(seconds)` | 固定间隔       | 设备控制、IoT 等周期任务 |
| 自定义函数          | 返回动态等待值 | 复杂任务节奏控制         |

## 复用测试数据

- 在 `utils/data_builder.py` 中集中管理测试数据或凭证。
- 使用 Python 生成器或 `random` 为不同用户提供唯一输入。
- 当需要大规模数据时，提前准备 CSV/JSON 并在 `setup` 钩子中加载。

## 钩子与事件

- `@events.request.add_listener`：捕获请求耗时，输出到自定义监控。
- `@events.spawning_complete.add_listener`：用户全部孵化后触发，可用于预热。

<!-- <NextReading /> -->
