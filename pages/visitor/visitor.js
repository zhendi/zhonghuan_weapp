const app = getApp()
let openidKeyList = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    propertyId: '',
    shareOpenid: '',
    page: 0,
    limit: 20,
    isNoMore: false,
    adviserList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openidKeyList = {}
    this.initParams(options)
    this.queryAdviser()
  },

  initParams(options) {
    this.setData({
      propertyId: options.propertyId || '',
      shareOpenid: options.openid || ''
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      path: '/pages/propertyDetail/propertyDetail?shareOpenid=' + app.globalData.openid + '&propertyId=' + this.data.propertyId
    }
  }, 

  // 查询围观信息
  queryAdviser() {
    let _this = this,
      params = {
        propertyId: this.data.propertyId,
        limit: this.data.limit,
        page: this.data.page,
        queryType: {}
      }

    if (this.data.shareOpenid) {
      params.queryType.myVisitor = true
      params.queryType.propertyVisitor = false
    } else {
      params.queryType.myVisitor = false
      params.queryType.propertyVisitor = true
    }

    if (this.data.isNoMore) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '加载中'
    })

    wx.cloud.callFunction({
      name: 'visitor',
      data: params,
      success: res => {
        wx.hideLoading()
        console.log('获取围观信息', res.result)
        let curData = params.queryType.myVisitor ? 
        (res.result.myVisitorList.data ? res.result.myVisitorList.data : []) : 
        (res.result.propertyVisitorList.data ? res.result.propertyVisitorList.data : [])

        console.log(curData)
        console.log(curData.length, _this.data.limit)
        if (curData.length < _this.data.limit) {
          _this.setData({
            isNoMore: true
          })
        } else {
          _this.setData({
            page: _this.data.page + 1
          })
        }

        curData = _this.removeRepetion(curData)

        curData = _this.formatData(curData)
        _this.setData({
          adviserList: _this.data.adviserList.concat(curData.reverse())
        })

        if (curData.length < 17) {
          _this.queryAdviser()
        }

      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '加载围观信息失败',
          icon: 'none'
        })
        console.error('[云函数] [visitor] 调用失败', err)
      }
    })
  },

  removeRepetion (data = []) {
    return data.filter(item => {
      if (!(item._openid in openidKeyList)) {
        openidKeyList[item._openid] = 1
        return true
      }
    })
  },

  formatMsgTime (timespan) {

    let dateTime = new Date(timespan),

       year = dateTime.getFullYear(),
       month = dateTime.getMonth() + 1,
       day = dateTime.getDate(),
       hour = dateTime.getHours(),
       minute = dateTime.getMinutes(),
       second = dateTime.getSeconds(),
       now = new Date(),
       now_new = now.getTime(),

       milliseconds = 0,
       timeSpanStr = '刚刚'

    milliseconds = now_new - dateTime.getTime();
    console.log(now, dateTime, now_new, dateTime.getTime(), milliseconds)

    if (milliseconds <= 1000 * 60 * 1) {
      timeSpanStr = '刚刚';
    }
    else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
      timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前';
    }
    else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前';
    }
    else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 15) {
      timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前';
    }
    else if (milliseconds > 1000 * 60 * 60 * 24 * 15 && year == now.getFullYear()) {
      timeSpanStr = month + '-' + day + ' ' + hour + ':' + minute;
    } else {
      timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    }
    return timeSpanStr;
  },

  formatData(data){
    data.forEach(item => {
      item.time = this.formatMsgTime(new Date(item.time))
    })

    return data
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 0,
      limit: 20,
      isNoMore: false,
      adviserList: []
    })
    openidKeyList = {}
    this.queryAdviser()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
    this.queryAdviser()
  }
})