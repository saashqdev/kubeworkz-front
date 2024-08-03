export default {
    // systemMgr: ['/permission/platformManage/tenant', '/permission/platformManage/audit', '/permission/platformManage/outerAuth'],
    // tenantMgr: ['/permission/tenantManage/project', '/permission/tenantManage/member'],
    // projectMgr: ['/permission/projectManage/projectP'],

    tenantMgr: ['/permission/tenantManage/**'],
    projectMgr: ['/permission/projectManage/**'],
    opsMgr: ['/permission/platformManage/**'],
    // userMgr: ['/permission/userManage/**', '!/permission/userManage/right/feature'], // ! Elimination method
    userMgr: ['/permission/userManage/**'],
    actionTrail: ['/permission/auditManage/**'],
};
