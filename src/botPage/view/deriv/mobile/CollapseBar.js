import React from 'react';
import { translate } from '../../../../common/i18n';
import { observer as globalObserver } from '../../../../common/utils/observer';
import RunButton from '../../TradeInfoPanel/RunButton';
import cn from 'classnames';

const CollapseBar = () => (
    <div className="container">
        <div id="collapse-wrapper">
            <CollapseWrapper>
                <SummaryTabs />
            </CollapseWrapper>
        </div>
        <div>
            <div className="controls">
                <div className="bot-action">
                    <RunButton />
                </div>
                <div className="bot-status">
                    <AnimateTrade />
                </div>
            </div>
        </div>
    </div>
);

export default CollapseBar;

const useIsMounted = () => {
    const isMounted = React.useRef(false);

    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return React.useCallback(() => isMounted.current, []);
};

const CollapseWrapper = ({ children }) => {
    const [isOpen, setOpen] = React.useState(false);
    const [height, setHeight] = React.useState('36px');

    const toggle = () => {
        setOpen(!isOpen);
    };

    React.useEffect(() => {
        if (isOpen) {
            setHeight('100vh');
        } else {
            setHeight('36px');
        }
    }, [isOpen]);

    return (
        <div className="collapse-trigger">
            <div className="content-inner" style={{ maxHeight: height }}>
                <div onClick={toggle} className="toggler">
                    <img
                        className={`header__icon header__expand ${isOpen ? '' : 'open'}`}
                        src="image/deriv/ic-chevron-down-bold.svg"
                    />
                </div>
                <div className="content-wrapper">{children}</div>
            </div>
        </div>
    );
};

const resetAnimation = () => {
    $('.circle-wrapper').removeClass('active complete');
    $('.line').removeClass('active complete');
    $('.stage-tooltip:not(.top)').removeClass('active');
};

const activateStage = index => {
    if (index > 0) {
        $(`.circle-wrapper:eq(${index - 1})`).removeClass('active');
        $(`.circle-wrapper:eq(${index - 1})`).addClass('complete');
    }
    $(`.circle-wrapper:eq(${index})`).addClass('active');
    $(`.stage-tooltip.bottom:eq(${index})`).addClass('active');
};

const INDICATOR_MESSAGES = {
    notRunning: translate('Bot is not running.'),
    starting: translate('Bot is starting...'),
    running: translate('Bot is running...'),
    stopping: translate('Bot is stopping...'),
    stopped: translate('Bot has stopped.'),
};

const AnimateTrade = () => {
    const [indicator_message, setIndicatorMessage] = React.useState(INDICATOR_MESSAGES.notRunning);

    const isMounted = useIsMounted();

    const resetSummary = () => {
        resetAnimation();
        setIndicatorMessage(INDICATOR_MESSAGES.notRunning);
    };

    const animateStage = contractStatus => {
        if (contractStatus.id === 'contract.purchase_sent') {
            resetAnimation();
            activateStage(0);
        } else if (contractStatus.id === 'contract.purchase_recieved') {
            $('.line').addClass('active');
            activateStage(1);
        } else if (contractStatus.id === 'contract.sold') {
            $('.line').addClass('complete');
            activateStage(2);
        }

        activateStage(contractStatus.id);
    };

    React.useEffect(() => {
        globalObserver.register('reset_animation', resetSummary);
        globalObserver.register('summary.clear', resetSummary);
        globalObserver.register('bot.running', () => {
            $('.stage-tooltip.top:eq(0)').addClass('running');
            if (isMounted()) setIndicatorMessage(INDICATOR_MESSAGES.running);
        });
        globalObserver.register('bot.stop', () => {
            $('.stage-tooltip.top:eq(0)').removeClass('running');
            if (isMounted()) setIndicatorMessage(INDICATOR_MESSAGES.stopped);
        });

        $('#stopButton').on('click', () => {
            $('.stage-tooltip.top:eq(0)').removeClass('running');
            setIndicatorMessage(
                globalObserver.getState('isRunning') ? INDICATOR_MESSAGES.stopping : INDICATOR_MESSAGES.stopped
            );
        });
        $('#runButton').on('click', () => {
            resetAnimation();
            $('.stage-tooltip.top:eq(0)').addClass('running');
            setIndicatorMessage(INDICATOR_MESSAGES.starting);
            globalObserver.emit('summary.disable_clear');
            globalObserver.register('contract.status', contractStatus => animateStage(contractStatus));
        });

        return () => {
            $('#stopButton').off('click');
            $('#runButton').off('click');
        };
    }, []);

    return (
        <div>
            <div className="bot-indicator">{indicator_message}</div>
            <div id="current-trade-status">
                <CircleWrapper>
                    <div className="line">
                        <div className="progress-bar" />
                    </div>
                </CircleWrapper>
                <CircleWrapper />
                <CircleWrapper />
            </div>
        </div>
    );
};

const CircleWrapper = ({ children }) => (
    <span className="stage">
        <span className="circle-wrapper">
            <span className="static-circle" />
            <span className="dynamic-circle" />
            {children}
        </span>
    </span>
);

const tabs = ['Summary', 'Transactions', 'Logs'];

const SummaryTabs = () => {
    const [active_tab, setActive] = React.useState(0);

    return (
        <div className="summary__container">
            <div className="summary__tabs">
                {tabs.map((tab_label, index) => (
                    <div
                        className={cn('summary__tab_heading', { active: index === active_tab })}
                        onClick={() => setActive(index)}
                    >
                        <span>{tab_label}</span>
                    </div>
                ))}
            </div>
            <div className="summary__tab_content">
                <div>tab content will be here</div>
            </div>
        </div>
    );
};
