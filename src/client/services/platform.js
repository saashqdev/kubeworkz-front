/**
 * Platform-related interfaces, specific interface information can be viewed at the Gportal address: http://gportal.cloud.126.net/gateway/interfaces Select the service as skiff
 */
import Service from './service.js';
const prefix = '/auth/proxy';
const version = '2018-08-09';
const path = '/authority';

const uiPermissionsProcess = ({ Permissions = [] }) => {
    const map = {};
    const UIPermissions = Permissions.find((p) => p.ResourceType === 'UI');
    UIPermissions && UIPermissions.OperationTypes.forEach((res) => map[res] = true);
    return map;
};

const apis = {
    // Display tenant or project list in full
    listAllScopes: {
        Offset: 0,
        Limit: 1000,
        action: 'DescribePermissionScopes',
    },
    // Fully display the list of tenants or projects visible to members
    listUserAllScopes: {
        Offset: 0,
        Limit: 1000,
        action: 'DescribeUserPermissionScopes',
    },
    // Get a list of tenants or projects whose members have the administrator role
    listAdminUserScopes: {
        action: 'DescribeUserAdminPermissionScopes',
    },
    // Get member information under a tenant or project
    listScopeMembers: {
        action: 'DescribeScopeMembers',
    },
    // Get a list of all administrators under a tenant or project
    listAdminUsers: {
        action: 'DescribeAdminUsers',
    },
    // Get domain information
    getScopeInfo: {
        action: 'DescribePermissionScope',
    },
    // Get the member's role information under the tenant or project
    getMemberRole: {
        action: 'DescribeRoles',
    },
    // Get information about a single member
    getUser: {
        action: 'DescribeUserInfo',
    },
    // Get the front-end to display information about different page elements based on the permissions owned by the tenant.
    getUIPermissions: {
        action: 'DescribeUIPermissions',
        process: uiPermissionsProcess,
    },
    DescribeUIPermissions: {
        action: 'DescribeUIPermissions',
    },
    // Get the platform permission management entrance information that can be displayed in the drop-down list in the upper right corner of the top bar
    getGlobalUIPermissions: {
        action: 'DescribeGlobalUIPermissions',
        process: uiPermissionsProcess,
    },
    // Get the main domain name where the cookie should be written and the domain name of each sub-module. If the domain name is returned empty, the module will not be deployed.
    getCookieDomain: {
        action: 'DescribeDomains',
    },
    getAccountId: {
        action: 'DescribeAccountId',
    },
    matchAccountId: {
        action: 'DescribeAccountIdFuzzyMatch',
    },
    // Get environment list
    getEnvList: {
        action: 'DescribeAllFundamentalEnvInfo',
        Version: '2019-01-03',
    },
    getAllEnvList: {
        action: 'DescribeAllFundamentalEnvInfo',
        Offset: 0,
        Limit: 1000,
        Version: '2019-01-03',
    },
    createEnv: {
        action: 'CreateEnvInfo',
        method: 'post',
    },
    getEnvAddrs: {
        action: 'DescribeEnvAddrByEnvId',
    },
    deleteEnv: {
        action: 'DeleteEnvInfo',
    },
    updateEnv: {
        action: 'UpdateEnvInfo',
        method: 'post',
    },
    // Get a list of all members
    listUsers: {
        action: 'DescribeUsers',
    },
    createUser: {
        action: 'CreateUser',
        method: 'post',
    },
    updateUser: {
        action: 'UpdateUser',
        method: 'post',
    },
    updatePwd: {
        action: 'UpdatePwd',
        method: 'post',
    },
    setUserStatus: {
        action: 'ChangeUserStatus',
    },
    // Set and cancel super management
    setUserAdmin: {
        action: 'SetSystemAdmin',
    },
    downloadTemplate: {
        action: 'GetUserImportTemplate',
        download: true,
    },
    uploadCSV: {
        action: 'CreateUserByCsvFile',
        method: 'post',
    },
    downloadResult: {
        action: 'DownloadFailUserData',
        download: true,
    },
    // Delete custom role
    deleteRole: {
        action: 'DeleteRole',
    },
    // Add custom role
    createDefineRole: {
        action: 'CreateRole',
    },
    // Modify custom role
    editDefineRole: {
        action: 'UpdateRoleName',
    },
    // Permission module
    describeModule: {
        action: 'DescribeServiceModules',
    },
    // Basic permissions of each module
    describeAllRight: {
        action: 'DescribeAllPermissions',
    },
    // Update role permissions
    updateRoleRight: {
        action: 'UpdateRolePermissions',
        method: 'post',
    },
    // Modify user personal information
    updateUserInfo: {
        action: 'UpdateUserByUser',
        method: 'post',
    },
    // Delete a tenant or project
    deletePermissionScope: {
        action: 'DeletePermissionScope',
        method: 'get',
    },

    // original env.js
    getAllEnvs: {
        action: 'DescribeAllFundamentalEnvInfo',
        Offset: 0,
        Limit: 1000,
        version: '2019-01-03',
    },
    // Deployment environment
    createDeployEnv: {
        action: 'CreateDeploymentEnvInfo',
        method: 'post',
        version: '2019-01-03',
    },
    updateDeployEnv: {
        action: 'UpdateDeploymentEnvInfo',
        method: 'post',
        version: '2019-01-03',
    },
    deleteDeployEnv: {
        action: 'DeleteDeploymentEnvInfo',
        version: '2019-01-03',
    },
    getDeployEnvs: {
        action: 'DescribeAllDeploymentEnvInfo',
        version: '2019-01-03',
    },
    getAllDeployEnvs: {
        action: 'DescribeAllDeploymentEnvInfo',
        Offset: 0,
        Limit: 1000,
        version: '2019-01-03',
    },
    getDeployEnvByID: {
        action: 'DescribeDeploymentEnvAddrByEnvId',
        version: '2019-01-03',
    },
    //Query whether the user enters the module for the first time
    checkVisit: {
        action: 'GetUserAccessStatus',
        version: '2019-07-11',
    },
    //Update user to enter module status
    updateVisitStatus: {
        action: 'UpdateUserAccessStatus',
        version: '2019-07-11'
    },
};

Object.keys(apis).forEach((key) => {
    if (!apis[key].method)
        apis[key].method = 'get';
    Object.assign(apis[key], {
        path,
    });
    !apis[key].version && Object.assign(apis[key], {
        version,
    });
});

const service = new Service(apis, prefix);

export default service;
