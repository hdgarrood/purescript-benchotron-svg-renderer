# purescript-benchotron-svg-renderer

An SVG renderer for the output of [purescript-benchotron][]. See it in action:
<http://harry.garrood.me/purescript-benchotron-svg-renderer>.

## Rendering in the browser

Simply load `index.html` in a browser and follow the instructions on the page.

## Rendering from the command line

To generate a graph without a browser,
* `npm install` to install dependencies,
* `node main.js [input JSON path] [output SVG path]`

If you need a PNG rather than an SVG, [cairosvg][] can help.

[purescript-benchotron]: https://github.com/hdgarrood/purescript-benchotron
[cairosvg]: http://cairosvg.org/
