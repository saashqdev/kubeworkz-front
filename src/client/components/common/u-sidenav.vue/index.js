import config from '@micro-app/common/utils/config';
import cookie from '@micro-app/common/utils/handleCookie';
import permissionService from '@micro-app/common/services/platform';
const MENU_MAP = {
    sideoverview: { text: 'Overview', value: 'sideoverview', remark: '' },
    'platform.gaojing': { text: 'Alert service', value: 'gaojing', remark: '', permissionKey: 'alert' },
    'platformManage.outerAuth': { text: 'External authorization', value: 'outerAuth', remark: '', permissionKey: 'authentication' },
};
export default {
    name: 'u-sidenav',
    data() {
        const activeModule = config.activeModule;
        let domains = { // Compatibility code can no longer be maintained in the future (the configuration is maintained at the node layer)
            ncs: '',
            nsf: '',
            cicd: '',
            apm: '',
            gtxs: '',
            platform: '',
            gportal: '',
            goapi: '',
            paas: '',
            logseer: '',
        };
        let codeTitleMap = config.curModule.reduce((obj, key) => { // Compatibility code can no longer be maintained in the future (the configuration is maintained at the node layer)
            obj[key] = (key !== 'gportal' ? key.toUpperCase() : 'API gateway');
            return obj;
        }, {});
        let codeRemarkMap = { // Compatibility code can no longer be maintained in the future (the configuration is maintained at the node layer)
            nsf: '(Microservices)',
            ncs: '(Container Cloud)',
            paas: '(Middleware)',
            cicd: '（Codepipeline）',
            apm: '(Application Monitoring)',
            gtxs: '(Distributed Transactions)',
            gportal: '（API Gateway）',
            goapi: '(Interface Test)',
            logseer: '(Log Service)',
        };

        if (activeModule) {
            domains = Object.keys(activeModule);
            codeTitleMap = Object.keys(activeModule).reduce((obj, key) => {
                obj[key] = activeModule[key].title;
                return obj;
            }, {});
            codeRemarkMap = Object.keys(activeModule).reduce((obj, key) => {
                obj[key] = activeModule[key].subtitle ? `（${activeModule[key].subtitle}）` : '';
                return obj;
            }, {});
        }
        return {
            show: false,
            config,
            domains,
            domainCodeMap: {},
            codeTitleMap,
            codeRemarkMap,
            pageMap: {
            },
            navList: [],
            port: window.location.port ? ':' + window.location.port : '',
            code: 'sideoverview',
            alertFlag: +localStorage.getItem('alertSwitch') === 1,
            authFlag: +localStorage.getItem('authSwitch') === 1,
            PlatformPermission: {},
        };
    },
    computed: {
        currentRoute() {
            const domains = this.domains;
            const domainKeys = Object.keys(domains);
            const curr = window.location.hostname && window.location.hostname.split('.')[0];
            if (curr && domainKeys.includes(curr)) {
                return curr;
            }
            const curr2 = window.location.pathname && window.location.pathname.split('/')[1];
            if (curr2 && domainKeys.includes(curr2)) {
                return curr2;
            }
            const routeNames = Array.isArray(this.$route.matched) && this.$route.matched.filter(item => !!item.name).map(item => item.name);
            const menuKey = routeNames && routeNames.length && Object.keys(MENU_MAP).find(name => {
                return routeNames.find(item => item.includes(name)) || null;
            }) || null;
            return menuKey && MENU_MAP[menuKey].value || this.code;
        },
        query() {
            return `?tenantId=${this.$route.query.tenantId}&projectId=${this.$route.query.projectId}`;
        },
        goapiHref() {
            return window.location.protocol + '//' + this.domains.goapi;
        },
        gaojingHref() {
            return window.location.protocol + '//' + cookie.readCookie('qz_platform.domain').replace(/(?=\/)|$/, this.port) + '#/alert/rule/index' + this.query;
        },
        outerAuthHref() {
            return window.location.protocol + '//' + cookie.readCookie('qz_platform.domain').replace(/(?=\/)|$/, this.port) + '#/permission/platformManage/outerAuth' + this.query;
        },
        sideoverviewHref() {
            return window.location.protocol + '//' + cookie.readCookie('qz_platform.domain').replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        // The following are compatible configurations
        ncsHref() {
            return window.location.protocol + '//' + this.domains.ncs.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        nsfHref() {
            return window.location.protocol + '//' + this.domains.nsf.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        cicdHref() {
            return window.location.protocol + '//' + this.domains.cicd.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        apmHref() {
            return window.location.protocol + '//' + this.domains.apm.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        gtxsHref() {
            return window.location.protocol + '//' + this.domains.gtxs.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        gportalHref() {
            return window.location.protocol + '//' + this.domains.gportal.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        paasHref() {
            return window.location.protocol + '//' + this.domains.paas.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        logseerHref() {
            return window.location.protocol + '//' + this.domains.logseer.replace(/(?=\/)|$/, this.port) + '#/' + this.query;
        },
        // The above are compatible configurations
        ...(config.activeModule ? Object.keys(config.activeModule).reduce((obj, key) => {
            if (key === 'goapi') {
                return obj;
            }
            obj[`${key}Href`] = function() {
                return window.location.protocol + '//' + this.domains[key].replace(/(?=\/)|$/, this.port) + '#/' + this.query;
            };
            return obj;
        }, {}) : {}),
    },
    created() {
        this.loadPlatformPermission();
    },
    methods: {
        toUrl(e) {
            this.code = e.value;
            window.location.href = e.value ? this[e.value + 'Href'] : this.sideoverviewHref;
        },
        loadPlatformPermission() {
            const tenantId = this.$route.query && this.$route.query.tenantId || +localStorage.getItem('tenantId') || +cookie.readCookie('tenantId');
            const projectId = this.$route.query && this.$route.query.projectId || +localStorage.getItem('projectId') || +cookie.readCookie('projectId');
            const accountId = cookie.readCookie('accountId');
            return permissionService.getGlobalUIPermissions({
                ServiceModule: 'platform',
                AccountId: accountId,
            }).then(res => {
                const PlatformPermission = res;
                return permissionService.DescribeUIPermissions({
                    PermissionScopeId: projectId || tenantId || 1,
                    ServiceModule: 'branchview', // Branch view or first-level navigation
                    AccountId: accountId,
                }).then(({ Permissions }) => {
                    if (Permissions && Array.isArray(Permissions)) {
                        const map = {};
                        const UIPermissions = Permissions.find(p => p.ResourceType === 'UI');
                        UIPermissions && UIPermissions.OperationTypes.forEach(res => map[res] = true);
                        this.PlatformPermission = Object.assign({
                            hasBranchView: true,
                        }, PlatformPermission, Object.keys(map).reduce((obj, key) => {
                            obj[`branchview_${key}`] = map[key];
                            return obj;
                        }, {}));
                    } else {
                        this.PlatformPermission = PlatformPermission;
                    }
                    this.handleConfig();
                }).catch(() => { // Usually does not appear
                    this.PlatformPermission = PlatformPermission;
                    this.handleConfig();
                });
            });
        },
        handleConfig() {
            config.getDomains().then(() => {
                this.domains = config.domains;
                const PlatformPermission = this.PlatformPermission;
                config.curModule.forEach(item => {
                    this.domainCodeMap[config.domains[item]] = item;
                    this.navList.push({ text: this.codeTitleMap[item], value: item, remark: this.codeRemarkMap[item] });
                });

                this.navList.unshift(MENU_MAP.sideoverview);
                if (this.alertFlag) {
                    this.navList.push(MENU_MAP['platform.gaojing']);
                }
                if (this.authFlag && PlatformPermission.opsMgr) {
                    this.navList.push(MENU_MAP['platformManage.outerAuth']);
                }

                // Add permission control
                this.navList = this.navList.filter(item => { // hide
                    if (!PlatformPermission.hasBranchView) {
                        return true;
                    }
                    const value = item.permissionKey || item.value;
                    if (value === 'sideoverview') { // Overview or Branch Overview
                        return PlatformPermission.branchview_ccbOverview || PlatformPermission.branchview_overview;
                    }
                    return PlatformPermission[`branchview_${value}`];
                });

                const { hostname } = window.location;
                this.code = this.domainCodeMap[hostname] || 'sideoverview';
            });
        },
    },
};
