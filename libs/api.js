import request from './zhonghuan/request';

const api = {
  getPagesInfoList: function(options) {
    let path = '/informations';
    request.get(Object.assign({ path }, options));
  },

  getPropertyList: function(options) {
    let path = '/buildings';
    request.get(Object.assign({ path }, options));	
  },

  getProperty: function(propertyId, options) {
    let path = `/buildings/${propertyId}`;
    request.get(Object.assign({ path }, options));
  },

  getVisitors: function(propertyId, options) {
    let path = `/buildings/${propertyId}/building_visitors`;
    request.get(Object.assign({ path }, options));
  }
}

export default api;
