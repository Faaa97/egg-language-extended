# egg-language-extended <!-- omit in toc -->

- [EGG Language](#egg-language)
  - [Tokens](#tokens)
  - [Syntax](#syntax)
- [How to use](#how-to-use)
  - [install npm packages](#install-npm-packages)
  - [Running tests](#running-tests)
  - [Executables](#executables)
    - [Running Egg-REPL](#running-egg-repl)
    - [Running an EGG program](#running-an-egg-program)
    - [Parsing an EGG program](#parsing-an-egg-program)
    - [Running an EGG program via AST (json)](#running-an-egg-program-via-ast-json)

# EGG Language

## Tokens
```js
WHITES            = /\s/y;
COMMENTS          = /#.*(\n|\r)?/y;
LEFT_PARENTHESIS  = /[(]/y;
RIGHT_PARENTHESIS = /[)]/y;
COMMA             = /,/y;
STRING            = /"([^"]*)"/y;
NUMBER            = /\d+\b/y;
WORD              = /[^\s(),#"]+/y;
```

## Syntax
```js
expression: ( STRING 
          | NUMBER 
          | WORD ) apply 

apply: /* vacio */
     | '(' (expression ',')* expression? ')' apply
```

# How to use

## install npm packages

First install npm packages:

```console
$ npm install
```

## Running tests

You can run all tests available with following command:

```console
$ npm test
```

## Executables

Then you can use bin/\*.js executables to run examples/\*.egg files, or any other file you create with EGG syntax.

Also you can use -h for help in any of these executables.

### Running Egg-REPL
If you run `bin/egg.js` without any parameters, a REPL interface will launch up with the same capabilities as egg.js parser and interpreter.
```console
$ node bin/egg.js
> Version 0.5.0
> help()
help() muestra esta ayuda.
exit() sale del bucle REPL.
Ctrl-D sale del bucle REPL.
'-------------------------'
> 
```

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
