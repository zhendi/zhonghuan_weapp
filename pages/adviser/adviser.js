const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adviserList: app.globalData.adviserListInfo || [],
    propertyId: '',
    selectedAdviserId: '',
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let current = 0
    this.setData({
      selectedAdviserId: options.adviserId || '',
      propertyId: options.propertyId || '',
      shareOpenid: options.shareOpenid || '',
      adviserList: app.globalData.adviserListInfo || []
    })
    if (this.data.selectedAdviserId) {  
      this.data.adviserList.forEach((item, index) => {
        if ((item.name + '_' + item.phone) == this.data.selectedAdviserId) {
          current = index
        }
      })
    }
    this.setData({
      current: current
    })
   
    console.log('selectedAdviserId, propertyId, adviserList', this.data.selectedAdviserId, this.data.propertyId, this.data.adviserList)
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      path: '/pages/propertyDetail/propertyDetail?shareOpenid=' + app.globalData.openid + '&propertyId=' + this.data.propertyId
    }
  }, 

  goToPropertyDetail (e) {
    let phone = e.currentTarget.dataset.phone,
        name = e.currentTarget.dataset.name,
        adviserId = name + '_' + phone,
      url = '../propertyDetail/propertyDetail?adviserId=' + adviserId + '&propertyId=' + this.data.propertyId

    wx.navigateTo({
      url: url
    })
  },

  callPhone(e) {
    let phone = e.currentTarget.dataset.phone
    console.log(e.currentTarget.dataset)
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
})