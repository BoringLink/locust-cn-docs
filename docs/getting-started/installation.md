---
title: Locust安装教程 | Python性能测试工具
description: 学习如何在你的系统上安装 Locust 性能测试框架
sidebar_position: 1
lastUpdated: 2025-11-27
---

# 安装 Locust

Locust 可以通过 pip 轻松安装。本指南将帮助你在不同的操作系统上安装 Locust。

## 系统要求

- Python 3.8 或更高版本
- pip（Python 包管理器）

## 使用 pip 安装

最简单的安装方式是使用 pip：

```bash
$ pip install locust
```

## 验证安装

安装完成后，你可以通过以下命令验证 Locust 是否正确安装：

```bash
$ locust --version
```

你应该看到类似以下的输出：

```text
locust 2.x.x
```

## 可选依赖

### ZeroMQ（用于分布式测试）

如果你计划运行分布式负载测试，需要安装 ZeroMQ：

```bash
$ pip install pyzmq
```

### 其他有用的包

```bash
# 用于更好的性能监控
$ pip install psutil

# 用于生成测试报告
$ pip install locust-plugins
```

## 从源码安装

如果你想使用最新的开发版本，可以从 GitHub 安装：

```bash
$ pip install git+https://github.com/locustio/locust.git
```

## Docker 安装

Locust 也提供官方 Docker 镜像：

```bash
$ docker pull locustio/locust
```

运行 Locust：

```bash
$ docker run -p 8089:8089 -v $PWD:/mnt/locust locustio/locust -f /mnt/locust/locustfile.py
```

## 下一步

安装完成后，你可以：

- [创建你的第一个测试](/getting-started/first-test)
- [了解 Locust 的基础概念](/writing-locustfile/basics)

## 常见问题

### 安装失败怎么办？

如果遇到安装问题，请确保：

1. Python 版本符合要求（3.8+）
2. pip 已更新到最新版本：`pip install --upgrade pip`
3. 如果在 Windows 上，可能需要安装 Visual C++ 构建工具

### 如何升级 Locust？

```bash
$ pip install --upgrade locust
```

<!-- <NextReading /> -->
