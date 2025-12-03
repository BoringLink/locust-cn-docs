---
title: 运行配置
titleTemplate: 运行测试
description: 管理 CLI、配置文件与环境变量，稳定运行 Locust 场景
sidebar_position: 1
lastUpdated: 2025-11-27
---

# 运行配置

本章映射官方章节 “Configuration” 与 “Running without the Web UI”。你会看到 CLI、配置文件、环境变量以及分布式参数的准确来源与示例，方便在本地、CI、容器与 Locust Cloud 之间复用同一套设置。

## 1. CLI 速查（通用与 Web UI）

<ResponsiveTable
  :headers='["选项/分组", "作用", "示例"]'
  :allowHtml="true"
  :rows='[
    [{"html":"<code>--locustfile / -f</code>"}, "指定一个或多个测试脚本、目录或远程 URL，默认 locustfile.py", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--locustfile locustfiles/more_files/api.py</code>"}],
    [{"html":"<code>--config &lt;file&gt;</code>"}, "追加读取配置文件，默认会尝试 ~/.locust.conf、./locust.conf、./pyproject.toml", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--config ops/ci.conf</code>"}],
    [{"html":"<code>--host / -H</code>"}, "覆盖 HttpUser.host", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--host https://api.internal</code>"}],
    [{"html":"<code>--users / -u</code>"}, "峰值并发用户数，可在 Web UI 内部用 w/W、s/S 调整", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--users 2000</code>"}],
    [{"html":"<code>--spawn-rate / -r</code>"}, "用户孵化速率 (每秒)", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--spawn-rate 100</code>"}],
    [{"html":"<code>--run-time / -t</code>"}, "指定运行时长 (300s、20m、1h30m 等)", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--run-time 30m</code>"}],
    [{"html":"<code>--headless / --autostart</code>"}, "无 UI / 保留 UI 但自动启动", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--autostart --users 800</code>"}],
    [{"html":"<code>--autoquit</code>"}, "测试结束后 X 秒退出进程，配合 --autostart", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--autoquit 30</code>"}],
    [{"html":"<code>--web-host / --web-port</code>"}, "绑定 Web UI 的主机与端口，默认 */8089", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--web-host 0.0.0.0 --web-port 8089</code>"}],
    [{"html":"<code>--web-login</code>"}, "为 UI 启用登录页", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--web-login</code>"}],
    [{"html":"<code>--web-base-path</code>"}, "UI 的子路径前缀，例如 /locust", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--web-base-path /loadtest</code>"}],
    [{"html":"<code>--class-picker</code>"}, "在 UI 中选择 User/Shape 并可禁用任务", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--class-picker</code>"}],
    [{"html":"<code>--tags / -T 、 --exclude-tags / -E</code>"}, "通过标签包含/排除任务", {"html":"<code style=\"white-space: normal; word-break: break-word;\">--tags critical api</code>"}]
  ]'
/>

## 2. CLI 速查（分布式、统计、杂项）

<ResponsiveTable
  :headers='["分组", "关键选项", "说明"]'
  :allowHtml="true"
  :rows='[
  ["Master", {"html":"<code>--master、<br />--master-bind-host &lt;ip-or-iface&gt;、<br />--master-bind-port &lt;port&gt;、<br />--expect-workers &lt;worker-count&gt;、<br />--expect-workers-max-wait &lt;seconds&gt;</code>"}, "作为 Master 等待 Worker；后两者确保 Worker 全部就绪后再开跑"],
  ["Worker", {"html":"<code>--worker、<br />--master-host &lt;hostname-or-ip&gt;、<br />--master-port &lt;port&gt;、<br />--processes &lt;count-per-node&gt;</code>"}, "Worker 连接 Master，可用 --processes fork 多个 Worker（实验特性）"],
    ["统计输出", {"html":"<code>--csv、<br />--csv-full-history、<br />--html、<br />--json / --json-file、<br />--print-stats、<br />--only-summary、<br />--reset-stats</code>"}, "结合 --headless 构建自动化报表；--reset-stats 需 Master/Worker 同时开启"],
    ["日志", {"html":"<code>--loglevel / -L、<br />--logfile、<br />--skip-log-setup</code>"}, "默认 INFO，可完全自定义 logging 配置"],
    ["结束条件", {"html":"<code>--stop-timeout、<br />--exit-code-on-error、<br />--equal-weights、<br />--profile、<br />--otel</code>"}, "--stop-timeout 确保在退出前等待用户完成；--exit-code-on-error 让 CI 遇到失败时返回指定退码"],
    ["Locust Cloud", {"html":"<code>--cloud 及 --login、<br />--logout、<br />--delete、<br />--requirements、<br />--workers、<br />--non-interactive 等</code>"}, "直接在 Locust Cloud 创建分布式集群"],
    ["其他", {"html":"<code>--show-task-ratio、<br />--show-task-ratio-json、<br />--version</code>"}, "快速调试任务分布或查看版本"]
  ]'
/>

## 3. 配置优先级与搜索路径

官方加载顺序：`./pyproject.toml` → `./locust.conf` → (可选) `--config` 指定文件 → `LOCUST_*` 环境变量 → CLI 参数。默认还会尝试 `~/.locust.conf`。后者总是覆盖前者，因此推荐：

1. 把稳定参数写入 `locust.conf`；
2. 在 `pyproject.toml` 的 `[tool.locust]` 中维护团队级默认值；
3. 在 CI 中用环境变量或 CLI 覆盖用户数等动态字段。

## 4. `locust.conf` 模板

```ini {1-20} showLineNumbers title="locust.conf"
locustfile = locust_files/my_locust_file.py
headless = true
master = true
expect-workers = 5
host = https://target-system
users = 100
spawn-rate = 10
run-time = 10m
tags = [Critical, Normal]
html = ./reports/summary.html
loglevel = INFO
```

## 5. `pyproject.toml` 模板

```toml showLineNumbers title="pyproject.toml"
[tool.locust]
locustfile = "locust_files/my_locust_file.py"
headless = true
master = true
expect-workers = 5
host = "https://target-system"
users = 100
spawn-rate = 10
run-time = "10m"
tags = ["Critical", "Normal"]
```

> CLI 参数仍然拥有最高优先级；`--config extra.conf` 可额外叠加一份 ConfigArgParse 格式文件。

## 6. 环境变量速记

所有 CLI 开关都可以转换成 `LOCUST_<UPPER_SNAKE>` 环境变量，例如：

```bash
$ LOCUST_LOCUSTFILE=custom_locustfile.py \
  LOCUST_HOST=https://staging.example.com \
  LOCUST_USERS=1000 \
  LOCUST_SPAWN_RATE=100 \
  LOCUST_RUN_TIME=30m \
  locust --headless --only-summary
```

- Windows 中使用 `set` 或 PowerShell `$Env:LOCUST_HOST=...`。
- `LOCUST_USER_CLASSES` 可传入类名列表，等价于在命令末尾指定 User 类。
- 敏感令牌（API Key、Cookie）应通过环境变量注入，在 `HttpUser.on_start` 中读取并设置请求头。

## 7. 无头与自动化运行

```bash
$ locust --headless -u 800 -r 80 --run-time 15m \
  --csv ./reports/nightly --stop-timeout 60 --only-summary
```

- `--headless` + `-u/-r/-t` 触发非交互运行，通常配合 `--autoquit` 用于 CI。
- `--stop-timeout` 让模拟用户在退出前完成中的请求；分布式模式仅需 Master 设置。
- `--print-stats`/`--only-summary` 控制控制台输出频率；`--json`、`--json-file` 适合脚本解析最终结果。
- 与 `--expect-workers`、`--expect-workers-max-wait` 组合，确保 Worker 数量充足后再计时。

## 8. 多 <!-- term-replacer:ignore-start -->locustfile<!-- term-replacer:ignore-end --> 与类选择

- `-f` 接受逗号分隔的多个文件、目录或远程 URL，目录会递归加载所有 `*.py`（忽略 `_` 前缀）。
- 开启 `--class-picker` 后可在 UI 中选择 User/Shape、调整任务权重或固定用户数。
- 也可以在命令末尾显式列出 User/Shape 类名；或使用 `--config-users` JSON（单个/数组/文件）动态覆盖类属性：

```bash
$ locust --config-users '{"user_class_name":"Example", "fixed_count": 1}' \
  --config-users my_user_config.json
```

> `--config-users` 为实验特性，格式可能随版本调整，升级前需验证。

## 9. Profiles、自定义参数与统计定制

- `--profile`：为 testrun 打标签，可在 Web UI 高级选项填写；可通过 `environment.web_ui.template_args["all_profiles"]` 提供候选列表。
- 自定义 CLI 参数：参考官方 “Custom arguments”，在 locustfile 中为 `parser` 添加自定义 flags。
- 统计/日志常量可在测试启动前通过 `locust.stats` 模块覆盖，例如：

```python
import locust.stats

locust.stats.CONSOLE_STATS_INTERVAL_SEC = 15
locust.stats.PERCENTILES_TO_REPORT = [0.5, 0.9, 0.95, 0.99]
```

- 额外可覆盖的常量包括 `CSV_STATS_INTERVAL_SEC`、`HISTORY_STATS_INTERVAL_SEC`、`CURRENT_RESPONSE_TIME_PERCENTILE_WINDOW` 等；还可以通过 `locust.runners.WORKER_LOG_REPORT_INTERVAL`、`locust.web.HOST_IS_REQUIRED` 调整 Worker 日志推送与 UI host 必填校验。

## 10. 报告与观测

1. `--html report/test_report_{u}_{r}_{t}.html`：能够把 `{u}`、`{r}`、`{t}` 替换为实际参数，适合一次性分享。
2. `--csv prefix`：输出 `prefix_stats.csv`、`prefix_stats_history.csv`、`prefix_failures.csv`，并可加 `--csv-full-history` 记录每次采样。
3. `--json`/`--json-file`：把最终指标写入 JSON，搭配 `--skip-log` 便于机器处理。
4. 可在事件钩子里推送 Prometheus 或 InfluxDB，或使用 OpenTelemetry (`--otel`) 采集完整追踪。

## 11. 快速排错清单

- `--show-task-ratio`/`--show-task-ratio-json`：确认任务权重。
- `--reset-stats`：在预热完成后重置统计，避免启动阶段污染结果。
- `--equal-weights`：忽略 locustfile 中的权重，适合对比各任务吞吐。
- `--exit-code-on-error 2`：让 CI 在出现失败或错误时返回特定退出码。

<!-- <NextReading /> -->
