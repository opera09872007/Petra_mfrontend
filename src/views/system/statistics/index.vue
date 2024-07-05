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
        handleSearchInfoFn(info) {
          if (info.workflow_type_id) {
            let workflow_type_id = info.workflow_type_id[1];
            info.workflow_type_id = workflow_type_id;
          }
          if (info.fieldTime) {
            info.startTime = info.fieldTime[0];
            info.endTime = info.fieldTime[1];
          }
          info.fieldTime = '';
          return info;
        },
      });

      return {
        registerTable,
      };
    },
  });
</script>
