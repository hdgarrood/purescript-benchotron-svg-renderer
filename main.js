var fs                 = require("fs"),
    jsdom              = require("jsdom"),
    xmlserializer      = require("xmlserializer"),
    canvas             = require("canvas"),
    FileAPI            = require("file-api")

// Command line arguments
var inputPath = process.argv[2]
var outputPath = process.argv[3]

if (!inputPath)  throw new Error("Input path not provided")
if (!outputPath) throw new Error("Output path not provided")

// Load index.html in jsdom
var dom = new jsdom.JSDOM(fs.readFileSync("index.html"), {
  runScripts: "dangerously",
  resources: "usable",
  beforeParse: function(window) {
    // Drop-in replacements for browser functionality
    window.XMLSerializer = function () {
      return xmlserializer
    }
    window.FileReader = FileAPI.FileReader
  }
})
var window = dom.window

window.onload = function() {
  // Load the benchmark JSON by simulating a file upload
  window.handleFileSelect({
    target: {
      files: [
        new FileAPI.File(inputPath)
      ]
    }
  })

  // Poll for rendered results and then write them to the output path
  var checkGraph = function() {
    try {
      currentSvgString = window.getCurrentSvgString()
      fs.writeFileSync(outputPath, currentSvgString)
    } catch (e) {
      setTimeout(checkGraph, 10)
    }
  }
  checkGraph()
}
