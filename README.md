# p5-t1-egg-0-alu0100969535 <!-- omit in toc -->


# EGG Language

## Tokens
```js
WHITES            = /\S/;
COMMENTS          = /^#.*(\n|\r)?/;
LEFT_PARENTHESIS  = /^[(]/;
RIGHT_PARENTHESIS = /^[)]/;
COMMA_PARENTHESIS = /^,/;
STRING            = /^"([^"]*)"/;
NUMBER            = /^\d+\b/;
WORD              = /^[^\s(),#"]+/;
```

## Syntax
```js
expression: STRING 
          | NUMBER 
          | WORD apply 

apply: /* vacio */
     | '(' (expression ',')* expression? ')' apply
```

# How to use

## install npm packages

First install npm packages:

```console
$ npm install
```

## Executables

Then you can use bin/\*.js executables to run examples/\*.egg files, or any other file you create with EGG syntax.

Also you can use -h for help in any of these executables.

### Running an EGG program

```console
$ node bin/egg.js examples/one.egg

50
```

### Parsing an EGG program

```console
$ node bin/eggc.js examples/one.egg

Output in file 'examples/one.egg.evm'
```
examples/one.egg.evm:
```json
{
  "type": "apply",
  "operator": {
    "type": "word",
    "name": "do"
  },
  "args": [
    {
      "type": "apply",
      "operator": {
        "type": "word",
        "name": "define"
      },
      "args": [
        {
          "type": "word",
          "name": "x"
        },
        {
          "type": "value",
          "value": 4
        }
      ]
    },
    . . .
```

### Running an EGG program via AST (json)

```console
$ node bin/evm.js examples/one.egg.evm

50
```