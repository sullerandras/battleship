Battleship
==========

This is a basic implementation of the board game Battleship. The rules are more or less the same as in the [Hasbro](http://www.hasbro.com/common/instruct/Battleship.PDF) version.

Why
---

I wanted to use ReactJS, so this is a learning project. Do not use this code as an example of a well-written React application. This is my first project using React.

Demo
----

There are 3 implementations, the result and behavior are slightly different.

- plain old javascript + JSX: https://sullerandras.github.io/battleship/battleships.html
- coffeescript (no JSX): https://sullerandras.github.io/battleship/battleships-coffee.html
- ES6 + JSX: https://sullerandras.github.io/battleship/battleships-es6.html

The ES6 version is the most advanced, I recommend you to use that (will only work in ES6 compatible browser like Chrome). The JSX is compiled in the browser, so it also downloads the Babel compiler (it is in lib/browser.js), which is about 2 Mbyte.
