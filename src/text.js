export default {
  functional: true,
  props: ['row', 'col', 'column'],
  render(
    h, {
      props: {
        row,
        col
      },
      _v: text
    }
  ) {
    const {
      formater
    } = col

    function canShowText(val) {
      if (typeof val !== 'undefined' && val !== null) return val
      return ''
    }
    // 单元格无数据时，渲染为空字符串
    const v = (formater && formater(row, col)) || canShowText(row[col.prop])
    // 解决 umd 打包 text 渲染不出来的问题，需要转成 Vnode
    return (text && text(v)) || v
  }
}
