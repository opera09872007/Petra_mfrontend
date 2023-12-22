import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const system: AppRouteModule = {
  path: '/system',
  name: 'System',
  component: LAYOUT,
  redirect: '/system/account',
  meta: {
    orderNo: 2000,
    icon: 'ion:settings-outline',
    title: t('routes.comp.system.moduleName'),
  },
  children: [
    {
      path: 'account',
      name: 'AccountManagement',
      meta: {
        title: t('routes.comp.system.account'),
        ignoreKeepAlive: false,
      },
      component: () => import('/@/views/system/account/management/index.vue'),
    },
    {
      path: 'account_detail/:id',
      name: 'AccountDetail',
      meta: {
        hideMenu: true,
        title: t('routes.comp.system.account_detail'),
        ignoreKeepAlive: true,
        showMenu: false,
        currentActiveMenu: '/system/account',
      },
      component: () => import('/@/views/system/account/management/AccountDetail.vue'),
    },
    {
      path: 'role',
      name: 'RoleManagement',
      meta: {
        title: t('routes.comp.system.role'),
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/role/index.vue'),
    },

    {
      path: 'menu',
      name: 'MenuManagement',
      meta: {
        title: t('routes.comp.system.menu'),
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/menu/index.vue'),
    },
    {
      path: 'dept',
      name: 'DeptManagement',
      meta: {
        title: t('routes.comp.system.dept'),
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/dept/index.vue'),
    },
    {
      path: 'changePassword',
      name: 'ChangePassword',
      meta: {
        title: t('routes.comp.system.password'),
        ignoreKeepAlive: true,
      },
      component: () => import('/@/views/system/password/index.vue'),
    },
  ],
};

export default system;
