const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupIndex: 0, // 图片第几组
    selectedPicture: 0, //某组图片中第几张
    pictures: [],
    current: 0,
    propertyId: '',
    mergePictures: [],
    molecular: 0, // 图片分子
    denominator: 0, // 图片分母
    curBottomIndex: 0 // 当前底部导航的index
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pictures: app.globalData.propertyPictures || [
        {
          name: '实景图',
          pictures: ['../../images/picture3.png', '../../images/picture3.png', '../../images/picture3.png']
        },
        {
          name: '效果图',
          pictures: ['../../images/picture4.png', '../../images/picture4.png', '../../images/picture4.png']
        },
        {
          name: '规划图',
          pictures: ['../../images/picture5.png', '../../images/picture5.png', '../../images/picture5.png']
        }
      ],
      groupIndex: options.groupIndex || 0,
      selectedPicture: options.selectedPicture || 0,
      propertyId: options.propertyId || ''
    })
    let mergePictures = []
    this.data.pictures.forEach((item, index) => {
      mergePictures.push(...item.pictures)
    })
    this.setData({
      mergePictures: mergePictures 
    })
    let current = this.handleImageIndex(this.data.groupIndex, this.data.selectedPicture)
    this.setData({
      current: current
    })
    this.setImage(current)
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
 * 预览图片
 */
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.mergePictures // 需要预览的图片http链接列表
    })
  },

  clickBottomNav (e) {
    let groupIndex = e.currentTarget.dataset.groupIndex,
        curIndex = this.handleImageIndex(groupIndex)
    this.setData({
      current: curIndex
    })
    this.setImage(curIndex)
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage() {
    return {
      path: '/pages/propertyDetail/propertyDetail?shareOpenid=' + app.globalData.openid + '&propertyId=' + this.data.propertyId
    }
  }, 

  // 转换出图片index
  handleImageIndex (groupIndex = 0, imageIndex = 0) {
    let num = 0

    this.data.pictures.forEach((item, index) => {
      if (index < groupIndex) {
        num += item.pictures.length
      }
    })
    return num + parseInt(imageIndex, 10)
  },

  setImage (current) {
    let num = 0

    this.data.pictures.forEach((item, index) => {
      let curPicLength = item.pictures.length
      if (current >= num && current <= (curPicLength + num)) {
        this.setData({
          molecular: current - num + 1,
          denominator: curPicLength,
          curBottomIndex: index
        })
      }
      num += item.pictures.length
    })
  },

  changeImage (e) {
    let current = e.detail.current,
        num = 0
    this.data.pictures.forEach((item, index) => {
      let curPicLength = item.pictures.length
      if (current >= num && current <= (curPicLength + num)) {
        this.setData({
          molecular: current - num + 1,
          denominator: curPicLength,
          curBottomIndex: index
        })
      }
      num += item.pictures.length
    })
  }
})