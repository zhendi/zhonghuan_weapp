import api from '../../libs/api';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    infomations: [{
      "title": "first_slider",
      "image": {
        "original": "/system/information/images/000/000/001/original/WechatIMG1.jpeg?1544343774",
        "thumb": "/system/information/images/000/000/001/thumb/WechatIMG1.jpeg?1544343774",
        "medium": "/system/information/images/000/000/001/medium/WechatIMG1.jpeg?1544343774"
      },
      "link_type": "page",
      "link": "1",
      "desc": "24123123",
      "public_at": "2018/07/01 10:15:20",
      "position": 1
    }] // 资讯信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initPage();
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
    this.initPage();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  initPage() {
    api.getPagesInfoList({
      success: (data) => {
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  }
})