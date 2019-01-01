import { observer } from '../../vendor/wechat-weapp-mobx/observer';
import page from '../../libs/page';
import api from '../../libs/api';

import regeneratorRuntime from '../../utils/runtime' 
const app = getApp()

Page(observer(Object.assign({}, page, {
  props: {
  },

  /**
   * 页面的初始数据
   */
  data: {
    isShowPop: true,
    isShowAuthWin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setSharePicture()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  async setSharePicture () {
    // 判断是否登录，未登录展示授权码
    wx.showLoading({
      title: '正在生成图片',
      mask: true,
    })
    let openid = await this.queryOpenId()
    // 查询是否注册过
    let isRegister = await this.queryRegister(openid)
    // 获取用户信息，头像名字
    let { avatarUrl } = await this.getLoginUserInfo()
  
    let bgImagePath = await this.getImageUrl('cloud://test-45000c.7465-test-45000c/卓越中寰/分享图/share-picture.jpg')
    // 调用云函数，获取小程序二维码
    let codeUrl = await this.getCodeUrl()
    // let codeImageUrl = await this.getImageUrl(codeUrl)
    wx.hideLoading()
    const ctx = wx.createCanvasContext('shareCanvas')
    ctx.drawImage(bgImagePath, 0, 0, 250, 400)
    ctx.drawImage(avatarUrl, 84, 233, 38, 38)
    ctx.drawImage(codeUrl, 129, 233, 38, 38)
    ctx.draw()

    const ctxBig = wx.createCanvasContext('shareCanvasBig')
    ctxBig.drawImage(bgImagePath, 0, 0, 750, 1200)
    ctxBig.drawImage(avatarUrl, 250, 696, 114, 114)
    ctxBig.drawImage(codeUrl, 388, 696, 114, 114)
    ctxBig.draw()
    
  },

  getImageUrl (url) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: function (res) {
          //res.path是网络图片的本地地址
          resolve(res.path)
        },
        fail: function (res) {
          //失败回调
          reject(res)
        }
      })
    }) 
  },

  //点击保存到相册
  saveShareImg: function () {
    let that = this
    wx.showLoading({
      title: '正在保存',
      mask: true,
    })
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'shareCanvasBig',
        success: function (res) {
          wx.hideLoading();
          var tempFilePath = res.tempFilePath;
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success(res) {
              wx.showToast({
                title: '图片已保存',
                icon: 'none',
                duration: 2000
              })
            },
            fail: function (res) {
              wx.showToast({
                title: res.errMsg,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      });
    }, 1000);
  },

  getCodeUrl () {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'qrCode',
        data: {
          appSectet: '07f3604eaa0f90ceeb2989e0ea25cef8'
        }
      }).then(res => {

        // var imgUrl = wx.arrayBufferToBase64(res.result); //res.result 
        // imgUrl = ("data:image/png;base64," + imgUrl);
        const filePath = `${wx.env.USER_DATA_PATH}/tmp_base64src.png`;
        wx.getFileSystemManager().writeFile({
          filePath,
          data: res.result,
          encoding: 'binary',
          success() {
            resolve(filePath);
          },
          fail() {
            reject(new Error('ERROR_BASE64SRC_WRITE'));
          },
        })
      })
    })
  },

  getLoginUserInfo (params) {
    return new Promise((resolve, reject) => {
      let openid = params || app.globalData.openid
      if (!openid) {
        return
      }
      const db = wx.cloud.database(),
        users = db.collection('users')

      users.where({
        _openid: openid
      }).get({
        success: function (res) {
          console.log('getLoginUserInfo成功', res.data)
          resolve(res.data[0])
        },
        fail: function (err) {
          console.log('getLoginUserInfo失败', err)
        }
      })
    })
  },

  // 查询是否注册
  queryRegister(params) {
    return new Promise((resolve, reject) => {
      if (app.globalData.isRegister) {
        console.log('queryRegister app.globalData.isRegister 已经注册')
        resolve(true)
      } else {
        let openid = params || app.globalData.openid
        if (!openid) {
          return
        }
        const db = wx.cloud.database(),
          users = db.collection('users')

        users.where({
          _openid: openid
        }).count({
          success: function (res) {
            console.log('queryRegister查询是否 已经注册', res.total)
            resolve(res.total > 0)
          },
          fail: function (err) {
          }
        })
      }
    })
  },

  // 获取openid
  queryOpenId() {
    return new Promise((resolve, reject) => {
      if (app.globalData.openid) {
        console.log('queryOpenid 有openid', app.globalData.openid)
        resolve(app.globalData.openid)
      } else {
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            let userInfo = res.result.userInfo
            app.globalData.openid = userInfo.openId
            console.log('queryOpenid查询openid', app.globalData.openid)
            resolve(app.globalData.openid)
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
            reject()
          }
        })
      }
    })
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
  onShareAppMessage: function () {

  },

  closePopup () {
    this.setData({
      isShowPop: false
    })
  }
})));
