## Mini-Route

----

支持浏览器和nodejs服务端(开发中)的路由组件



### 客户端(browser/src/index.js)

```html
<script src="path/to/mini-route.js"></script>
```

```javascript
window.onload = function() {
  var router = MiniRoute(document.querySelector("#view"));
	router.config({
		pushState: true,
		routes: [
			{
				name: "test111",
				url: "/test111",
				templateUrl: "/views/111.html",
				handler: function() {
					console.log("I'm test111's handler");
				}
			},
			{
				name: "test222",
				url: "/test222",
				templateUrl: "/views/222.html",
				handler: function() {
					console.log("I'm test222's handler");
					doc.querySelector(".jump").addEventListener("click", function(e) {
						router.go("test222333", {
							name: "fuck",
							id: "test"
						});
					});
				}
			},
			{
				name: "test222333",
				url: "/test222/:id/:name",
				templateUrl: "/views/222333.html",
				handler: function(params) {
					console.log(params); //	{ id: "xxx", name: "yyy" }
					console.log("I'm test2223333's handler");
				}
			}
		]
	});

	router.on("route:change:start", function() {
		console.log("%c router change start callback", "color: yellow");
	});

	router.on("route:change:success", function() {
		console.log("%c router change success callback", "color: green");
	});

	router.on("route:change:completed", function() {
		console.log("%c router change completed callback", "color: blue");
	});

	router.on("route:change:failed", function(e) {
		console.log("%c router change failed callback", "color: red");
		console.log(e);
	});

	router.start();
}
```

#### API

| 方法名    | 意义                | 参数类型                | 是否必须 |
| ------ | ----------------- | ------------------- | ---- |
| config | 路由相关配置            | Object(详见注释1)       | 是    |
| on     | 订阅路由切换时相关声明周期     | String [, Function] | 是    |
| start  | 启动路由              | 空                   | 否    |
| go     | 跳转到某个路由, 可以加上具体参数 | name [, Object]     | 是    |

#### 注释1(config方法相关参数)

| 参数名       | 意义                              | 取值类型                   | 默认值   |
| --------- | ------------------------------- | ---------------------- | ----- |
| pushState | 是否启用HTML5的pushState, false为hash | Boolean                | false |
| routes    | 路由配置项                           | Array.<Object>/ Object | null  |

-   routes为数组类型时，必须保证为如下结构

```javascript
[
  {
  	name: String, Required,
  	url: String, Required,
  	templateUrl: String, Required,
  	handler: Function, Optional
  }
]
```

当url配置为带参数的rest风格时，handler的第一个参数即为当前页面路由的参数和值的键值对

-   router为对象类型时，必须保证为如下结构 

```javascript
{
  name: {
    url: String, Required,
    templateUrl: String, Required,
    handler: Function, Optional
  }
}
```

当url配置为带参数的rest风格时，handler的第一个参数即为当前页面路由的参数和值的键值对