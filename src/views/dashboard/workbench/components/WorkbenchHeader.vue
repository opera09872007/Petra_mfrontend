<template>
  <div class="lg:flex">
    <Avatar :src="userinfo.image || headerImg" :size="72" class="!mx-auto !block" />
    <div class="md:ml-6 flex flex-col justify-center md:mt-0 mt-2">
      <h1 class="md:text-lg text-md">您好, {{ userinfo.name }}, 开始您的工作吧！</h1>
      <span class="text-secondary"> 今日晴，20℃ - 32℃！ </span>
    </div>
    <div class="flex flex-1 justify-end md:mt-0 mt-4">
      <div class="flex flex-col justify-center text-right">
        <span class="text-secondary"> 待办 </span>
        <span class="text-2xl">0/0</span>
      </div>

      <div class="flex flex-col justify-center text-right md:mx-16 mx-12">
        <span class="text-secondary"> 项目 </span>
        <span class="text-2xl">0</span>
      </div>
      <div class="flex flex-col justify-center text-right md:mr-10 mr-4">
        <span class="text-secondary"> 团队 </span>
        <span class="text-2xl">0</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { Avatar } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import headerImg from '/@/assets/images/header.jpg';
  import { useGlobSetting } from '/@/hooks/setting';

  const userStore = useUserStore();
  const { imgUrl = '' } = useGlobSetting();
  const userinfo = computed(() => {
    var { name, avatar, desc, image } = userStore.getUserInfo || {};
    if (image != undefined) {
      image = image.replace(/s3/, imgUrl);
    } else {
      image = headerImg;
    }
    return {
      name: name,
      avatar: avatar || headerImg,
      desc,
      image: image,
    };
  });
</script>
