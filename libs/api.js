import request from './zhonghuan/request';

const api = {
  getPagesInfoList: function(options) {
    let path = '/informations';
    request.get(Object.assign({ path }, options));
  },
}

export default api;
