<template>
  <div>
    <qz-terminal
      ref="terminal"
      :show.sync="show"
      :height="400"
      :width="600"
      :option="{}"
      :beforeCloseCheck="beforeCloseCheck"
      @onOpenCallback="onOpenCallback"
      @onResizeCallback="onResizeCallback"
      @onInputCallback="onInputCallback"
      @onDestroyCallback="onDestroyCallback"
    />
    <el-button @click="handleOpen">open</el-button>
    <el-button @click="handleClose">close</el-button>
  </div>
</template>
<script>
export default {
    data() {
        return {
            show: false,
            term: null,
            commandHistory: [],
            currentCommand: '',
        };
    },
    methods: {
        handleOpen() {
            this.show = true;
        },
        handleClose() {
            this.show = false;
        },
        beforeCloseCheck(ok, cancle) {
            console.log('beforeCloseCheck');
            ok(); // Confirm close
            // cancle(); // Cancel close
        },
        onOpenCallback(term) {
            console.log('onOpenCallback');
            this.term = term;
            term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
        },
        onResizeCallback(info) {
            console.log('onResizeCallback');
            console.log(info);
        },
        onInputCallback(str) {
            const c = JSON.stringify(str);
            console.log('onInputCallback', c);
            switch (str) {
                case '\r':
                    console.log('carriage return');
                    this.term.write('\r\n');
                    break;
                case '\x7F':
                    console.log('delete');
                    this.term.write('\u0008 \u0008');
                    break;
                case '\u001b[D':
                    console.log('left arrow');
                    this.term.write('\u001b[D');
                    break;
                case '\u001b[C':
                    console.log('right arrow');
                    this.term.write('\u001b[C');
                    break;
                case '\u001b[A':
                    console.log('up arrow');
                    this.term.write('\u001b[A');
                    break;
                case '\u001b[B':
                    console.log('down arrow');
                    this.term.write('\u001b[B');
                    break;
                default:
                    this.currentCommand += str;
                    this.term.write(str);
            }
        },
        onDestroyCallback() {
            console.log('onDestroyCallback');
            this.term = null;
        },
    },
};
</script>
