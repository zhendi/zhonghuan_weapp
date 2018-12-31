import config from '../../config';
import auth from './auth';
import constants from './constants';
import session from './session';

class RequestError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
    this.message = message;
  }
}

const request = {
  get: function(options) {
    options.method = 'GET';
    this._request(options);
  },

  post: function(options) {
    options.method = 'POST';
    this._request(options);
  },

  put: function(options) {
    options.method = 'PUT';
    this._request(options);
  },

  delete: function(options) {
    options.method = 'DELETE';
    this._request(options);
  },

  uploadFile: function(options) {
    this._request(options, 'uploadFile');
  },

  _request: function(options, requestMethod) {
    const { success, fail, complete } = options;

    const callSuccess = (...params) => {
      success && success(...params);
      complete && complete(...params);
    };

    const callFail = (error) => {
      this._handleRequestError(error);

      fail && fail(error);
      complete && complete(error);
    };

    let hasRetried = false;
    const doRequest = () => {
      const url = config.apiBaseURL + options.path;

      const header = options.header || {};
      header['authorization'] = (session.get() || {})['token'];
      header['content-type'] = header['content-type'] || 'application/json';

      const callbacks = {
        success: (response) => {
          // force convert response data to JSON object
          if (response.data && (typeof response.data === 'string')) {
            try {
              response.data = JSON.parse(response.data);
            } catch (_) {
              if (response.statusCode === 502) {
                response.data = { message: '系统正在升级，请稍后再试' };
              } else {
                response.data = { message: '服务器开小差，请稍后再试' };
              }
            }
          }

          // 2xx success
          if (response.statusCode >= 200 && response.statusCode < 300) {
            callSuccess(response.data);
            return;
          }

          // 3xx error
          if (response.statusCode >= 300 && response.statusCode < 400 ) {
            const error = new RequestError(constants.ERROR_REQUEST_REDIRECT_ERROR, '重定向错误');
            error.detail = response.data;
            callFail(error);
            return;
          }

          // 4xx error
          if (response.statusCode >= 400 && response.statusCode < 500) {
            if (response.statusCode === 400) {
              if (response.data.code === 10000) {
                wx.navigateTo({ url: '/pages/weapp-index/weapp-index' });
                const error = new RequestError(constants.ERROR_NOOP, '重定向到 pages/weapp-index/weapp-index ...');
                error.detail = response.data;
                callFail(error);
                return
              }
            } else if (response.statusCode === 401) {
              session.clear();
              if (!hasRetried) {
                hasRetried = true;
                auth.login({
                  success: doRequest,
                  fail: () => {
                    const error = new RequestError(constants.ERROR_REQUEST_AUTH_ERROR, '登录失败')
                    callFail(error);
                  }
                });
                return;
              }
            }

            const error = new RequestError(constants.ERROR_REQUEST_CLIENT_ERROR, '客户端错误');
            error.detail = response.data;
            callFail(error);
            return;
          }

          // 5xx error
          if (response.statusCode >= 500) {
            if (response.statusCode === 502) {
              const error = new RequestError(constants.ERROR_REQUEST_SERVER_ERROR, '系统正在升级, 请稍后重试');
              error.detail = response.data;
              callFail(error);
              return;
            }

            const error = new RequestError(constants.ERROR_REQUEST_SERVER_ERROR, '服务端错误');
            error.detail = response.data;
            callFail(error);
            return;
          }

          // unknown error, e.g. 1xx info
          const error = new RequestError(constants.ERROR_REQUEST_UNKNOWN_ERROR, '未知错误');
          error.detail = response.data;
          callFail(error);
        },
        fail: (r) => {
          if (r.errMsg && r.errMsg.includes('statusCode : 401')) {
            session.clear();
            if (!hasRetried) {
              hasRetried = true;
              auth.login({
                success: doRequest,
                fail: () => {
                  const error = new RequestError(constants.ERROR_REQUEST_AUTH_ERROR, '登录失败')
                  callFail(error);
                }
              });
              return;
            }
          }

          const error = new RequestError(constants.ERROR_WX_REQUEST_FAILED, '微信发送请求失败');
          error.detail = r;
          callFail(error);
        }
      };

      if (requestMethod === 'uploadFile') {
        const filePath = options.filePath;
        const name = options.name;
        const formData = options.formData;
        wx.uploadFile({ url, filePath, name, header, formData, success: callbacks.success, fail: callbacks.fail });
      } else {
        const data = options.data;
        const method = options.method || 'GET';
        const dataType = options.dataType || 'json';
        wx.request({ url, data, header, method, dataType, success: callbacks.success, fail: callbacks.fail });
      }
    };

    doRequest();
  },

  _handleRequestError: function(error) {
    if (error.type === constants.ERROR_REQUEST_AUTH_ERROR) {
      return;
    }

    let title = '提示';
    let content = '请求失败，请重试';
    let showCancel = false;
    let success = () => {};

    switch (error.type) {
      case constants.ERROR_WX_REQUEST_FAILED:
        content = '网络可能存在异常，请重试';
        break;
      case constants.ERROR_REQUEST_REDIRECT_ERROR:
      case constants.ERROR_REQUEST_CLIENT_ERROR:
      case constants.ERROR_REQUEST_SERVER_ERROR:
      case constants.ERROR_REQUEST_UNKNOWN_ERROR:
        content = (error.detail && error.detail.message) || error.message || '操作失败，请重试';
        break;
      case constants.ERROR_NOOP:
        return;
    }

    wx.showModal({ title, content, showCancel, success });
  }
}

export default request;
