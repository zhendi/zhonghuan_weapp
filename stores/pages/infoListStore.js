import mobx from '../../vendor/wechat-weapp-mobx/mobx';
import Infomation from '../../models/InfomationModel';


class InfoListStore {
  constructor() {
    mobx.extendObservable(this, {
      infomations: [],
      ui: { pageInited: false }
    });
  }

  set(props) {
    console.log(props.informations)
    this.infomations = (props.informations || []).map(infomation => new Infomation(infomation));
    this.updateUI(props.ui || {});
  }

  updateUI(ui) {
    this.ui = Object.assign({}, this.ui, ui);
  }
}

export default new InfoListStore;
