import React from 'react';
import { TrackJS } from 'trackjs';
import { symbolPromise } from '@blockly/blocks/shared';
import GTM from '@utilities/integrations/gtm';
import { useSelector, useDispatch } from 'react-redux';
import { api_base } from '@api-base';
import { observer as globalObserver } from '@utilities/observer';
import { isProduction } from '@utils';
import initLogHandler from '@utilities/logger';
import { getActiveLoginId } from '@storage';
import trackjs_config from '../botPage/view/trackJs_config';
import Routes from '../routes';
import ActiveSymbols from '../botPage/common/symbolApi/activeSymbols';
import { setActiveSymbols } from '../redux-store/client-slice';

const App = () => {
    const dispatch = useDispatch();
    const has_active_symbols = useSelector(state => state.client.active_symbols);
    const is_logged_in = useSelector(state => state.client.is_logged);

    React.useEffect(() => {
        if (isProduction()) {
            TrackJS.install(trackjs_config);
            GTM.init();
        }
    }, []);

    React.useEffect(() => {
        if (isProduction()) {
            const user_id = getActiveLoginId();
            initLogHandler(user_id);
        }
    }, [initLogHandler]);

    React.useEffect(() => {
        api_base.api.expectResponse('authorize').then(() =>
            api_base.getActiveSymbols().then(data => {
                initActiveSymbols(data);
            })
        );

        /* This code is used to monitor active_symbols when the user is not logged in and
        will initialize the app without requiring an authorization response. */
        const listenToActiveSymbols = data => {
            if (!is_logged_in && data.msg_type === 'active_symbols') {
                initActiveSymbols(data);
            }
        };

        api_base.api.onMessage().subscribe(({ data }) => listenToActiveSymbols(data));

        return () => {
            api_base.api.onMessage().unsubscribe(listenToActiveSymbols);
        };
    }, []);

    const initActiveSymbols = data => {
        symbolPromise.then(() => {
            try {
                /* eslint-disable no-new */
                new ActiveSymbols(data.active_symbols);
            } catch (error) {
                globalObserver.emit('Error', error);
            }
            dispatch(setActiveSymbols(data));
        });
    };

    $.ajaxSetup({
        cache: false,
    });

    if (has_active_symbols.length === 0) return null;

    return <Routes />;
};

export default App;
