## Basic Usage

```html
<qz-link-group max="4">
    <el-link href="https://element.eleme.io" target="_blank">Default link</el-link>
    <el-link type="primary">Main link</el-link>
    <el-link type="success">Successful link</el-link>
    <el-link type="warning">Warning link</el-link>
    <el-link type="danger">Dangerous links</el-link>
    <el-link type="info">Information link</el-link>
</qz-link-group>
```

## Demo
::: demo
```html
<template>
    <section class="container">
        <div class="cell">
            <div class="title">max:3</div>
            <qz-link-group>
                <el-link :underline="false">Default link</el-link>
                <el-link :underline="false" type="primary">Main link</el-link>
                <el-link :underline="false" type="success">Successful link</el-link>
                <el-link :underline="false" type="warning">Warning link</el-link>
            </qz-link-group>
        </div>
        <div class="cell">
            <div class="title">max:5</div>
            <qz-link-group max="5">
                <el-link :underline="false">Default link</el-link>
                <el-link :underline="false" type="primary">Main link</el-link>
                <el-link :underline="false" type="success">Successful link</el-link>
                <el-link :underline="false" type="warning">Warning link</el-link>
                <el-link :underline="false" type="danger">Dangerous links</el-link>
                <el-link :underline="false" type="info">Information link</el-link>
            </qz-link-group>
        </div>
    </section>
</template>
<script>
export default {};
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

```
:::

## Component effect description

- When the number of links in the child element <= the value of max, the normal arrangement will be displayed.
- When the number of links in the child element > the value of max, max-1 will be displayed in normal arrangement, and the remaining drop-down boxes will be displayed.

</br>

## Attributes
| Parameters | Description | Type | Optional values ​​| Default values ​​|
|-----------|-------------------|-----------------|-------------|-----------|
|  max      |  Maximum number of links displayed  | String/Number   |      -      |     3     |
|  isButton |  Is it a button group? | Boolean         |     -       |   false   |
|  buttonSize |      Button size    | String          |  medium / small / mini  |   -   |
|  moreType |      More button types    | String          |  primary / default / info / danger / success  |   primary   |






<!-- #endregion change -->