import filesaver from 'file-saver';
import { AppConstants } from '../../common/appId';
import TicksService from '../common/TicksService';
import { get as getStorage } from '../../common/utils/storageManager';

export const ticksService = new TicksService();

export const appendRow = (trade, state, isDesc = false) => ({
    id: state.id + 1,
    rows: isDesc
        ? [
              {
                  ...trade,
                  id: state.id + 1,
              },
              ...state.rows,
          ]
        : [
              ...state.rows,
              {
                  ...trade,
                  id: state.id + 1,
              },
          ],
});

export const updateRow = (prevRowIndex, trade, state) => ({
    id: state.id,
    rows: [
        ...state.rows.slice(0, prevRowIndex),
        {
            ...trade,
            id: state.id,
        },
    ],
});

export const saveAs = ({ data, filename, type }) => {
    const blob = new Blob([data], { type });
    filesaver.saveAs(blob, filename);
};

export const restrictInputCharacter = ({ whitelistRegEx, input }) => input.match(new RegExp(whitelistRegEx));

export const isNumber = num => num !== '' && Number.isFinite(Number(num));

export const getActiveToken = tokenList => {
    const activeTokenObject = tokenList.filter(
        tokenObject => tokenObject.token === getStorage(AppConstants.STORAGE_ACTIVE_TOKEN)
    );
    return activeTokenObject.length ? activeTokenObject[0] : tokenList[0];
};
