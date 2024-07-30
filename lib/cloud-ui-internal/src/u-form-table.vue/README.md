# Form

## Example
### Basic form

``` vue
<template>
<u-form>
    <u-form-item label="Associate VPC" layout="block">
        <u-form-table>
            <thead>
                <tr>
                    <th width="170px">Area</th>
                    <th width="170px">VPC</th>
                    <th width="200px">Association description</th>
                </tr>
            </thead>
            <tbody>
                <tr is="u-form-table-tr" v-for = "(item, index) in model.items" :key="index" :rules="rules.vpcRule" :disabled="model.items.length<=1" @remove="removeItem(index)">
                    <td>
                        <u-input v-model="item.name1" name="name1"></u-input>
                    </td>
                    <td>
                        <u-input v-model="item.name2" name="name2"></u-input>
                    </td>
                    <td>
                        <div>
                            <u-input v-model="item.name3" name="name3" size="huge full" maxlength-message="max 100 characters" maxlength="100" placeholder="max 100 characters"></u-input>
                        </div>
                    </td>
                </tr>
            </tbody>
        </u-form-table>
    </u-form-item>
</u-form>
</template>
<script>
export default {
    data() {
        return {
            isEdit: false,
            model: {
                items: [
                    {
                        name1: '',
                        name2: '',
                        name3: '',
                    },
                ],
            },
            rules: {
                vpcRule: {
                    name1: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name1 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name1 starts with a lowercase letter' },
                        { type: 'string', pattern: /^[a-z0-9-]*$/, trigger: 'input+blur', message: 'name1 consists of lowercase letters, numbers or underscores' },
                        { type: 'string', pattern: /[a-z0-9]$/, trigger: 'blur', message: 'name1 ends with a lowercase letter or number' },
                    ],
                    name2: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name2 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name2 starts with a lowercase letter' },
                    ],
                    name3: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name3 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name3 starts with a lowercase letter' },
                    ],
                },
            },
        };
    },
};
</script>
```

### Dynamically add data

``` vue
<template>
<u-form>
    <u-form-item label="Associate VPC" layout="block">
        <u-form-table :dynamic="true" :disabled="false" @add="addItem">
            <thead>
                <tr>
                    <th width="170px">Area</th>
                    <th width="170px">VPC</th>
                    <th width="200px">Association description</th>
                    <template v-if = "!isEdit">
                        <th width="40px"></th>
                    </template>
                </tr>
            </thead>
            <tbody>
                <tr is="u-form-table-tr" v-for = "(item, index) in model.items" :key="index" :rules="rules.vpcRule" :disabled="model.items.length<=1" @remove="removeItem(index)">
                    <td>
                        <u-input v-model="item.name1" name="name1"></u-input>
                    </td>
                    <td>
                        <u-input v-model="item.name2" name="name2"></u-input>
                    </td>
                    <td>
                        <div>
                            <u-input v-model="item.name3" name="name3" size="huge full" maxlength-message="max 100 characters" maxlength="100" placeholder="max 100 characters"></u-input>
                        </div>
                    </td>
                </tr>
            </tbody>
        </u-form-table>
    </u-form-item>
</u-form>
</template>
<script>
export default {
    data() {
        return {
            isEdit: false,
            model: {
                items: [],
            },
            rules: {
                vpcRule: {
                    name1: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name1 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name1 starts with a lowercase letter' },
                        { type: 'string', pattern: /^[a-z0-9-]*$/, trigger: 'input+blur', message: 'name1 consists of lowercase letters, numbers or underscores' },
                        { type: 'string', pattern: /[a-z0-9]$/, trigger: 'blur', message: 'name1 ends with a lowercase letter or number' },
                    ],
                    name2: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name2 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name2 starts with a lowercase letter' },
                    ],
                    name3: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name3 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name3 starts with a lowercase letter' },
                    ],
                },
            },
        };
    },
    methods: {
        addItem(event) {
            this.model.items.push({
                name1: '',
                name2: '',
                name3: '',
            });
        },
        removeItem(index) {
            this.model.items.splice(index, 1);
        },
    },
};
</script>
```

### Dynamically add data freezing

``` vue
<template>
<u-form>
    <u-form-item label="Associate VPC" layout="block">
        <u-form-table :dynamic="true" :disabled="true" @add="addItem">
            <thead>
                <tr>
                    <th width="170px">Area</th>
                    <th width="170px">VPC</th>
                    <th width="200px">Association description</th>
                    <th width="40px"></th>
                </tr>
            </thead>
            <tbody>
                <tr is="u-form-table-tr" v-for = "(item, index) in model.items" :key="index" :rules="rules.vpcRule" :disabled="model.items.length<=1" @remove="removeItem(index)">
                    <td>
                        <u-input v-model="item.name1" name="name1"></u-input>
                    </td>
                    <td>
                        <u-input v-model="item.name2" name="name2"></u-input>
                    </td>
                    <td>
                        <div>
                            <u-input v-model="item.name3" name="name3" size="huge full" maxlength-message="max 100 characters" maxlength="100" placeholder="max 100 characters"></u-input>
                        </div>
                    </td>
                </tr>
            </tbody>
        </u-form-table>
    </u-form-item>
</u-form>
</template>
<script>
export default {
    data() {
        return {
            isEdit: false,
            model: {
                items: [
                    {
                        name1: '',
                        name2: '',
                        name3: '',
                    },
                ],
            },
            rules: {
                vpcRule: {
                    name1: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name1 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name1 starts with a lowercase letter' },
                        { type: 'string', pattern: /^[a-z0-9-]*$/, trigger: 'input+blur', message: 'name1 consists of lowercase letters, numbers or underscores' },
                        { type: 'string', pattern: /[a-z0-9]$/, trigger: 'blur', message: 'name1 ends with a lowercase letter or number' },
                    ],
                    name2: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name2 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name2 starts with a lowercase letter' },
                    ],
                    name3: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name3 cannot be empty' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name3 starts with a lowercase letter' },
                    ],
                },
            },
        };
    },
    methods: {
        addItem(event) {
            this.model.items.push({
                name1: '',
                name2: '',
                name3: '',
            });
        },
        removeItem(index) {
            this.model.items.splice(index, 1);
        },
    },
};
</script>
```

## FormTable API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| dynamic | Boolean | `false` | Is there a function to dynamically add items? |
| disabled | Boolean | `false` | Whether to disable dynamic addition of buttons |


### Events

#### @add

Add button click


## FormTableTr API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| rules | Array | `[]` | input validation rules |
| disabled | Boolean | `false` | Whether to disable dynamic delete button |


### Events

#### @remove
Trigger removal event