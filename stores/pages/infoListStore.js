import mobx from '../../vendor/wechat-weapp-mobx/mobx';
import Infomation from '../../models/InfomationModel';


class InfoListStore {
  constructor() {
    mobx.extendObservable(this, {
      informations: [],
      ui: { pageInited: false }
    });
  }

  set(props) {
    this.informations = (props.infomations || []).map(infomation => new Infomation(infomation));
    this.updateUI(props.ui || {});
  }

  updateUI(ui) {
    this.ui = Object.assign({}, this.ui, ui);
  }
}

export default new InfoListStore;
