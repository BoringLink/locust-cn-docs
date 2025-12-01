---
title: Locust快速开始 | 5分钟入门教程
description: 通过 3 个步骤写出第一个 Locust 场景并运行 Web UI，5 分钟看见吞吐曲线
sidebar_position: 2
lastUpdated: 2025-11-27
---

# 快速开始

> 目标：让你在 5 分钟内写出第一个 `locustfile.py`、运行 Web UI，并理解关键 CLI 选项。

## 准备环境

- 已安装 Python 3.8+ 与 `pip`
- 已执行 `pip install locust`（参见 [安装文档](/getting-started/installation)）
- 将工作目录切换到包含 `locustfile.py` 的项目根目录

## 第一步：创建 `locustfile.py`

```python {1-20} showLineNumbers title="locustfile.py"
from locust import HttpUser, task, between

class StorefrontUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def browse_products(self):
        self.client.get('/catalog')

    @task
    def view_cart(self):
        self.client.get('/cart')

    @task
    def checkout(self):
        payload = {"item_id": 42, "quantity": 1}
        self.client.post('/checkout', json=payload)
```

- `HttpUser`：代表虚拟用户。你也可以继承 `FastHttpUser` 以获得更高吞吐量。
- `wait_time`：控制任务间的等待区间，让负载更贴近真实用户。
- `@task(weight)`：通过权重表达任务频率。

## 第二步：运行与观察

```bash
$ locust -f locustfile.py --headless -u 500 -r 25 --run-time 3m --csv ./reports/storefront
```

- `-u/--users`：并发用户上限。
- `-r/--spawn-rate`：每秒新增用户数（孵化速率）。
- `--run-time`：限定测试时长，避免遗忘停止。
- `--csv`：导出原始统计数据，便于分析。

需要实时界面时，传入 `locust -f locustfile.py`，打开浏览器访问 `http://localhost:8089`，填写 Users、Spawn rate 并点击 **Start swarming**。

## 第三步：解释指标

| 指标       | 说明                 | 如何提升                          |
| ---------- | -------------------- | --------------------------------- |
| RPS/QPS    | 每秒请求/查询数      | 提升并发或使用 `FastHttpUser`     |
| 响应时间   | 95%/99% 分位响应时间 | 优化后端或使用缓存                |
| 失败率     | 非 2xx/3xx 的比例    | 打印 `response.failure()` 诊断    |
| Hatch Rate | 实际孵化速率         | 调整 `--spawn-rate` 或扩容 Worker |

> 提示：首次出现的术语采用“中文(English)”格式，帮助你在中文语境中保持英文名词对照。

## 常见问题排查

1. **CPU 打满**：尝试 `FastHttpUser`、减小 `--users`，或开启多进程/分布式。
2. **连接超时**：确认压测目标允许足够的并发，或为 `self.client` 设置更高 `timeout`。
3. **指标不刷新**：确保浏览器未阻止 WebSocket；命令行模式则关注进度日志。

## 下一步

- 如果想逐行了解装饰器与等待时间，请继续阅读 [编写测试文件基础](/writing-locustfile/basics)。
- 需要完整英文参考时，访问 [Locust 官方文档 2.45.5](https://docs.locust.io/en/stable/)。

<!-- <NextReading /> -->
