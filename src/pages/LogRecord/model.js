import moment from 'moment';
import { utils } from 'suid';
import { constants } from '@/utils';

const { dvaModel } = utils;
const { modelExtend, model } = dvaModel;
const { SEARCH_DATE_TIME_PERIOD } = constants;

const getDefaultTimeViewType = () => {
  const endTime = moment().format('YYYY-MM-DD HH:mm:ss');
  const startTime = moment(endTime)
    .subtract(5, 'minute')
    .format('YYYY-MM-DD HH:mm:ss');
  return [startTime, endTime];
};

export default modelExtend(model, {
  namespace: 'logRecord',

  state: {
    currentMaster: null,
    currentTimeViewType: SEARCH_DATE_TIME_PERIOD.ALL,
    currentEnvViewType: null,
    initOpTime: getDefaultTimeViewType(),
  },
  effects: {},
});
