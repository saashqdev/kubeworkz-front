# QZ-Terminal Terminal Component

Page terminal display component based on xterm.js

## Basic Usage
```vue
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
```

## Demo
::: demo
```vue
<<<include(./test/Demo.vue)
```
:::


## Attributes
| Parameters         | Description                                              | Type              | Optional values ​​| Default values ​​|
|--------------------|----------------------------------------------------------|-------------------|-----------------|----------------|
|   ref     |   Register citation information    |String |   -   |   -   |
|  show | Whether to display Terminal, support .sync modifier |Boolean   |   -   |   false   |
| height |   Terminal height   |Number |    -   | 400 |
| width | Terminal width |Number | - | 900 |
| options | xterm.js Configuration parameters |Object |  | {} |
| beforeCloseCheck | Confirm function before closing<br />function(ok, cancel) {} Parameters two callback functions<br />To confirm the shutdown, execute ok(), to cancel the shutdown, execute cancel().<br />Note: This is only triggered when the close button in the upper right corner of Terminal is clicked. |Function | - | - |
> For details on the options value, see [xtermjs documentation](https://xtermjs.org/docs/)

### Event Description

| Event name          | Illustrate               | Callback parameters                                                     |
| ----------------- | ------------------ | ------------------------------------------------------------ |
| onOpenCallback    | Callback after terminal is opened     | term instance,<br />Write a string to the terminal via term.write("string")<br />Write a string to the terminal through term.writeln("string") and wrap it in a new line |
| onResizeCallback  | Callback after terminal size changes | The current size of the terminal, {cols: 62, rows: 18}                          |
| onInputCallback   | Terminal input callback       | Enter characters                                                     |
| onDestroyCallback | Callback after the terminal is closed     | -                                                            |


<!-- #endregion snippet -->