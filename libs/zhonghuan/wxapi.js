const wxapi = {
  saveImageToPhotosAlbum: function(options = {}) {
    const { success, fail, complete, imageFilePath } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      fail && fail(error);
      complete && complete(error);
    };

    wx.saveImageToPhotosAlbum({
      filePath: imageFilePath,
      success: callSuccess,
      fail: (error) => {
        callFail();

        if (error.errMsg.includes('deny') || error.errMsg.includes('denied') || error.errMsg.includes('拒绝授权')) {
          let title = '你拒绝了授权请求'
          let content = '此程序需要能够保存到相册才能正常提供服务。请在设置界面允许“保存到相册”。';
          let showCancel = false;
          let success = () => {
            wx.openSetting({
              success: (result) => {
                if (result.authSetting['scope.writePhotosAlbum']) {
                  wx.showToast({ title: '授权成功', icon: 'success' });
                }
              }
            });
          };
          wx.showModal({ title, content, showCancel, success });
        }
      }
    });
  },

  chooseAddress: function(options = {}) {
    const { success, fail, complete } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      fail && fail(error);
      complete && complete(error);
    };

    wx.chooseAddress({
      success: callSuccess,
      fail: (error) => {
        callFail();

        if (error.errMsg.includes('deny') || error.errMsg.includes('denied') || error.errMsg.includes('拒绝授权')) {
          let title = '你拒绝了授权请求'
          let content = '此程序需要访问你的通讯地址才能正常提供服务。请在设置界面允许使用你的“通讯地址”。';
          let showCancel = false;
          let success = () => {
            wx.openSetting({
              success: (result) => {
                if (result.authSetting['scope.address']) {
                  wx.showToast({ title: '授权成功', icon: 'success' });
                }
              }
            });
          };
          wx.showModal({ title, content, showCancel, success });
        }
      }
    });
  },

  getLocation: function(options = {}) {
    const { success, fail, complete } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      fail && fail(error);
      complete && complete(error);
    };

    wx.getLocation({
      success: callSuccess,
      fail: (error) => {
        callFail();

        if (error.errMsg.includes('deny') || error.errMsg.includes('denied') || error.errMsg.includes('拒绝授权')) {
          let title = '你拒绝了授权请求'
          let content = '此程序需要访问你的地理位置才能正常提供服务。请在设置界面允许使用。';
          let showCancel = false;
          let success = () => {
            wx.openSetting({
              success: (result) => {
                if (result.authSetting['scope.userLocation']) {
                  wx.showToast({ title: '授权成功', icon: 'success' });
                }
              }
            });
          };
          wx.showModal({ title, content, showCancel, success });
        }
      }
    });
  }
};

export default wxapi;
