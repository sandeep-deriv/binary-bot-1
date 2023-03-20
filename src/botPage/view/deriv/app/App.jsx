import React from 'react';
import { TrackJS } from 'trackjs';
import GTM from '../../../../common/gtm';
import Routes from '../routes';
import { api_base } from '../../../../apiBase';
// eslint-disable-next-line import/no-named-as-default
import trackjs_config from '../../trackJs_config';
import _Symbol from '../../../common/symbolApi';

// Todo create symbol slice and update/add info from here;
const App = () => {
    const [has_symbols, setHasSymbols] = React.useState(false);
    TrackJS.install(trackjs_config);
    GTM.init();
    $.ajaxSetup({
        cache: false,
    });

    React.useEffect(() => {
        api_base.init();
    }, []);

    React.useEffect(() => {
        if(api_base?.api) {
            const symbols = new _Symbol();
            symbols.initPromise.then(() => {
                setHasSymbols(true);
            });
            api_base.setSymbolAPI(symbols);
        }
    }, [api_base.api]);

    if (!has_symbols) return null; // Todo: add fallback

    return <Routes />;
};

export default App;
