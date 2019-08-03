# Flow Control

## Yaml Format 

```yaml
config:
  payloads:
    - name: "users"
      path: "data/customers.csv"
      fields:
        - "name"
        - "id"
scenarios:
```

### ``config``

The ``conifg`` stanza contains the following:
*  Optional ``payloads`` an array of type ``payload``

```yaml
config:
  payloads:
scenarios:
...
```

#### config.payloads

Payloads are CSV files, converted to JSON arrays, shared across all scenarios. 
For example, the file `data/customers.csv` is loaded, only the fields `name` and `id`. 
The resulting values are stored in an array called `users` this array is accessible in the scope of the `scenarios`.

| attribute | type     | required | purpose |
| :-------- | :------- | :------- | :------ |
| name      | string   | true     | The values ingested from the CSV are made available to the scenarios with this attribute in scope ( eg this.users ) |
| path      | string   | true     | This path should be a relative value to the csv. |
| fields    | string[] | false    | Case sensitive list of strings, identifying the columns to include as json attributes in the item of the array. |

```yaml
config:
  payloads:
    - name: "users"
      path: "data/customers.csv"
      fields:
        - "name"
        - "id"
scenarios:
...
```

### scenarios

https://github.com/dchester/jsonpath#readme