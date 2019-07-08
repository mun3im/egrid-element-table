# Egrid
> 原项目[Egrid](https://github.com/kinglisky/egrid) 因为作者不维护了，故 fork 后自己维护，添加新功能

对 element-ui table 组件的封装，复用 el-table-column，少写样板代码

### [文档](https://zaxlct.github.io/egrid-element-table/#/)

### fork 后新增的功能
1. `propsHandler` 新增 `index`属性（$index），即 `{ row, col, column, index }`
2. 支持 reserve-selection
3. 补充文档

### 开发

> `npm run dev`

> `npm run build`

> `npm run doc`


### 使用

安装 Element：

> `npm i element-ui -S`

安装 egrid:

> `npm i egrid-element-table -S`

`egrid` 只依赖 `Element` 中的 `Table` 与 `TableColumn` 组件不会将整个 `Element` 导入。
但不包含样式，`Table` 的样式需要用户手动引入。

使用：
```javascript
import Vue from 'vue'
import Egrid from 'egrid-element-table'

// table 的样式需要手动引入
import 'element-ui/lib/theme-default/icon.css'
import 'element-ui/lib/theme-default/table.css'
import 'element-ui/lib/theme-default/table-column.css'

Vue.use(Egrid)
```

## 为什么使用 Egrid
### 原来的写法
```html
<template>
  <el-table
    :data="tableData"
    border
    style="width: 100%">
    <el-table-column
      label="日期"
      width="180"
      prop="time">
    </el-table-column>
    <el-table-column
      label="姓名"
      width="180"
      props="name"
    >
    </el-table-column>
    <el-table-column label="操作">
      <template scope="scope">
        <el-button
          size="small"
          @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 用了 Egrid 的写法
```javascript
<egrid :columns="columns" :columnsHandler="columnsHandler"></egrid>

const columns = [
  {
    label: '日期',
    prop: 'date',
    width: 100
    ...
  },
  {
    label: '姓名',
    prop: 'name',
    minWidth: 100
    ...
  },
  ......
]

columnsHandler (cols) {
  return cols.concat({
    label: '操作',
    align: 'left',
    sortable: false,
    component: Vue.extend({
      props: ['row', 'index'],
      render(h) {
        return (
          <el-button
            size="small"
            @click="this.$emit('handleEdit', this.index, this.row)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="this.$emit('handleDelete', this.index, this.row)">删除</el-button>
        )
      },
    }),
    listeners: {
      handleEdit (index, row) {
      },
      handleDelete (index, row) {
      }
    }
  })
}
```

## Egrid 优势
### 1. 不用写 `el-table-column` 和 `template scope="scope` 等样板代码
```javascript
<egrid :columns="columns"></egrid>

// 定义 columns
const columns = [
  {
    label: '日期',
    prop: 'date',
    width: 100
    ...
  },
  {
    label: '姓名',
    prop: 'name',
    minWidth: 100
    ...
  },
  ......
]
```

### 2. columns-schema 和 columns-handler	可对 columns 进行增删改操作

```javascript
<egrid :columns="columns" :columnsHandler="columnsHandler"></egrid>

// columns-schema
// 通过 props 传递 Object 对 columns 进行增删改操作
{
  label: '其他',
  component: Btn, // 'el-button'
  listeners: {
    'custom-event' (data) {
      console.log('custom-event', data)
    }
  },
  propsHandler: function ({ row, col, column }) {
    return { row, col, column }
  }
  ......
}

// columns-handler
// 通过 props 传递 Function 对 columns 进行增删改操作
columnsHandler (cols) {
  return cols.concat({
    label: '操作',
    align: 'left',
    sortable: false,
    ...
    component: OperatComponent,
  })
}
```
### 3. 表格继承
少写样板代码似乎带来的兴奋不是那么大，但是通过传递对象和函数对 columns 进行增删改操作，就有很大的操作空间了，比如可以实现「表格的继承」

我可以定义一个基础的表格组件：
```javascript
// base-table component
<egrid :columns="columns" :columnsHandler="columnsHandler"></egrid>

props: [columnsHandler]

const columns = [
  {
    label: '日期',
    prop: 'date',
    width: 100
    ...
  },
  {
    label: '姓名',
    prop: 'name',
    minWidth: 100
    ...
  },
  {
    label: '图片',
    component: Btn, // 'el-button'
    listeners: {
      'custom-event' (data) {
        console.log('custom-event', data)
      }
    },
    propsHandler: function ({ row, col, column }) {
      return { row, col, column }
    }
    ......
  }
  ......
]
```

再定义一个高级的表格组件：
```javascript
<base-table :columnsHandler="columnsHandler"></base-table>

columnsHandler(cols) {
  return cols.concat({
    label: '删除',
    align: 'left',
    sortable: false,
    ...
    component: OperatComponent,
  },{
    label: '增加',
    align: 'left',
    sortable: false,
    ...
    component: OperatComponent,
  }),
  ...
}
```

继承 base-table 组件后，可任意传递 columns，定制高级 table

### 4. 高级用法
还可以继承基础组件后，传递任意事件
```javascript
<base-table :columnsHandler="columnsHandler" @selection-change="xxx" row-key="xxx"></base-table>

columnsHandler (cols) {
  return cols.concat({
    label: '操作',
    align: 'center',
    component: Vue.extend({
      props: ['row'],
      render(h) {
        return (<ElButton type="text" onClick={_ => this.$emit('createProduct', this.row.id)}>新建产品</ElButton>)
      },
    }),
    listeners: {
      'createProduct' (id) {
        // 所有操作都放到父组件里实现，base-table 不受任何影响
        console.log('新建产品id')
      },
    }
  })
}
```

## 总结
为什么要在 element table 组价之上再封装一层呢？

如果每次使用表格都要重复这一段代码，那久而久之你的项目肯定会冗余很多重复的代码，而且也不利于维护。
这时候我们就有必要在原始的表格组件基础上再封装一层，将这些重复的代码放在组件内部，使用时考虑如何通过一种配置的方式去定制表格。

`egrid` 就是为此而生的，少写两行是两行。耶~~~
