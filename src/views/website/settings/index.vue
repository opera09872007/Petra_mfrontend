<template>
  <PageWrapper>
    <CollapseContainer title="网站设置">
      <BasicForm @register="register" @submit="handleSubmit" />
    </CollapseContainer>
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { CollapseContainer } from '/@/components/Container/index';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { PageWrapper } from '/@/components/Page';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formSchema } from './settings.data';

  import { getSiteSettingsList, siteSettingsEditApi } from '/@/api/website/settings';

  export default defineComponent({
    name: 'OrderModal',
    components: { BasicForm, CollapseContainer, PageWrapper },
    setup(_, {}) {
      const { createMessage } = useMessage();

      const [register, { setFieldsValue, validate }] = useForm({
        labelWidth: 120,
        schemas: formSchema,
        actionColOptions: {
          span: 24,
        },
        showResetButton: false,
        submitButtonOptions: {
          text: '保存',
        },
      });
      async function getSiteSettings() {
        const res = await getSiteSettingsList();
        var data = [];
        if (res) {
          var carousel_image = [] as string[];
          res.items.map((item) => {
            if (item.content_type == 'carousel_image') {
              carousel_image.push(item.content_value);
            }
            if (item.content_type == 'show_column') {
              if (item.content_key == 'news') {
                data.show_column_news = item.content_value;
              }
              if (item.content_key == 'recommend') {
                data.show_column_recommend = item.content_value;
              }
              if (item.content_key == 'roll_news') {
                data.show_column_roll_news = item.content_value;
              }
            }
            if (item.content_type == 'copyright' && item.content_key == 'footer_copyright') {
              data.copyright_footer_copyright = item.content_value;
            }
          });
          data.carousel_image = carousel_image;
          setFieldsValue({
            ...data,
          });
        }
      }
      getSiteSettings();

      async function handleSubmit() {
        try {
          const values = await validate();
          const result = await siteSettingsEditApi(values);
          if (result == 1) {
            createMessage.success('保存成功');
            getSiteSettings();
          }
        } catch (error) {
          console.log(error);
        } finally {
        }
      }
      return {
        register,
        handleSubmit,
      };
    },
  });
</script>
