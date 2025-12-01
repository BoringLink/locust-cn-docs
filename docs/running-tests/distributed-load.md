---
title: 分布式负载
description: 在 Master/Worker 架构下扩展并发，支撑更高 RPS
sidebar_position: 2
lastUpdated: 2025-11-27
---

# 分布式负载

当单机已无法满足吞吐需求时，可以使用 Locust 的 Master/Worker 模式。本章对应官方章节 “Distributed load generation”、“Running in Docker”。

## 1. 架构回顾

- **Master**：负责协调、聚合统计、提供 Web UI。
- **Worker**：执行任务，周期性向 Master 汇报状态。

```bash
# 终端 1：Master
$ locust -f locustfile.py --master --expect-workers 4 --web-host 0.0.0.0

# 终端 2~5：Worker
$ locust -f locustfile.py --worker --master-host 192.168.1.10
```

## 2. CLI 选项

<ResponsiveTable
  :headers='["角色", "关键参数", "说明"]'
  :allowHtml="true"
  :rows='[
    [
      {"html":"<span style=\"display:inline-block; min-width: 90px;\">Master</span>"},
      {"html":"<code style=\"display:block; white-space: normal; word-break: break-word;\">--master<br />--expect-workers</code>"},
      {"html":"<span style=\"display:inline-block; min-width: 320px;\">指定 Worker 数并等待全部就绪</span>"}
    ],
    [
      {"html":"<span style=\"display:inline-block; min-width: 90px;\">Worker</span>"},
      {"html":"<code style=\"display:block; white-space: normal; word-break: break-word;\">--worker<br />--master-host<br />--master-port</code>"},
      {"html":"<span style=\"display:inline-block; min-width: 320px;\">指向 Master 地址</span>"}
    ],
    [
      {"html":"<span style=\"display:inline-block; min-width: 90px;\">通用</span>"},
      {"html":"<code style=\"display:block; white-space: normal; word-break: break-word;\">--heartbeat-liveness<br />--heartbeat-interval</code>"},
      {"html":"<span style=\"display:inline-block; min-width: 320px;\">调整心跳间隔，处理高延迟网络</span>"}
    ]
  ]'
/>

## 3. Docker / Kubernetes

```bash
$ docker run --rm -it --network locust-net \
  -v $PWD:/mnt/locust locustio/locust:2.45.5 \
  -f /mnt/locust/locustfile.py --worker --master-host master
```

- 使用 `docker compose` 或 Helm Chart（参见官方 Kubernetes Operator）。
- 将脚本与依赖挂载到容器内，保持与本地一致。

## 4. 常见问题

1. **Worker 未注册**：检查网络、端口 5557/5558 是否放行。
2. **吞吐有限**：确认 Worker 主机 CPU/网络是否打满，必要时使用 `FastHttpUser`。
3. **统计不一致**：确保所有 Worker 使用相同版本代码与依赖。

## 5. 结合 Locust Cloud

- Locust 官方提供云托管平台，可省去自建 Master/Worker 的成本。
- 通过 `locust cloud run --file locustfile.py` 上传并触发测试。

## 6. 示例

> 若需要更多示例（Docker、Kubernetes、云端），请查阅 [Distributed load generation](https://docs.locust.io/en/stable/running-distributed.html)。

<!-- <NextReading /> -->
