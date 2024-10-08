<template>
  <div
    :class="$style.root"
    :style="cssProps"
  >
    <!-- disabled is an attribute of u-popper. It will not add disabled data to the outermost tag. You need to change it. -->
    <u-popper
      :class="$style.account"
      :open.sync="open"
      trigger="hover"
      :z-dis="disabled"
      :disabled="disabled"
      append-to="reference"
      :follow-cursor="false"
      @before-toggle="onBeforeToggle"
    >
      <!-- Only template tags can be used here, and other similar divs cannot be used. -->
      <template v-if="list && list.length > 0 || $slots.popper">
        <div>
          <slot name="title">
            <div :class="$style.label">
              {{ label }}
            </div>
            <span
              :class="$style.value"
              :title="text"
            >{{ text }}</span>
          </slot>
          <i :class="$style.icon_down" />
        </div>
        <div
          slot="popper"
          :class="$style.popper"
          :style="popperStyle"
        >
          <template v-if="searchable">
            <u-input
              v-model="searchText"
              :class="$style.search"
              placeholder="Please enter keyword search"
              @keyup.enter="onSearchEntry"
            />
          </template>
          <ul>
            <slot name="popper">
              <li
                v-for="item in filterList"
                :key="item.text"
                :class="[$style.unit, 'f-toe']"
                :title="item.text"
                @click.stop="onSelect(item)"
              >
                {{ item.text }}
              </li>
            </slot>
          </ul>
        </div>
      </template>
      <template v-else>
        <div>
          <div :class="$style.label">
            {{ label }}
          </div>
          <span
            :class="$style.value"
            disabled
          >None {{ label }}</span>
          <i :class="$style.icon_down" />
        </div>
      </template>
    </u-popper>
  </div>
</template>

<script>
export default {
    name: 'UPopperSelect',
    props: {
        label: { type: String, default: 'Project' },
        list: { type: Array, default: () => ([]) },
        disabled: { type: Boolean, default: false },
        value: [ String, Number ], // Usually id
        popperStyle: { type: Object, default: () => { {} } },
        searchable: Boolean,
        from: { type: String, default: '' },
    },
    data() {
        return {
            open: false,
            searchText: '',
        };
    },
    computed: {
        text() {
            return ((this.list || []).find(item => item.value + '' === this.value + '') || {}).text;
        },
        filterList() {
            if (!this.searchable) {
                return this.list;
            }
            const searchText = this.searchText;
            if (!searchText) {
                return this.list;
            }
            const result = (this.list || []).filter(item => item.text.indexOf(searchText) > -1);
            return result;
        },
        cssProps() {
            return {
                '--color': this.from === 'ccb' ? '#0A1833' : '#142948',
            };
        },
    },
    methods: {
        onBeforeToggle() {
            if (!this.searchable) {
                return;
            }
            this.searchText = '';
        },
        onSearchEntry() {
            if (this.filterList.length === 1) {
                this.onSelect(this.filterList[0]);
            }
        },
        onSelect(event) {
            let cancel = false;
            this.$emit('before-select', {
                value: event && event.value,
                item: event,
                preventDefault: () => cancel = true,
            });
            if (cancel) { return; }

            this.open = false;
            this.$emit('update:value', event.value);
            this.$emit('select', event.value);
        },
    },
};
</script>

<style module>
.root {
    display: inline-block;
    width: 165px;
    vertical-align: top;
    font-size: 14px;
    color: #fff;
    position: relative;
}

.account{
    height: 62px;
    line-height: 62px;
    margin: 1px 0;
    padding-left: 14px;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 12px;
    text-align: left;
    width: 100%;
}

.account[z-dis]:hover {
    cursor: not-allowed;
    background: #273f63;
}

.account:hover {
    background: var(--color);
}

.label {
    display: inline-block;
    color: #9dabc2;
    vertical-align: -2px;
    font-size: 14px;
}
.popper {
    z-index: 1025;
    background-color: var(--color);
    width: 165px;
    max-height: 240px;
    overflow: auto;
}

.value {
    position: relative;
    padding:0 10px;
    display: inline-block;
    vertical-align: middle;
    line-height: 2;
    max-width: 96px;
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 14px;
}
.value[disabled] {
    cursor: not-allowed;
    color: #ccc;
}
.popper li{
    color: #9dabc2;
    cursor: pointer;
    font-size: 14px;
    height: 40px;
    line-height: 20px;
    padding: 10px 0 10px 24px;
    text-align: left;
}
.popper li:hover{
    color: #fff;
    background-color: #253752;
    cursor: pointer;
}
.icon_down {
    font-size: 12px;
    vertical-align: -4px;
    position: absolute;
    right: 12px;
}
.icon_down:before {
    icon-font: url('i-line-awesome.vue/assets/angle-down.svg');
}

.search[class] {
    position: relative;
    width: calc(100% - 10px);
    height: 28px;
    margin: 5px;
    line-height: 1;
    display: block;
    box-sizing: border-box;
}
</style>
