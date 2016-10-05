## Proposal for json description of a relational schema

### Key Types
* primary_key
* secondary_key
* composite_key
* int/text/

### Field modifiers
* type
* key
* required
* unique
* nullable
* references

EX:
```
{
  table: {
    fields: {
      id: {
        type: int,
        key: primary_key,
        required: true,
        unique: true,
        nullable: false // probably assumed for primary_key
      },
      parentId: {
        type: int,
        key: foreign_key,
        references: {
          table: table,
          on: id
        }
      },
      name: text
    }
  }
}
```
