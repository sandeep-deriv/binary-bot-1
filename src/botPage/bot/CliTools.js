import Observer from '../../common/utils/observer';
import Interpreter from './Interpreter';
import TicksService from '../common/TicksService';

export const createScope = () => {
    const observer = new Observer();
    const ticksService = new TicksService();
    return { observer, ticksService };
};

export const createInterpreter = () => new Interpreter();
