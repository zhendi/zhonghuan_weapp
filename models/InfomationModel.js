import mobx from '../vendor/wechat-weapp-mobx/mobx';

class InfomationModel {
  constructor(props = {}) {
    mobx.extendObservable(this, {
      id: props.id || null,
      title: props.title || '',
      image: props.image || {},
      link_type: props.link_type || '',
      link: props.link || '',
      desc: props.desc || '',
      public_at: props.public_at || '',
      position: props.position || 0
    });
  }
}

export default InfomationModel;
