<template>
  <div id="main-root">
    <!-- loading -->
    <div v-if="loading">loading</div>
    <!-- 子应用盒子 -->
    <div id="root-view" class="app-view-box" v-html="content"></div>
  </div>
</template>

<script>
export default {
  name: "App",
  props: {
    loading: Boolean,
    content: String
  }
};
</script>
