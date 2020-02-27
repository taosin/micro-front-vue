<template>
  <div id="main-root">
    <el-container>
      <el-aside width="200px">
        <el-menu default-active="app1" class="el-menu-vertical-demo" :router="true">
          <el-menu-item index="/app1">
            <i class="el-icon-menu"></i>
            <span slot="title">子应用1</span>
          </el-menu-item>
          <el-menu-item index="/app2">
            <i class="el-icon-document"></i>
            <span slot="title">子应用2</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>Header</el-header>
        <el-main v-loading="loading">
          <!-- 子应用盒子 -->
          <div id="root-view" class="app-view-box" v-html="content"></div>
        </el-main>
      </el-container>
    </el-container>
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
<style>
#main-root {
  height: 100%;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
}

.el-aside {
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}

.el-container {
  height: 100%;
}
</style>