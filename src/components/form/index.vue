<template>
  <div ref="formContainerRef" class="flex w-full">
    <el-form
      ref="formRef"
      :class="{ isCol, costomFrom }"
      v-bind="$attrs"
      :model="formModel"
      :rules="rules"
      style="width: 100%; display: inline-block; overflow-x: hidden"
      inline
      @submit.prevent
    >
      <slot></slot>
      <template v-if="isCol">
        <el-row :gutter="20">
          <template v-for="(item, index) in formList">
            <div
              v-if="item.flex"
              :key="item.prop + index"
              v-show="handleShow(item)"
              style="padding: 0 10px"
              :style="{ flex: item.flex }"
              :class="'form-' + (item.prop || index)"
            >
              <el-form-item v-bind="item">
                <template #label v-if="item.renderLabel">
                  <Render :content="item.renderLabel()" />
                </template>
                <Render v-if="item.render" :content="item.render()" />
                <component
                  v-else
                  :is="item.component || components[item.type]"
                  v-bind="item.componentAttr"
                  :formItemAttr="item"
                  v-model="formModel[item.prop]"
                />
              </el-form-item>
            </div>
            <el-col
              v-else
              :key="index + item.prop"
              v-bind="item.colAttr || $attrs.colAttr"
              v-show="handleShow(item)"
            >
              <div :class="'form-' + item.prop">
                <el-form-item v-bind="item">
                  <template #label v-if="item.renderLabel">
                    <Render :content="item.renderLabel()" />
                  </template>
                  <Render v-if="item.render" :content="item.render()" />
                  <component
                    v-else
                    :is="item.component || components[item.type]"
                    v-bind="item.componentAttr"
                    :formItemAttr="item"
                    v-model="formModel[item.prop]"
                  />
                  <Render
                    v-if="item.afterRender"
                    :content="item.afterRender()"
                  />
                </el-form-item>
              </div>
            </el-col>
          </template>
        </el-row>
      </template>
      <template v-else>
        <el-form-item
          v-for="item in formList"
          :key="item.prop"
          v-bind="item"
          v-show="handleShow(item)"
          :class="'form-' + item.prop"
        >
          <template #label v-if="item.renderLabel">
            <Render :content="item.renderLabel()" />
          </template>
          <component
            :is="item.component || components[item.type]"
            v-bind="item.componentAttr"
            :formItemAttr="item"
            v-model="formModel[item.prop]"
          />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script setup>
import Input from "../elComponents/Input/index.vue";
import Select from "../elComponents/Select/index.vue";
import ButtonList from "../elComponents/ButtonList/index.vue";
import DatePicker from "../elComponents/DatePicker/index.vue";
import Render from "../elComponents/Render/index.vue";
import Switch from "../elComponents/Switch/index.vue";

defineOptions({
  name: "Form",
  inheritAttrs: false,
});
const formRef = ref();
const formContainerRef = ref();
const components = {
  Input,
  Select,
  ButtonList,
  DatePicker,
  Render,
  Switch,
};
const emit = defineEmits(["input"]);
const props = defineProps({
  formList: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => {} },
  isCol: { type: Boolean, default: () => true },
  searchForm: { type: Boolean, default: () => false },
  costomFrom: { type: Boolean, default: () => false },
});
const formModel = computed({
  get: () => props.modelValue,
  set: (newVal) => {
    emit("input", newVal);
  },
});
const rules = computed(() => {
  return props.formList.reduce((a, b) => {
    const obj = { ...a };
    if (b.rule) {
      obj[b.prop] = b.rule;
    }
    return obj;
  }, {});
});
const handleShow = (item) => {
  if (isRef(item.show)) {
    return item.show.value;
  } else {
    return typeof item.show === "undefined" || item.show;
  }
};
const validate = async (jump = true) => {
  return new Promise((resolve, reject) => {
    formRef.value.validate((valid, fields) => {
      if (valid) {
        resolve();
      } else {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              entry.target.scrollIntoView({ behavior: "smooth" });
            }
            observer.disconnect();
          });
        });

        for (let row of props.formList) {
          if (Object.keys(fields).includes(row.prop)) {
            const id = "form-" + row.prop;
            const anchor = formContainerRef.value.querySelector("." + id);
            if (anchor) {
              if (jump) {
                observer.observe(anchor);
              }
              return reject(fields);
            }
          }
        }
      }
    });
  });
};
defineExpose({ validate, formRef, formContainerRef });
</script>
<style lang="scss" scoped>
.isCol ::v-deep .el-form-item {
  width: 100%;
}
.searchForm {
  ::v-deep {
    .el-form-item {
      display: inline-block;
      .el-form-item__label-wrap {
        margin-left: 0 !important;
        color: #606266;
        font-weight: 700 !important;
      }
    }
  }
}
::v-deep(.el-form-item.form-date .el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-tip {
  color: red;
  font-size: 13px;
  white-space: nowrap;
  margin-left: 5px;
}
::v-deep .costomFrom {
  .el-form-item {
    flex-direction: column;
  }
  .el-form-item__label {
    color: #606266;
    font-weight: 700 !important;
    justify-content: flex-start;
  }
}
::v-deep(.costomFrom .el-form-item) {
  flex-direction: column;
}
</style>
