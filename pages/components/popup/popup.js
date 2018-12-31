Component({
  properties: {
    title: {
      type: String,
      value: '', 
    },
    needTitle: { // 组件另外一种title样式
      type: Boolean,
      value: false
    },
    isShowPop: { // 是否显示组件
      type: Boolean,
      value: false
    }
  },
  data: {
  },
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  methods: {
    /**
     * 取消事件（调用父组件方法）
     */
    closePopup() {
      this.triggerEvent('closePopup')
    }
  }
})
