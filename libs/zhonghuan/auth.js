import config from '../../config';
import constants from './constants';
import session from './session';

class LoginError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
    this.message = message;
  }
}

const auth = {
  // 登录，传入通过 <button open-type="getUserInfo"> 获取的用户信息
  loginWithUserInfo: function(options = {}) {
    const { success, fail, complete, e, bindinfo } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      this._handleLoginError(error);

      fail && fail(error);
      complete && complete(error);
    };

    const errMsg = e.detail.errMsg || '';
    if (errMsg.includes('deny') || errMsg.includes('denied') || errMsg.includes('拒绝授权')) {
      const error = new LoginError(constants.ERROR_WX_BUTTON_GET_USER_INFO_FAILED, '获取微信用户信息失败');
      error.detail = errMsg;
      callFail(error);
      return;
    }

    const currentSession = session.get();
    if (currentSession) {
      session.clear();
      this._login({ success: callSuccess, fail: callFail, bindinfo });
    } else {
      this._login({ success: callSuccess, fail: callFail, bindinfo });
    }
  },

  // 登录
  login: function(options = {}) {
    const { success, fail, complete } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      this._handleLoginError(error);

      fail && fail(error);
      complete && complete(error);
    };

    const currentSession = session.get();
    if (currentSession) {
      wx.checkSession({
        success: () => {
          callSuccess(currentSession);
        },
        fail: () => {
          session.clear();
          this._login({ success: callSuccess, fail: callFail });
        }
      });
    } else {
      this._login({ success: callSuccess, fail: callFail });
    }
  },

  // 处理整个登录过程产生的异常
  _handleLoginError: function(error) {
   console.warn('[auth._handleLoginError:' + error.type + ']', error.detail);

    let title = '提示';
    let content = '登录失败，请重试';
    let showCancel = false;
    let success = () => {};

    switch (error.type) {
      case constants.ERROR_WX_BUTTON_GET_USER_INFO_FAILED:
        title = '你拒绝了授权请求';
        content = '此程序需要获得你的公开信息才能正常提供服务。请允许使用你的“用户信息”。';
        break;
      case constants.ERROR_WX_LOGIN_FAILED:
        content = '网络可能存在异常，请重试';
        break;
      case constants.ERROR_WX_GET_USER_INFO_FAILED:
        if (!error.detail.errMsg.includes('deny')) {
          content = '网络可能存在异常，请重试';
          break;
        }

        title = '你拒绝了授权请求';
        content = '此程序需要获得你的公开信息才能正常提供服务。请在设置界面允许使用你的“用户信息”。';
        success = () => {
          wx.openSetting({
            success: (result) => {
              if (result.authSetting['scope.userInfo']) {
                wx.showToast({ title: '授权成功', icon: 'success' });
              }
            }
          });
        };
        break;
      case constants.ERROR_CREATE_SESSION_REQUEST_FAILED:
        content = '网络可能存在异常，请重试';
        break;
      case constants.ERROR_CREATE_SESSION_FAILED:
        content = (error.detail && error.detail.message) || '授权失败，请重试';
        break;
      case constants.ERROR_UPDATE_SESSION_REQUEST_FAILED:
        content = '网络可能存在异常，请重试';
        break;
      case constants.ERROR_UPDATE_SESSION_FAILED:
        content = (error.detail && error.detail.message) || '授权失败，请重试';
        break;
      case constants.ERROR_NOOP:
        return;
    }

    wx.showModal({ title, content, showCancel, success });
  },

  // 向开发者服务器发送请求，创建用户会话
  _login: function(options) {
    const { success, fail, complete, bindinfo } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      fail && fail(error);
      complete && complete(error);
    };

    this._wxlogin({
      success: (result) => {
        const url = config.apiBaseURL + '/sessions';
        const session_params = { code: result.code, encrypted_data: result.encryptedData, iv: result.iv, bindinfo };

        wx.request({
          url: url,
          method: 'POST',
          data: session_params,
          dataType: 'json',
          header: { 'content-type': 'application/json' },
          success: (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
              const error = new LoginError(constants.ERROR_CREATE_SESSION_FAILED, '创建会话失败');
              error.detail = response.data;
              callFail(error);
              return;
            }

            const currentSession = response.data['result_rows'];
            session.set(currentSession);
            callSuccess(currentSession);
          },
          fail: (r) => {
            const error = new LoginError(constants.ERROR_CREATE_SESSION_REQUEST_FAILED, '创建会话失败，微信发送请求失败');
            error.detail = r;
            callFail(error);
          }
        });
      },
      fail: callFail
    });
  },

  // 调用 wx.login 获取临时登录凭证 code
  _wxlogin: function(options) {
    const { success, fail, complete } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      fail && fail(error);
      complete && complete(error);
    };

    wx.login({
      success: (result) => {
        if (result.code) {
          callSuccess(result);
        } else {
          const error = new LoginError(constants.ERROR_WX_LOGIN_FAILED, '获取微信用户登录态失败');
          callFail(error);
          return;
        }
      },
      fail: (r) => {
        const error = new LoginError(constants.ERROR_WX_LOGIN_FAILED, '微信登录失败');
        error.detail = r;
        callFail(error);
      }
    });
  }
};

export default auth;
