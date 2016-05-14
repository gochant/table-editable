# table-editable

一个表格就地编辑 jquery 插件，主要基于 [x-editable](https://github.com/vitalets/x-editable) 的 bootstrap 版本

## 特点

* 配置简单
* 提供类似于 Excel 的操作模式，支持快捷键（方向键、tab、enter）
* 支持复杂的表格模板

## 依赖

* jQuery (>=1.11.x)
* Bootstrap (=3.x)
* x-editable (=1.5.x)

## 开始使用

### 1. 引入 JS/CSS

```html
<link href="assets/css/bootstrap.css" rel="stylesheet"/>
<link href="assets/css/bootstrap-editable.css" rel="stylesheet"/>
<link href="src/table-editable.css" rel="stylesheet"/>

<script src="assets/js/jquery.min.js"></script>
<script src="assets/js/bootstrap-editable.min.js"></script>
<script src="src/table-editable.js"></script>
```

### 2. 放置目标元素

```html
<div id="content"></div>
```

### 3. 调用

```js
$('#content').tableEditable();

// 获取实例对象
var instance = $('#content').data('tableEditable');
```

## API

### options


#### fetch `function`

一个返回 `Deferred` 对象的方法，插件调用该方法获取表格模板所需的数据，默认值：

```js
function () {
    var deferred = $.Deferred();
    deferred.resolve();
    return deferred.promise();
}
```

#### fetchData `function`

用于处理获取后的数据，默认不作处理：

```js
function (resp) {
    return resp;
}
```


#### template `function`

表格内容的模板，前端模板编辑后的模板函数，如果不是从远端获取，则不提供，当 `fetch` 方法不返回数据时，则不起作用，默认值：

```js
function () {
    return '';
}
```

#### editableOptions

x-editable 的配置参数，详见 [x-editable 文档](http://vitalets.github.io/x-editable/docs.html)

### Events

#### 'rendered.tableEditable'

表格进行模板渲染后调用，使用：

```js
$('#content').on('rendered.tableEditable', function () {
    relayout();
})
```

### Methods

#### render

重新获取数据并渲染表格，该方法可传入任意参数，将会传入到 `fetch` 配置方法中