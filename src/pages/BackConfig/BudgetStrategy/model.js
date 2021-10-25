import { utils } from 'suid';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
  namespace: 'budgetStrategy',

  state: {
    rowData: null,
  },
  effects: {},
});
