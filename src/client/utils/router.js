/**
 * vue-router route hijacking
 * @param {*} router
 */
export function customRouter(router) {
    function getLeaveConfirm(to) {
        if (!to) { return undefined; }
        const meta = to.meta;
        return meta.leaveConfirm === true ? router.defaultConfirm : meta.leaveConfirm;
    }
    function getRefreshBase(to) {
        let refreshBase = '';
        for (const item of to.matched) {
            const meta = item.meta;
            if (meta.refreshBase !== undefined) {
                refreshBase = meta.refreshBase === true ? item.path : meta.refreshBase;
            }
        }
        if (typeof refreshBase === 'string') { refreshBase = { path: refreshBase }; }
        return refreshBase;
    }
    function getValueStr(value) {
        if (typeof value === 'string') { return value; }
        return JSON.stringify(value);
    }
    router.defaultConfirm = {
        title: 'Hint',
        content: 'Are you sure you want to leave this page?',
        subContent: 'The information edited on this page will be cleared after you leave.',
    };
    // Whether the same path is refreshed, fixed parameters that need to be monitored, each module overrides or adds according to the needs of its own project
    router.compareQuerys = [ 'projectId' ];
    router.compareCallBack = () => ({});
    // Because a pop-up window is required for confirmation on the edit page, changing the tenant will trigger beforeEach (tenantId and projectId of the chain reaction) twice, and two pop-up windows will appear.
    // So here is a switch needConfirm, which defaults to true. When the tenant is changed on the edit page, set it to false. After the tenantId and projectId in u-head.vue are changed. Revert to true.
    router.needConfirm = true;
    let isChecked = false;
    let forceRefresh = false;
    let hiddenConfirm = false;
    router.beforeEach((to, from, next) => {
        const leaveConfirm = getLeaveConfirm(from);
        function nextRouter() {
            let refreshPage = false;
            let newParams = to.query;
            // The same page will not be refreshed if the path is not equal, and the jump to the page if the path is not equal will not be regarded as a switch.
            if (from.path !== to.path || isChecked) {
                if (from.path !== to.path && isChecked) { forceRefresh = false; }
                next();
                return;
            }
            for (const key of router.compareQuerys) {
                const value = to.query[key];
                const oldValue = from.query[key];
                if (getValueStr(value) !== getValueStr(oldValue)) {
                    const paramAdd = router.compareCallBack(to, from);
                    newParams = Object.assign({}, newParams, paramAdd);
                    refreshPage = true;
                }
            }
            if (refreshPage) {
                let { path, extraQuery } = getRefreshBase(to);
                let query = {};
                if (!path || path === to.path) {
                    path = to.path;
                    query = to.query;
                } else {
                    for (const key of router.compareQuerys) {
                        query[key] = to.query[key];
                    }
                }
                forceRefresh = true;
                isChecked = true;
                next({
                    path,
                    query: Object.assign({}, extraQuery, query),
                });
            } else { next(); }
        }
        if (leaveConfirm && !hiddenConfirm && router.needConfirm) {
            hiddenConfirm = true;
            router.app.$confirm(Object.assign({}, leaveConfirm, {
                ok: () => Promise.resolve().then(() => {
                    if (router.onOk instanceof Function) {
                        router.onOk(to.query);
                        router.onCancel = undefined;
                        router.onOk = undefined;
                    }
                    nextRouter();
                }),
                cancel: () => {
                    if (router.onCancel instanceof Function) {
                        router.onCancel(to.query);
                        router.onCancel = undefined;
                        router.onOk = undefined;
                    }
                    hiddenConfirm = false;
                },
            }));
        } else {
            if (router.onOk instanceof Function) {
                router.onOk(to.query);
                router.onCancel = undefined;
                router.onOk = undefined;
            }
            nextRouter();
        }
    });
    router.afterEach((to, from) => {
        hiddenConfirm = false;
        isChecked = false;
        if (forceRefresh) {
            setTimeout(() => {
                router.refresh(to, from);
            }, 50);
            forceRefresh = false;
        }
    });
    const _push = router.push;
    router.push = (option, onComplete, onAbort) => {
        hiddenConfirm = option instanceof Object ? option.noConfirm : false;
        _push.apply(router, [ option, onComplete, onAbort ]);
    };
    router.refresh = () => {
        // Refresh requires component copying, and the external party determines the parts that need to be refreshed.
        window.location.reload();
    };
}
