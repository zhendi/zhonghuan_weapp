import regeneratorRuntime from '../../utils/runtime' 
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowMore: true,
    isShowAuthWin: false,
    shareOpenid: '',
    propertyId: '', // 楼盘信息
    propertyVisitorCount: 0, // 楼盘围观人数
    myVisitorCount: 0, // 我的围观数量
    propertyAdviserList: [],
    myAdviserList: [],
    adviserLimit: 6, // 查询围观人数限制
    propertyInfo: {},
    adviserId: '',
    adviserInfo: {}, // 顾问信息
    isShowPop: false,
    sharePicture: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.init()
    // 初始化数据
    this.initParams(options)
    // 查询楼盘信息
    this.queryPropertyInfo()
  },

  // 查询其他信息
  async queryOtherInfo () {
    let openid = await this.queryOpenId()
    // 查询是否注册过
    let isRegister = await this.queryRegister(openid)
    // 已经注册
    if (isRegister) {
      // 上传我的围观
      this.uploadVisitor()
    } else {
      this.setData({
        isShowAuthWin: true
      })
    }
  },

  initParams(options) {
    // 获取分享的openid
    this.setData({
      shareOpenid: options.shareOpenid || '',
      propertyId: options.propertyId || '',
      adviserId: options.adviserId || ''
    })
    if (options.scene) {
      let scene = decodeURIComponent(options.scene)
      this.setData({
        shareOpenid: options.scene || ''
      })
      console.log('scene', options.scene)
    }
    console.log('分享者id,楼盘id，顾问id', this.data.shareOpenid, this.data.propertyId, this.data.adviserId)
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
          console.log('注册成功')
          resolve(true)
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
  },

  // 查询是否注册
  queryRegister(params) {
    return new Promise ((resolve, reject) => {
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
  queryOpenId () {
    return new Promise ((resolve, reject) => {
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

  // 查询楼盘信息
  queryPropertyInfo () {
    let _this = this
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'property',
      data: { '_id': _this.data.propertyId},
      success: res => {
        wx.hideLoading()
        console.log('获取楼盘信息', res.result)
        _this.setData({
          propertyInfo: res.result.data[0],
          propertyId: res.result.data[0]['_id'],
          sharePicture: res.result.data[0]['sharePicture']
        })
        // 查询围观信息
        _this.queryAdviser()
        // 设置顾问信息
        _this.setAdviserInfo()
        // 查询其他信息
        _this.queryOtherInfo()
          .then(res => {
            console.log('查询其他信息结束')
          })
          .catch(res => {
            console.log('查询其他信息到catch')
          })
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '加载楼盘信息失败',
          icon: 'none'
        })
        console.error('[云函数] [developers] 调用失败', err)
      }
    })
  },

  // 查询围观信息
  queryAdviser () {
    let _this = this,
        params = {
          propertyId: this.data.propertyId,
          limit: 12,
          page: 0,
          queryType: {
            propertyVisitor: true,
            myVisitor: true
          }
        }

    wx.showLoading({
      title: '加载中'
    })
    console.log()

    wx.cloud.callFunction({
      name: 'visitor',
      data: params,
      success: res => {
        wx.hideLoading()
        console.log('获取围观信息', res.result)
        let result = res.result
        console.log(result)
        _this.setData({
          propertyVisitorCount: result.propertyVisitorCount || 0,
          myVisitorCount: result.myVisitorCount || 0,
          propertyAdviserList: _this.removeRepetion(result.propertyVisitorList.data ? result.propertyVisitorList.data : []),
          myAdviserList: _this.removeRepetion(result.myVisitorList.data ? result.myVisitorList.data : [])
        })
        console.log(this.data.propertyAdviserList)
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

  // 设置顾问信息
  setAdviserInfo () {
    let adviserInfo = {},
      adviserList = this.data.propertyInfo.adviser || []
    if (this.data.adviserId) {
      adviserList.forEach(item => {
        if((item.name + '_' + item.phone) == this.data.adviserId){
          adviserInfo = item
        }
      })
    } else {
      let length = adviserList.length,
        random = Math.floor((Math.random() * length))
      adviserInfo = this.data.propertyInfo.adviser[random]
    }

    console.log('展示顾问', adviserInfo)

    this.setData({
      adviserInfo: adviserInfo
    })
  },

  // 查询我的围观信息
  queryMyAdviser(openid) {
    let _this = this
    const db = wx.cloud.database(),
      collection = db.collection('visitors')
    // 查询楼盘围观数量
    collection.where({
      propertyId: this.data.propertyId,
      shareOpenid: openid
    }).count({
      success: function (res) {
        console.log('查询我的围观数量', res.total)
        _this.setData({
          myVisitorCount: res.total
        })
      },
      fail: function (err) {
      }
    })

    collection.where({
      propertyId: this.data.propertyId,
      shareOpenid: openid
    }).limit(this.data.adviserLimit).get({
      success: function (res) {
        let adviserList = res.data.map(item => {
          return item._openid
        })
        _this.queryAdviserInfo(adviserList, 'myAdviserList')
      },
      fail: function (err) {

      }
    })
  },

  // 查询围观者对应的头像、名称
  queryAdviserInfo (adviserList, dataName) {
    console.log('进入查询围观queryAdviserInfo', adviserList, dataName)
    let _this = this

    if (!adviserList.length) {
      return
    }
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('users').where({
      _openid: _.in(adviserList)
    })
      .get({
        success: function (res) {
          console.log('queryAdviserInfo成功', dataName, res.data)
          _this.setData({
            dataName: res.data
          })
        },
        fail: function (err) {
          console.log('queryAdviserInfo失败', dataName)
        }
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
            resolve(true)
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

  // 上传围观数据
  uploadVisitor () {
    let _this = this,
      params = {
        propertyId: this.data.propertyId || '',
        shareOpenid: this.data.shareOpenid || ''
      }
      
    wx.cloud.callFunction({
      name: 'uploadVisitor',
      data: params,
      success: res => {
        console.log('上传围观', res.result)
      },
      fail: err => {
        console.error('[云函数] [uploadVisitor] 调用失败', err)
      }
    })
  },

  // 授权
  onGetUserInfo: function (e) {
    let userInfo = e.detail.userInfo
    this.setData({
      isShowAuthWin: false
    })
    if (userInfo) {
      this.afterAuth(userInfo)
    }
  },

  async afterAuth(userInfo) {
    let isRegisterSuc = await this.addRegister(userInfo)
    // 注册成功则上传我的围观
    isRegisterSuc && this.uploadVisitor()
  },

  removeRepetion(data = []) {
    let openidKeyList = {}
    return data.filter(item => {
      if (!(item._openid in openidKeyList)) {
        openidKeyList[item._openid] = 1
        return true
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    return {
      path: '/pages/propertyDetail/propertyDetail?shareOpenid=' + app.globalData.openid + '&propertyId=' + this.data.propertyId
    }
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

  goToLocation () {
    let propertyInfo = this.data.propertyInfo.location
    wx.openLocation({
      latitude: +propertyInfo.latitude,
      longitude: +propertyInfo.longitude,
      scale: propertyInfo.scale || 18,
      name: propertyInfo.name, 
      address: propertyInfo.address
    })
  },

  // 返回首页
  goHome() {
    let url = '../propertyList/propertyList?shareOpenid=' + this.data.shareOpenid;
    wx.navigateTo({
      url: url
    })
  },

  navigatorToImage (e) {
    let groupIndex = e.currentTarget.dataset.groupIndex,
        selectedPicture = e.currentTarget.dataset.selectedPicture,
        propertyId = this.data.propertyInfo._id,
      url = '../image/image?groupIndex=' + groupIndex + '&selectedPicture=' + selectedPicture + '&propertyId=' + propertyId

    app.globalData.propertyPictures = this.data.propertyInfo.pictures || []
    wx.navigateTo({
      url: url
    })
  },

  navToPropertyWatch () {
    let url = '../visitor/visitor?propertyId=' + this.data.propertyId
    wx.navigateTo({
      url: url
    })
  },

  navToMyWatch() {
    let url = '../visitor/visitor?propertyId=' + this.data.propertyId + '&openid=' + app.globalData.openid;
    wx.navigateTo({
      url: url
    })
  },

  callPhone (e) {
    let phone = e.currentTarget.dataset.phone
    console.log(e.currentTarget.dataset)
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  showMore () {
    this.setData({
      isShowMore: false
    })
  },

  // 关闭授权弹窗
  closeAuth () {
    this.setData({
      isShowAuthWin: false
    })
  },

  showSharePopup() {
    this.setData({
      isShowPop: true
    })
    this.setSharePicture()
  },

  async setSharePicture() {
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

    let avatarUrlImage = await this.getImageUrl(avatarUrl)
    let bgImagePath = await this.getImageUrl(this.data.sharePicture)
    // 调用云函数，获取小程序二维码
    let codeUrl = await this.getCodeUrl()
    // let codeImageUrl = await this.getImageUrl(codeUrl)
    wx.hideLoading()
    const ctx = wx.createCanvasContext('shareCanvas')
    ctx.drawImage(bgImagePath, 0, 0, 250, 400)
    ctx.drawImage(avatarUrlImage, 84, 232, 38, 38)
    ctx.drawImage(codeUrl, 129, 232, 38, 38)
    ctx.draw()

    const ctxBig = wx.createCanvasContext('shareCanvasBig')
    ctxBig.drawImage(bgImagePath, 0, 0, 750, 1200)
    ctxBig.drawImage(avatarUrlImage, 250, 696, 114, 114)
    ctxBig.drawImage(codeUrl, 388, 696, 114, 114)
    ctxBig.draw()

  },

  getImageUrl(url) {
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
              that.setData({
                isShowPop: false
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
  getCodeUrl() {
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


  getLoginUserInfo(params) {
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
  // 关闭popup
  closePopup() {
    this.setData({
      isShowPop: false
    })
  }
})