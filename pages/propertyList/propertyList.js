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
    shareOpenid: '', // 用户id
    isShowAuthWin: false, // 是否展示授权节点
    developerInfo: {}, // 开发商信息
    propertyList: [],
    showBottomMore: false,
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
    // 初始化数据
    this.initParams(options)
    // 获取开发商信息
    // this.getDevelopListInfo()
    // 获取楼盘信息
    this.getPropertyListInfo()
    // this.getUserListInfo()
    // 获取资讯列表信息
    this.queryInforList()
    // 查询其他信息
    this.queryOtherInfo()
      .then(res => {
        console.log('查询其他信息结束')
      })
      .catch(res => {
        console.log('查询其他信息到catch')
      })
  },

  // 查询其他信息
  async queryOtherInfo() {
    let openid = await this.queryOpenId()
    // 查询是否注册过
    let isRegister = await this.queryRegister(openid)
    // 未注册则进行注册
    !isRegister && this.setData({
      isShowAuthWin: true
    })
  },

  // 进行注册
  addRegister (userInfo) {
    return new Promise((resolve, reject) => {
      if (!userInfo) {
        reject('获取用户信息失败')
      }
      const db = wx.cloud.database()

      db.collection('users').add({
        data: userInfo,
        success: function (res) {
          app.globalData.isRegister = true
          console.log('addRegister注册成功')
          resolve(true)
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
  },

  // 获取是否授权
  getAuth() {
    return new Promise((resolve, reject) => {
      let _this = this
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            console.log('getAuth', res, res.userInfo)
            resolve({
              isAuth: true,
              userInfo: res.userInfo
            })
          } else {
            resolve({
              isAuth: false,
              userInfo: {}
            })
          }
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

  initParams (options) {
    // 获取分享的openid
    this.setData({
      shareOpenid: options.shareOpenid || ''
    })
    console.log('分享者id', this.data.shareOpenid)
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
    // 获取开发商信息
    // this.getDevelopListInfo()
    // 获取楼盘信息
    this.getPropertyListInfo()
    this.getUserListInfo()
    // 查询其他信息
    this.queryOtherInfo()
      .then(res => {
        wx.stopPullDownRefresh()
        console.log('查询其他信息结束')
      })
      .catch(res => {
        wx.stopPullDownRefresh()
        console.log('查询其他信息到catch')
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  // 授权
  onGetUserInfo: function (e) {
    let userInfo = e.detail.userInfo
    console.log('onGetUserInfo', userInfo)
    this.setData({
      isShowAuthWin: false
    })
    if (userInfo) {
      // 进行注册
      this.addRegister(userInfo)
    }
  },

  afterLogin (data) {
  },

  // 注册,登录
  login (data) {
    let userInfo = data.userInfo,
        callBack = typeof data.callBack == 'function'?  data.callBack : function () {}
    // 调用云函数
    var registerOrLogin = function (openid) {
      if (!openid) {
        return
      }
      const db = wx.cloud.database(),
            users = db.collection('users')

      users.where({
        _openid: openid
      }).get().then(res => {
        if (res.data.length == 0) {
          if (!userInfo) {
            return
          }
          users.add({
            data: userInfo
          })
          .then(res => {
            // 注册成功
            callBack({
              retcode: 0,
              ret_msg: 'suc',
              result_rows: res.data
            })
          })
          .catch(err => {
            // 注册失败
            callBack({
              retcode: -1,
              ret_msg: err
            })
          })
        } else {
          // 已经注册过
          callBack({
            retcode: 0,
            ret_msg: 'suc',
            result_rows: res.data
          })
        }
      })
      .catch(err => {
        callBack({
          retcode: -1,
          ret_msg: err
        })
      })
    }

    if (!app.globalData.openid){
      wx.cloud.callFunction({
        name: 'login',
        data: data,
        success: res => {
          let userInfo = res.result.userInfo
          app.globalData.openid = userInfo.openId
          registerOrLogin(app.globalData.openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    } else {
      registerOrLogin(app.globalData.openid)
    }
  },

  // 获取楼盘信息
  getPropertyListInfo () {
    let _this = this
    wx.showLoading({
      title: '加载中'
    })

    api.getPropertyList({
      success: (data) => {
        _this.setData({
          showBottomMore: true
        })
        wx.hideLoading()
        _this.setData({
          propertyList: data.buildings
        })
      },
      fail: (err) => {
        _this.setData({
          showBottomMore: true
        })
        wx.hideLoading()
        wx.showToast({
          title: '加载楼盘信息失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  },

  // 获取开发商信息
  getDevelopListInfo() {
    let _this = this
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'developer',
      data: {},
      success: res => {
        wx.hideLoading()
        console.log('获取开发商信息', res.result.data[0])
        if (res.result.data.length) {
          _this.setData({
            developerInfo: res.result.data[0]
          })
        } else {
          wx.showToast({
            title: '未获取到开发商信息',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '加载开发商信息失败',
          icon: 'none'
        })
        console.error('[云函数] [developers] 调用失败', err)
      }
    })
  },

  // 获取开发商信息
  getUserListInfo() {
    let _this = this
    wx.cloud.init()
    const db = wx.cloud.database()

    db.collection('users').where({
    }).get({
      success: function (res) {
        console.log('用户信息', res.data)
      }
    })
  },

  // 用户点击右上角分享
  onShareAppMessage() {
    return {
      path: '/pages/propertyList/propertyList?shareOpenid=' + app.globalData.openid
    }
  }, 

  // 跳转到详情页面
  navigateToDetail (e) {
    let propertyId = e.currentTarget.dataset.propertyId,
        url = '/pages/propertyDetail/propertyDetail?shareOpenid=' + this.data.shareOpenid + '&propertyId=' + propertyId;
    wx.navigateTo({
      url: url
    })
  },

  // 前往顾问页面
  navigateToAdviser (e) {
    let adviserId = e.currentTarget.dataset.adviserId,
        propertyId = e.currentTarget.dataset.propertyId,
      url = '../adviser/adviser?adviserId=' + adviserId + '&propertyId=' + propertyId + '&shareOpenid=' + this.data.shareOpenid
    console.log(url);

    this.data.propertyList.forEach(item => {
      if (item._id == propertyId) {
        app.globalData.adviserListInfo = item.adviser
      }
    })

    wx.navigateTo({
      url: url
    })
  },

  // 查询资讯列表
  queryInforList () {

  },

  // 跳转资讯详情页面
  clickInfoItem (e) {
    let linkType = e.currentTarget.dataset.linkType,
        link = e.currentTarget.dataset.link
    
    if (linkType == 'article') {
    // 跳转微信公众号文章
      wx.navigateTo({
        url: '/pages/webview/webview?webviewUrl=' + link
      })
    } else {
    // 自定义页面
      wx.navigateTo({
        url: '/pages/pages/pages?pageId=' + link
      })
    }
  },

  clickSwiperPics () {
    console.log('in')
  },

  // 展示资讯列表
  showMoreInfo () {
    wx.navigateTo({
      url: '../infoList/infoList'
    })
  },

  // 关闭授权弹窗
  closeAuth() {
    this.setData({
      isShowAuthWin: false
    })
  },

  initPage() {
    api.getPagesPropertyList({
      success: (data) => {
        this.props.propertyListStore.set(data['result_rows']);
        this.props.propertyListStore.updateUI({ pageInited: true });
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  }
})));
