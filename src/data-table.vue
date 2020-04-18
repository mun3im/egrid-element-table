<template>
  <data-tables-server
    ref="grid"
    :layout="layout"
    :pagination-props="{ background: true, layout:'prev, pager, next, jumper, sizes, total', pageSizes: [10, 20, 30], hideOnSinglePage: page_size === 10 }"
    :total="total"
    :page-size.sync="page_size"
    :current-page.sync="page_num"
    class="egrid"
    :table-props="tableBind"
    :data="data"
    v-bind="tableBind"
    @query-change="loadData"
    v-on="$listeners"
  >
    <slot slot="tool" />
    <template v-for="tp in typesColumns">
      <el-table-column v-if="tp.type === 'expand'" :key="tp.type" v-bind="tp.props" type="expand">
        <template slot-scope="props">
          <slot name="expand" v-bind="props" />
        </template>
      </el-table-column>
      <el-table-column
        v-else
        :key="tp.type"
        :type="tp.type"
        :reserve-selection="reserveSelection && tp.type === 'selection'"
        v-bind="tp.props"
      />
    </template>
    <el-table-column v-for="col in renderColumns" :key="col.label" v-bind="getColBind(col)">
      <template slot-scope="scope">
        <component :is="col.component" v-bind="getCptBind(scope, col)" v-on="col.listeners" />
      </template>
    </el-table-column>
    <template v-if="slotAppend" slot="append">
      <slot name="append" />
    </template>
  </data-tables-server>
</template>

<script>
import { DataTablesServer } from 'vue-data-tables'
import methods from './methods'
import Text from './text'

const BOOLEAN_KEYS = [
  'fit',
  'stripe',
  'border',
  'show-header',
  'highlight-current-row',
  'default-expand-all',
  'show-summary',
]

const COLUMN_PROPS = {
  align: 'left',
  component: Text,
}

const TYPES = ['selection', 'expand', 'index']

const COLUMN_KEY_MAP = {
  label: 'label',
  prop: 'prop',
}

export default {
  name: 'Egrid',

  components: {
    DataTablesServer,
  },

  mixins: [methods],

  props: {
    data: {
      type: Array,
      default() {
        return []
      },
    },

    columns: {
      type: Array,
      default() {
        return []
      },
    },

    columnType: [String, Array],

    columnTypeProps: Object,

    columnKeyMap: Object,

    columnsProps: Object,

    columnsSchema: Object,

    columnsHandler: Function,

    slotAppend: Boolean,

    reserveSelection: Boolean,

    total: Number,
  },

  data() {
    return {
      page_size: 10,
      page_num: 1,
      loading: false,
    }
  },

  computed: {
    // 不传递 total 属性，则不显示分页
    layout() {
      if (isNaN(this.total)) return 'tool, table'
      return 'tool, table, pagination'
    },

    // 处理 $attrs 里面 Boolean 类型的 prop 和统一 prop 命名
    tableBind() {
      const { $attrs } = this
      const bind = {}
      Object.keys($attrs).forEach(key => {
        const v = $attrs[key]
        const uniformKey = key.replace(/([A-Z])/, '-$1').toLowerCase()
        bind[key] = ~BOOLEAN_KEYS.indexOf(uniformKey) && v === '' ? true : v
      })
      return bind
    },

    renderColumns() {
      const {
        columns,
        columnKeyMap,
        columnsHandler,
        columnsProps: props,
        columnsSchema: schema,
      } = this
      const map = Object.assign({}, COLUMN_KEY_MAP, columnKeyMap)
      const renderColumns = columns.map(col => {
        const mix = (schema && schema[col[map.label]]) || {}
        const it = Object.assign({}, COLUMN_PROPS, props, col, mix)
        it.label = it[map.label]
        it.prop = it[map.prop]
        return it
      })
      return (columnsHandler && columnsHandler(renderColumns)) || renderColumns
    },

    // 用于渲染特殊列
    typesColumns() {
      const { columnType: type, columnTypeProps } = this
      let typeColums = []
      if (typeof type === 'string' && ~TYPES.indexOf(type)) {
        typeColums = [type]
      }
      if (Array.isArray(type)) {
        typeColums = type.filter(it => ~TYPES.indexOf(it))
      }
      const map = columnTypeProps || {}
      return typeColums.map(type => {
        return {
          type,
          props: map[type],
        }
      })
    },
  },

  methods: {
    initPageData() {
      this.page_size = 10
      this.page_num = 1
    },

    loadData({ type, page, pageSize }) {
      if (type === 'page' || type === 'size') {
        this.$emit('queryChange', { size: pageSize, page })
      }
    },

    getColBind(col) {
      const bind = Object.assign({}, col)
      delete bind.component
      delete bind.listeners
      delete bind.propsHandler
      return bind
    },

    getCptBind({ row, column, $index }, col) {
      // 原仓库未传递 $index
      const index = $index
      const props = { row, col, column, index }
      const handler = col.propsHandler
      return (handler && handler(props)) || props
    },
  },
}
</script>
