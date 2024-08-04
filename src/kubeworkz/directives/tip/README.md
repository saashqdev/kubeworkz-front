-   General Use

```html
<div>Here is the content that needs to be displayed and the content displayed in the pop-up box.</div>
```

-   Need to add title, class, width, height, etc.

```html
<div v-tips="{ width:400, title:'Here is the test title', popperClass:'test1 test2', placement:'left' }">Here is the content that needs to be displayed and the content displayed in the pop-up box.</div>
```

```html
<div v-tips="'Here is the customized display content'">Here is the content that needs to be displayed and the content displayed in the pop-up box.</div>
```

-   v-tips You can not transfer data, otherwise the content of innerText will be displayed directly.
-   v-tips When transmitting data, if a string is passed directly, the content of the passed string will be displayed directly. If the passed string is an empty string, the display will be triggered.
-   v-tips When transferring data, if it is passed as an object, it only sets the visual effect of the popper. The parameters passed are consistent with the popover parameters of element-ui. [https://element.eleme.cn/#/en-US/component/popover](https://element.eleme.cn/#/en-US/component/popover)
-   The tip placement is displayed `above` by default, and the trigger condition is `hover` by default
