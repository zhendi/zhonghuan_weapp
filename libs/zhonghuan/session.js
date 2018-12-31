import constants from './constants';

const session_key = 'SESSION-' + constants.SESSION_MAGIC_ID;
const session = {
  get: function() {
    return wx.getStorageSync(session_key) || null;
  },

  set: function(session) {
    wx.setStorageSync(session_key, session);
  },

  clear: function() {
    wx.removeStorageSync(session_key);
  }
};

export default session;
