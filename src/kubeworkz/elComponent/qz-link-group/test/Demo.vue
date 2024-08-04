<template>
  <section class="container">
    <div class="cell">
      <div class="title">
        max:3
      </div>
      <qz-link-group>
        <el-link>Default link</el-link>
        <el-link
          type="primary"
          @click="test"
        >
          Main link
        </el-link>
        <el-link
          type="success"
          @click="test"
        >
          Successful link
        </el-link>
        <el-link
          type="warning"
          @click="test"
        >
          Warning link
        </el-link>
      </qz-link-group>
    </div>
    <div class="cell">
      <div class="title">
        max:5
      </div>
      <qz-link-group max="5">
        <el-link>Default link</el-link>
        <el-link
          type="primary"
          @click="test"
        >
          Main link
        </el-link>
        <el-link
          type="success"
          @click="test"
        >
          Successful link
        </el-link>
        <el-link
          type="warning"
          @click="test"
        >
          Warning link
        </el-link>
        <el-link
          type="danger"
          @click="test"
        >
          Dangerous links
        </el-link>
        <el-link
          type="info"
          @click="test"
        >
          Information link
        </el-link>
      </qz-link-group>
    </div>
    <div class="cell">
      <div class="title">
        max:5
      </div>
      <qz-link-group
        max="5"
        is-button
        more-type="danger"
      >
        <el-button>Default link</el-button>
        <el-button
          type="primary"
          @click="test"
        >
          Main link
        </el-button>
        <el-button
          type="success"
          @click="test"
        >
          Successful link
        </el-button>
        <el-button
          type="warning"
          @click="test"
        >
          Warning link
        </el-button>
        <el-button
          type="danger"
          @click="test"
        >
          Dangerous links
        </el-button>
        <el-button
          type="info"
          @click="test"
        >
          Information link
        </el-button>
      </qz-link-group>
    </div>
  </section>
</template>
<script>
export default {
    methods: {
        test() {
            console.log('asbdashjd');
        },
    },
};
</script>
<style>
.cell {
    border: 1px solid #d6d6d6;
    margin: 20px 0;
    padding: 20px;
}
.title {
    margin-bottom: 10px;
    font-weight: bold;
}
</style>
