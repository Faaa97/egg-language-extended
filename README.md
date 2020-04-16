# p5-t1-egg-0-alu0100969535 <!-- omit in toc -->


# EGG Language

## Tokens
```js
WHITES = /\S/;
STRING = /^"([^"]*)"/;
NUMBER = /^\d+\b/;
WORD   = /^[^\s(),#"]+/;
```

## Syntax
```js
expression: ( STRING | NUMBER | WORD ) apply 

apply: /* vacio */
     | '(' (expression ',')* expression? ')' apply
```
