# 操作步骤
1、安装依赖，启动镜像

`npm install` && `docker-compose up` 



2、初始化mongodb

`npm run mongo-init` 

3、初始化mysql

访问`http://localhost:9090/`
username： liuzt
password： 123qwe

在todos里新增表结构
字段名设置为：num(int)、name(text)、date(text)、ext(int)

3、启动服务

`npm start` 


4、按照`router/index.js`中的路径测试返回值
```
http://localhost:3000/todo/query    (不知道为什么find({})查询不到数据)
http://localhost:3000/todo/add

http://localhost:3000/redis/set?name=liuzt
http://localhost:3000/redis/get/name

http://localhost:3000/mysql/insert
http://localhost:3000/mysql/query

```