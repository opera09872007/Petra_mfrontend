<template>
  <div>
    <BasicTable @register="registerTable" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';

  import { BasicTable, useTable } from '/@/components/Table';
  import { getStatisticsListByPage } from '/@/api/system/statistics';
  import { columns, searchFormSchema } from './role.data';

  export default defineComponent({
    name: 'StatisticsManagement',
    components: { BasicTable },
    setup() {
      const [registerTable] = useTable({
        title: '统计列表',
        api: getStatisticsListByPage,
        columns,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
      });

      return {
        registerTable,
      };
    },
  });
</script>
