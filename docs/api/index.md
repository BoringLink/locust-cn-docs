---
title: Locust API参考 | 完整类与方法文档
description: Locust 2.45.5 全量 API 参考，覆盖用户类、任务调度、事件、统计、扩展与配置
sidebar_position: 1
lastUpdated: 2025-11-30
---

# API 参考

Locust 2.45.5 的 API 涵盖用户脚本、调度、事件、统计、Web UI 与插件接口。本页按主题分节纵向列出每个 API 的用途、参数、属性与常见注意事项，可直接查阅并复制到脚本中使用。

:::warning 注意
若下述条目标注 `[实验性]`，表示官方可能在未来版本更改其行为或签名，使用前请评估升级成本。
:::

## 常见组合

1. **`HttpUser` + `@task` + `between`**：快速脚本化用户旅程，利用 `wait_time = between(1, 3)` 平衡吞吐。

   ```python
   from locust import HttpUser, task, between

   class BrowseUser(HttpUser):
   	wait_time = between(1, 3)

   	@task(3)
   	def list_products(self):
   		self.client.get("/api/products")
   ```

2. **`SequentialTaskSet` + `@tag` 过滤**：把复杂流程拆成顺序任务，再用 `--tags pay` 精确执行关键路径。

   ```python
   from locust import HttpUser, SequentialTaskSet, task, tag

   class CheckoutFlow(SequentialTaskSet):
   	@tag("pay")
   	@task
   	def create_order(self):
   		self.client.post("/orders")

   	@task
   	def pay(self):
   		self.client.post("/orders/pay")

   class Buyer(HttpUser):
   	tasks = [CheckoutFlow]
   ```

3. **`LoadTestShape` + `events.spawning_complete`**：自定义负载曲线，并在所有用户就绪时通知监控系统切换视图。

   ```python
   from locust import LoadTestShape

   class RampShape(LoadTestShape):
   	stages = [(60, 100, 5), (120, 200, 10)]

   	def tick(self):
   		run_time = self.get_run_time()
   		for duration, users, rate in self.stages:
   			if run_time < duration:
   				return users, rate
   		return None
   ```

4. **`Environment.stats` + 自定义 `web_ui` 面板**：将聚合统计暴露到 Web UI 页面或导出 CSV。

   ```python
   from locust import events

   def on_web_ready(environment, web_ui):
   	@web_ui.app.route("/ops/percentiles")
   	def percentiles():
   		stats = environment.stats.total.get_current_response_time_percentile(0.95)
   		return {"p95": stats}

   events.init.add_listener(lambda env, **_: on_web_ready(env, env.web_ui))
   ```

5. **`User` 子类 + `constant_throughput`**：自定义协议同时施加固定吞吐，用于 IoT、消息总线等场景。

   ```python
   from locust import User, task, constant_throughput

   class MqttUser(User):
   	wait_time = constant_throughput(5)

   	@task
   	def publish_sensor(self):
   		self.client.publish("/sensors", payload="{}")
   ```

## 用户与客户端基类

### `User`

- **用途**：所有协议用户的最小基类，提供生命周期钩子与 `Environment` 引用。
- **属性**：
  - `abstract (bool) = True`：保持为 `True` 可避免该类被直接实例化。
  - `environment (Environment)`：暴露统计、事件、运行器、Web UI。
  - `tasks (list | dict) = []`：任务集合；字典键可以是可调用或 `TaskSet`，值为权重。
  - `wait_time (callable)`：返回任务间等待秒数，通常使用 `between`、`constant`、`constant_pacing` 或 `constant_throughput`。
  - `host (str | None) = None`：目标主机。留空时可通过 CLI `--host` 指定。
  - `weight (int) = 1`：决定在多用户类间的调度概率。
  - `fixed_count (int) = 0`：>0 时忽略权重，固定生成指定数量的该用户实例。
- **生命周期方法**：
  - `on_start()`：用户实例开始执行前调用，可在此完成登录、预热连接。
  - `on_stop()`：实例回收前调用，用于释放资源或写回统计。
- **官方章节**： [User](https://docs.locust.io/en/stable/api.html#user-class)

:::warning 注意
`tasks` 属性在类定义阶段读取，如需动态调整任务，请在实例方法内修改 `self.tasks` 并确保线程安全。
:::

### `HttpUser`

- **用途**：基于 `requests.Session` 的 HTTP/HTTPS 客户端，自动计入统计。
- **属性**：
  - `client`：暴露 `get/post/...` 等方法，可自定义 headers、认证、hooks。
  - `session`：兼容旧接口，建议统一使用 `client`。
- **任务配置**：
  - `tasks (list | dict) = []`：继承 `User.tasks` 规则，可在类属性或 `on_start()` 内调整。
- **类属性**：
  - `abstract (bool) = True`：保持为 `True` 时不会被 Runner 直接调度。
  - `connection_timeout (float | None) = None` / `network_timeout (float | None) = None`：缺省值沿用 requests。
- **官方章节**： [HttpUser](https://docs.locust.io/en/stable/api.html#httpuser-class)

### `FastHttpUser`

- **用途**：基于 `geventhttpclient` 的高并发 HTTP 客户端，降低协程开销。
- **属性**：
  - `client`：API 与 `HttpUser` 相似，但 `stream=True`、`verify=False` 等参数的默认行为不同。
  - `pool_size` / `max_retries`：可在子类级别配置连接池大小与重试次数。
- **任务配置**：`tasks (list | dict) = []`，语义同 `User`。
- **类属性**：`abstract (bool) = True`，需要子类化后自动参与调度。
- **官方章节**： [FastHttpUser](https://docs.locust.io/en/stable/api.html#fasthttpuser-class)

### `WebSocketUser` [实验性]

- **用途**：gevent WebSocket 长连接用户，适合推送/订阅场景。
- **类属性**：`abstract (bool) = True`，需自定义子类才能运行。
- **方法**：
  - `connect(url, **kwargs)`：建立连接，可自定义 header、超时等。
  - `send(message)`：发送文本或二进制消息。
  - `recv()`：阻塞接收消息。
- **注意**：当前仍属实验性，需要手动记录统计与状态。
- **官方章节**： [WebSocketUser](https://docs.locust.io/en/stable/api.html#websocketuser)

### 自定义协议用户

- **流程**：继承 `User`，在 `__init__` 中注入协议客户端（如 gRPC、MQTT），并在 `Environment` 级别重用连接。
- **约定**：
  - `client`：应提供统一的 `request`/`send` 接口供统计引用。
  - `catch_response`：配合上下文管理器手动标记成功或失败，以捕获自定义协议错误。
- **官方章节**： [User customization](https://docs.locust.io/en/stable/api.html#custom-user)

### `HttpSession`

- **用途**：封装 `requests.Session` 并与 Locust 统计/事件联动，所有 `HttpUser` 请求都会经由此对象。
- **关键方法**：`get()`、`post()`、`put()`、`delete()`、`request()` 均接收同样的扩展参数。
- **扩展参数默认值**：
  - `name (str | None) = None`：覆盖统计条目。
  - `catch_response (bool = False)`：启用后可通过上下文管理器手动标记成败。
  - `context (dict) = {}`：附加到 request 事件的上下文。
- **与 requests 差异**：`url` 可为相对路径；`stream (bool = False)`、`verify (bool = True)`、`allow_redirects (bool = True)` 的默认值与 requests 保持一致。
- **官方章节**： [HttpSession](https://docs.locust.io/en/stable/api.html#httpsession-class)

### `FastHttpSession`

- **用途**：`FastHttpUser` 默认客户端，基于 `geventhttpclient`，降低 CPU 占用。
- **关键参数默认值**：
  - `insecure (bool = True)`：跳过证书校验，必要时自行提供 `ssl_context_factory`。
  - `catch_response (bool = False)`：与 `HttpSession` 一致。
  - `allow_redirects (bool = True)`：控制 3xx 行为。
- **附加方法**：`iter_lines()` 用于流式场景，`rest()` 提供 JSON 包装并默认 `catch_response=True`。
- **官方章节**： [FastHttpSession](https://docs.locust.io/en/stable/api.html#fasthttpsession-class)

### 其他内置协议用户

#### `MqttUser`

- **用途**：基于 `paho.mqtt.Client` 的 MQTT 用户，自动将 `connect/publish/subscribe` 等操作记录到 `events.request`，`name` 形如 `publish:1:topic/a`。
- **主要属性**：
  - `host (str) = "localhost"` / `port (int) = 1883`：MQTT broker 地址。
  - `transport ("tcp" | "websockets") = "tcp"`、`ws_path (str) = "/mqtt"`：启用 WebSocket 连接时调整。
  - `tls_context = None`：传入 `ssl.SSLContext` 后自动调用 `tls_set_context()`。
  - `client_cls = MqttClient`：包装 `paho.mqtt.Client` 并在回调中触发事件。
  - `client_id = None`：缺省时生成 `locust-xxxxxxxxxxxxxxxx`，也可手动设置。
  - `username = None` / `password = None`：用于 `username_pw_set()`。
  - `protocol = mqtt.MQTTv311`：可改为 `mqtt.MQTTv5` 以使用 v5 特性。
- **行为**：构造函数会调用 `connect_async(host, port)` + `loop_start()`，因此在 `on_start()` 时即可直接 `self.client.publish()`、`self.client.subscribe()`。
- **示例**：

  ```python
  import ssl
  from locust import task, constant_throughput
  from locust.contrib.mqtt import MqttUser

  class SensorUser(MqttUser):
      host = "broker.emqx.io"
      port = 8883
      transport = "websockets"
      tls_context = ssl.create_default_context()
      wait_time = constant_throughput(5)

      @task
      def publish_payload(self):
          self.client.publish("iot/sensor", payload="{}", qos=1)
  ```

#### `SocketIOUser`

- **用途**：基于 `python-socketio` 的客户端，封装 `connect/send/emit/call` 并记录 `WS*` 类型事件。
- **属性**：
  - `options (dict) = {}`：传给 `socketio.Client` 的初始化参数，如 `{"reconnection_attempts": 3, "logger": True}`。
  - `sio (SocketIOClient)`：实际客户端，已自动在后台 `gevent.spawn(self.sio.wait)`。
- **自定义**：可覆盖 `self.sio.on("event", handler)` 处理推送消息，必要时在 handler 中调用 `self.environment.events.request.fire()` 统计响应时间。
- **示例**：

  ```python
  from locust.contrib.socketio import SocketIOUser

  class ChatUser(SocketIOUser):
      options = {"reconnection_attempts": 1}

      @task
      def join_and_send(self):
          self.sio.emit("join", {"room": "qa"})
          self.sio.emit("message", "hello", name="chat.message")
  ```

#### `PostgresUser`

- **用途**：通过 `psycopg` 执行 SQL，并把执行时间写入 `postgres_success`/`postgres_failure` 事件。
- **必填属性**：`conn_string (str)`，如 `"host=127.0.0.1 port=5432 dbname=test user=locust"`。
- **client**：`PostgresClient`，暴露 `execute_query(sql: str)` 与 `close()`。
- **生命周期**：构造时创建连接，`on_stop()` 自动关闭；如果需要连接池，可在子类中覆盖 `client`。
- **示例**：

  ```python
  from locust.contrib.postgres import PostgresUser

  class ReportingUser(PostgresUser):
      conn_string = "postgresql://locust:secret@localhost:5432/analytics"

      @task
      def aggregate(self):
          self.client.execute_query("SELECT count(*) FROM events")
  ```

#### `MongoDBUser`

- **用途**：封装 `pymongo.MongoClient`，`find` 操作默认记录到 `request_type="MONGODB"`。
- **必填属性**：`conn_string (str)`、`db_name (str)`。
- **client**：`MongoDBClient`，提供 `execute_query(collection_name, query)`，并在 `on_stop()` 关闭连接。
- **扩展**：可在子类添加插入/更新方法，将 `events.request.fire()` 的 `name` 设置为业务特定值以区分操作。

#### `MilvusUser`

- **用途**：针对 Milvus 2.x 的向量数据库客户端，包装 `pymilvus.MilvusClient` 并为 `insert/search/hybrid_search/query/delete` 触发请求事件。
- **构造参数默认值**：
  - `uri (str) = "http://localhost:19530"`
  - `token (str) = "root:Milvus"`
  - `collection_name (str) = "test_collection"`
  - `db_name (str) = "default"`
  - `timeout (int) = 60`
  - `schema = None`、`index_params = None`：设置后会在初始化时自动创建集合。
- **特性**：`search(..., calculate_recall=True)` 时附带 `recall` 事件（使用 `_fire_recall_event`），便于在 Web UI 观察召回率。
- **示例操作**：

  ```python
  class VectorUser(MilvusUser):
      collection_name = "qa_vectors"

      @task
      def similarity_search(self):
          self.search(data=[[0.1, 0.2]], anns_field="embedding", limit=10)
  ```

#### `DNSUser`

- **用途**：基于 `dnspython.dns.query`，将 `udp/tcp/https` 查询封装为 Locust 请求，`request_type="DNS"`。
- **client**：`DNSClient`，动态代理 `dns.query` 中的所有方法，并在响应为空时抛出 `LocustError`。
- **示例**：

  ```python
  import dns.message, dns.rdatatype
  from locust.contrib.dns import DNSUser

  class ResolverUser(DNSUser):
      @task
      def resolve_root(self):
          msg = dns.message.make_query("example.com", dns.rdatatype.A)
          self.client.udp(msg, "1.1.1.1", name="A example.com")
  ```

- **官方章节**： [Other protocol clients](https://docs.locust.io/en/stable/api.html#other)

## 响应与上下文管理器

### `Response`

- **来源**：沿用 `requests.Response`，因此属性如 `status_code`、`json()`、`text` 等可直接使用。
- **常用属性**：`ok`、`elapsed`、`headers`、`cookies`、`content`、`url`。
- **提示**：处理 `stream=True` 时需手动读取 `iter_content()`；`raise_for_status()` 将在失败时抛 `HTTPError`。
- **官方章节**： [Response](https://docs.locust.io/en/stable/api.html#response-class)

### `ResponseContextManager`

- **用途**：`catch_response=True` 时返回此对象以手动控制请求结果。
- **方法**：
  - `success()`：将样本标记为成功。
  - `failure(exc)`：标记失败并附加异常或消息。
- **默认行为**：若未调用 `success()` 且发生异常，将自动统计为失败。
- **官方章节**： [ResponseContextManager](https://docs.locust.io/en/stable/api.html#responsecontextmanager-class)

## 任务定义与调度

### `@task`

- **用途**：将实例方法登记为任务。
- **参数**：
  - `weight (int = 1)`：调度权重，数值越大越频繁。
- **返回值**：被装饰的原方法。
- **官方章节**： [task decorator](https://docs.locust.io/en/stable/api.html#task)

### `@tag` / `--tags` / `--exclude-tags`

- **用途**：给任务或 `TaskSet` 打标签，并在运行时用 CLI 过滤。
- **装饰器**：`@tag("critical", "api")` 可一次添加多个标签。
- **命令行**：
  - `--tags critical`：仅运行包含该标签的任务。
  - `--exclude-tags slow`：排除被标记的任务。
- **官方章节**： [tagging tasks](https://docs.locust.io/en/stable/api.html#tagging)

### `TaskSet`

- **用途**：封装一组任务，支持嵌套与局部生命周期。
- **属性**：
  - `tasks (list | dict) = []`：内部任务集合，可进一步嵌套 `TaskSet`。
  - `wait_time (callable | None) = None`：为空时继承所属 `User.wait_time`。
  - `parent` (`User`)：所属用户实例。
- **方法**：
  - `on_start()`：TaskSet 被激活时执行，可设置上下文。
  - `on_stop()`：TaskSet 被中断或退出时执行，可清理状态。
  - `schedule_task(callable)`：在运行时插入额外任务。
- **官方章节**： [TaskSet](https://docs.locust.io/en/stable/api.html#taskset-class)

### `SequentialTaskSet`

- **用途**：固定顺序执行 `tasks` 列表，适合强顺序业务流程。
- **tasks (list | tuple) = []**：声明顺序执行的任务集合；若混用 `@task` 装饰器则按声明顺序运行。
- **手动调度**：可在任务中调用 `self.schedule_task(next_callable)` 插入额外步骤。
- **官方章节**： [SequentialTaskSet](https://docs.locust.io/en/stable/api.html#sequentialtaskset)

### `between` / `constant` / `constant_throughput`

- **用途**：作为 `wait_time` 工具函数控制任务间隔。
- **函数签名**：
  - `between(min_wait, max_wait)`：均匀分布，单位秒。
  - `constant(seconds)`：固定间隔。
  - `constant_pacing(seconds)`：保证「任务执行时间 + 等待时间 = seconds」，适合节拍敏感流程。
  - `constant_throughput(req_per_sec)`：目标请求速率。
- **官方章节**： [Wait time helpers](https://docs.locust.io/en/stable/api.html#wait-time)

:::tip 常见组合
`HttpUser.wait_time = between(1, 2)` 搭配 `TaskSet` 权重调度，可在单实例内模拟多种比例的业务操作。
:::

## 事件系统与监听器

### `Environment.events`

- **用途**：集中管理所有可订阅事件。
- **订阅**：使用 `environment.events.<name>.add_listener(handler)` 注册回调。
- **事件成员**：`test_start`、`test_stop`、`request`、`spawning`、`user_error`、`quitting` 等。
- **官方章节**： [Events](https://docs.locust.io/en/stable/api.html#events)

### `EventHook`

- **用途**：所有事件钩子的基础类，提供订阅与触发逻辑。
- **方法**：
  - `add_listener(fn, front=False)`：`front=True` 时在列表顶部插入。
  - `fire(**kwargs)`：以关键字参数广播事件。
  - `measure(request_type, name, response_length=0, context=None)`：辅助统计请求耗时。
- **注意**：监听函数应接收 `**kwargs` 以避免未来版本新增参数导致崩溃。
- **常用事件速览**：
  - 控制流：`init_command_line_parser`、`init`、`test_stopping`、`quit`。
  - 分布式：`worker_connect`、`worker_report`、`report_to_master`、`heartbeat_sent/received`。
  - 健康：`cpu_warning`、`usage_monitor`。
  - 统计：`reset_stats`、`spawning_complete`。

### `events.init`

- **触发时机**：<!-- term-replacer:ignore-start -->master/worker<!-- term-replacer:ignore-end --> 进程初始化。
- **handler 参数**：`environment`, `runner`, `web_ui`(可能为 `None`)。
- **用途**：注入插件、扩展 CLI、预热资源。

### `events.test_start` / `events.test_stop`

- **`events.test_start` 参数**：`environment`, `runner`。
- **`events.test_stop` 参数**：`environment`, `runner`。
- **用途**：在压测启动与结束时输出版本、触发通知、清理资源。

### `events.spawning` / `events.spawning_complete`

- **`events.spawning` 参数**：`user_class`, `user_count`。
- **`events.spawning_complete` 参数**：无。
- **用途**：标记用户孵化进度，让外部系统同步节奏。

### `events.request`

- **handler 签名**：`(request_type, name, response_time, response_length, response, context, exception)`。
- **用途**：推送自定义指标、注入链路追踪、记录失败原因。

:::warning 性能提示
`events.request` 在每个请求完成后调用，请避免在 handler 中执行阻塞操作（例如同步写数据库）。推荐将数据写入队列或异步处理。
:::

### `events.user_error`

- **用途**：捕获用户脚本未处理异常。
- **handler 参数**：`user_instance`, `exception`, `tb`。

### `events.quitting`

- **触发时机**：命令行执行完毕、Runner 即将退出。
- **用途**：统一设置退出码、执行最终清理。

## 异常类型

- `InterruptTaskSet(reschedule=True)`：在 TaskSet 内抛出以立即返回父级。`reschedule=True`（默认）时父用户会立即调度下一个任务。
- `RescheduleTask`：等价于提前 `return`，Runner 会遵守 `wait_time` 再继续。
- `RescheduleTaskImmediately`：立即调度下一个任务，不等待。
- **使用提示**：这些异常位于 `locust.exception`，可结合复杂 TaskSet 流程手动控制执行权。

## 统计、Environment 与报告

### `Environment`

- **用途**：封装运行态上下文，连接用户、统计、事件、运行器与 Web UI。
- **构造参数**：
  - `user_classes (list[User] | None) = None`：Runner 将调度的用户类列表，库模式下可运行时再赋值。
  - `event_dispatcher (EventDispatcher | None) = None`：分布式模式下自动注入。
  - `catch_exceptions (bool = True)`：控制异常是否计入失败。
  - `tags (dict[str, str] | None) = None`：附加到统计输出。
  - `shape_class (LoadTestShape | None) = None`：自定义曲线实例。
  - `stop_timeout (float | None) = None`：优雅停止的超时时间。
- **方法**：
  - `create_local_runner()`：返回 `LocalRunner`。
  - `create_master_runner(master_bind_host='*', master_bind_port=5557)`：监听全部网卡与 5557 端口。
  - `create_worker_runner(master_host, master_port)`：连接既有 master。
  - `create_web_ui(host='', port=8089, web_login=False, ...)`：构建 `WebUI` 并立即启动。
- **官方章节**： [Environment](https://docs.locust.io/en/stable/api.html#environment)

### `RequestStats`

- **用途**：维护所有请求的聚合统计，可通过 `environment.stats` 访问。
- **构造参数**：`use_response_times_cache (bool = True)` 可减少百位以上分位数计算的 CPU 消耗。
- **常用方法**：
  - `get(name, method)`：返回或创建对应的 `StatsEntry`。
  - `entries` / `total`：分别访问单条与累计统计。
  - `reset_all()`：清空历史数据（Web UI “Reset stats” 按钮触发）。
- **自定义导出**：遍历 `stats.entries` 可构建自定义报表。
- **官方章节**： [RequestStats](https://docs.locust.io/en/stable/api.html#other)

### `Runner`

- **实现**：`LocalRunner`、`MasterRunner`、`WorkerRunner`。
- **关键方法**：
  - `start(locust_count, spawn_rate)`：启动指定数量用户。
  - `stop()`：停止正在运行的测试。
  - `quit()`：触发 `events.quitting` 并结束进程。
- **属性**：`stats`、`greenlet`、`user_count`、`state`。
- **官方章节**： [Runner](https://docs.locust.io/en/stable/api.html#runner)

#### `LocalRunner`

- **用途**：单进程运行，`environment.create_local_runner()` 返回的实例。
- **常用属性**：`state`（`spawning`/`running`/`stopped`）、`target_user_count`。
- **提示**：本地模式支持 `start(user_count, spawn_rate)` 与 `stop()` 的同步调用。

#### `MasterRunner`

- **用途**：协调 `WorkerRunner`，自身不生成用户。
- **消息 API**：
  - `register_message(msg_type, listener, concurrent=False)`：注册自定义消息。
  - `send_message(msg_type, data=None, client_id=None)`：向全部或指定 worker 推送控制命令。
- **事件**：触发 `worker_connect`、`worker_report` 用于监控 worker 状态。

#### `WorkerRunner`

- **用途**：连接 Master，按指令孵化用户并回传统计。
- **方法**：
  - `register_message(...)`：处理自定义消息。
  - `send_message(msg_type, data=None, client_id=None)`：向 Master 发送反馈。
- **提示**：Worker 需监听 `report_to_master` 事件以附带自定义指标。

### `StatsEntry`

- **字段**：`name`、`method`、`num_requests`、`num_failures`、`avg_response_time`、`current_rps`、`fail_ratio`、`failures`。
- **方法**：`log_response(response_time, response_length)`、`log_error(exception)`、`failures_json()`。
- **官方章节**： [StatsEntry](https://docs.locust.io/en/stable/api.html#statsentry)

### `StatsCSVFileWriter`

- **用途**：将请求、失败、历史指标写入 CSV。
- **构造参数**：
  - `environment`：提供实时统计与事件。
  - `base_filepath`：指定输出目录前缀。
- **方法**：`spawn_stats_writer()`、`quit()`。
- **官方章节**： [CSV stats](https://docs.locust.io/en/stable/api.html#csv-report)

### 报告 API

- `environment.web_ui.app`：可添加自定义路由或面板。
- `stats_history_enabled` / `stats_history_csv_file`：开启历史记录。
- `StatsError.parse_error_log()`：解析失败日志。

:::tip 常见组合
使用 `StatsCSVFileWriter` 定期写入 CSV，再通过外部 BI 或 Grafana 导入以获取更细粒度的 SLA 曲线。
:::

## 扩展接口与插件开发

### `LoadTestShape`

- **用途**：自定义用户数量与孵化速率的时间轴，覆盖 CLI `--users` 与 `--spawn-rate`。
- **方法**：
  - `tick()`：返回 `(user_count, spawn_rate)`；返回 `None` 时结束测试。
- **辅助方法**：`get_run_time()` 可获取运行秒数，`get_current_user_count()` 查看当前用户数，`reset_time()` 重置计时。
- **常用属性**：`time_limit`、`shape_duration`、自定义控制点。
- **官方章节**： [LoadTestShape](https://docs.locust.io/en/stable/api.html#load-test-shape)

:::warning 返回值校验
`tick()` 若返回负值或非数字，Runner 会抛出异常并立即停止，请确保计算结果有效。
:::

### `WebUI`

- **创建**：`environment.create_web_ui(host='', port=8089, web_login=False, tls_cert=None, tls_key=None, delayed_start=False)`。
- **属性默认值**：
  - `app = Flask` 实例，可通过 `@web_ui.app.route` 扩展。
  - `greenlet = None` / `server = None`：只有在 `start()` 后才会被填充。
  - `auth_args`、`template_args`：用于渲染自定义登录页与模板时的默认上下文。
- **方法**：
  - `add_background_task(callable)`：注册 gevent 后台任务。
  - `stop()`：关闭 Web 服务器。
  - `auth_required_if_enabled(view_func)`：若启用 `--web-login`，为自定义路由注入认证。
- **扩展示例**：
  - `web_ui.app.add_url_rule(path, view_func=handler)`：注册自定义页面或 JSON API。
- **官方章节**： [Web UI](https://docs.locust.io/en/stable/api.html#web-ui)

### Tracking/Events 扩展

- **使用流程**：
  1. 在 `events.init` 中注册自定义事件或监听器，保证 master/worker 同步初始化。
  2. 利用 `environment.events.request.add_listener()` 拦截每次请求，向外部监控、Trace 系统或日志推送。
  3. 如需测量非 HTTP 操作，可用 `EventHook.measure()` 包裹代码块，自动计算 `response_time` 并在捕获异常时标记失败。
- **代码示例**：以下片段会为每个请求分配 `trace_id`，并通过自定义 `EventHook` 将指标推送到后台队列：

  ```python
  import uuid
  from queue import SimpleQueue
  from locust import events, EventHook

  outbound_metrics = SimpleQueue()
  request_tagged = EventHook()

  @events.init.add_listener
  def _(environment, **_):
      request_tagged.add_listener(lambda payload, **__: outbound_metrics.put(payload))

      @environment.events.request.add_listener
      def _(request_type, name, response_time, response_length, response, context, exception, **kwargs):
          trace_id = (context or {}).get("trace_id") or uuid.uuid4().hex
          request_tagged.fire(
              request_type=request_type,
              name=name,
              duration_ms=response_time,
              length=response_length,
              trace_id=trace_id,
              exception=exception,
          )
  ```

- **延伸**：可在 `request_tagged` 的 listener 中：
  - 将指标写入 Prometheus Pushgateway、OTel exporter 或 Kafka。
  - 根据 `exception` 决定是否触发报警。
  - 使用 `duration_ms` 与业务 ID 聚合 SLA。
- **调试技巧**：若需测量自定义客户端（如 gRPC、MQTT），可调用 `environment.events.request.measure("gRPC", "Predict")`，避免手动记录时间，并确保所有统计都遵循一致的事件格式。

## 运行配置与辅助 API

### `ArgumentParser` 集成

- **入口**：`Environment.parsed_options` 或 `locust.argument_parser`。
- **扩展方法**：调用 `parser.add_argument('--my-flag', type=int, help='...')` 并在 `events.init` 读取。

### env 文件与配置项

- 常见 CLI：`--headless`, `--autostart`, `--run-time`, `--users`, `--spawn-rate`, `--stop-timeout`。
- `LOCUST_PLUGINS` 环境变量可控制插件加载。

### 报告导出

- `--html report.html`：生成 HTML 报告。
- `--json report.json`：导出 JSON，包含统计与运行参数。

### 日志与调试

- `--loglevel INFO|DEBUG` 控制全局日志；`events.user_error` 可进一步集中异常。
- `environment.runner.greenlet` 暴露 gevent 运行器，可用于注入调试逻辑。

### `run_single_user`

- **用途**：在调试器中运行单个用户，保留 `init` / `test_start` 事件链路。
- **函数签名**：`run_single_user(user_class, include_length=False, include_time=False, include_context=False, include_payload=False, loglevel='WARNING')`。
- **默认值**：`loglevel='WARNING'` 避免日志噪音；`include_*` 参数默认为 `False` 以减少输出。
- **场景**：结合 IDE 断点或 `pdb` 排查长任务、复杂数据准备。

:::tip 升级检查清单
升级 Locust 前，请核对：自定义 LoadTestShape 是否依赖内部属性、Web UI 扩展是否访问私有 API、插件是否使用实验性事件。
:::

> 官方英文 API 列表： [https://docs.locust.io/en/stable/api.html](https://docs.locust.io/en/stable/api.html)

<!-- <NextReading /> -->
