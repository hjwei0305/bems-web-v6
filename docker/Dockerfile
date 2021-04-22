# Docker for bems-web-v6

# 基础镜像
FROM nginx:stable-alpine

# 作者
LABEL maintainer="hua.feng@changhong.com"

# 环境变量
## TZ：时区设置
## APP_NAME：应用名称（各项目需要修改）
ENV TZ='Asia/Shanghai' APP_NAME="bems-web-v6"

# 添加应用
COPY dist /usr/share/nginx/html/$APP_NAME
