const COMPIL_TARGET_DIR = __dirname + '/target';
var fs = require('fs');

var dependencies = [];

function include(name, dependency, callback) {
    dependencies.push({'name': name, 'dependency': dependency, 'callback': callback});
    return this;
}

function modularize(fileName) {

    var src = parse(fileName);

    eval(src.fileContent);

    for (var index in src.functionNames) {
        var functionName = src.functionNames[index];
        exports[functionName] = eval(functionName);
    }
    return this;
}

function compile(fileName) {
    var source_path = getSourceUrl(fileName);
    var src = parse(source_path);
    var functionNames = src.functionNames;
    var compiledFileContent = "var fs = require('fs');\n"
    compiledFileContent += "var vm = require('vm');\n"
    compiledFileContent += "var data = fs.readFileSync(\'" + source_path + "\');\n"
    compiledFileContent += "context = {}\n"
    compiledFileContent += "vm.runInNewContext(data, context, '" + source_path + "')\n";;

    for (var index in functionNames) {
        var functionName = functionNames[index];
        compiledFileContent += '\nexports.' + functionName + ' = ' + functionName + ';'
    }
    if (!fs.existsSync(COMPIL_TARGET_DIR)) {
        fs.mkdirSync(COMPIL_TARGET_DIR);
    }
    var compiledFilePath = COMPIL_TARGET_DIR + '/' + removeDirFromPath(src);
    fs.writeFileSync(compiledFilePath, compiledFileContent);
    return require(compiledFilePath);
}

function dependsOnStatic(className, staticMethodName) {
    if (!global[className]) {
        global[className] = {};
    }
    var theClass = global[className];
    var allStaticMethodNames = staticMethodName.constructor === Array ? staticMethodName : [staticMethodName];

    allStaticMethodNames.forEach(function (methodName) {
        appendClassWithMethod(theClass, methodName);

    });
    return this;
}

function declareDependencies() {
    var declareDependencies = '';
    for (var depIndex in dependencies) {
        var oneDependency = dependencies[depIndex];
        declareDependencies += 'var ' + oneDependency.name +
            " = require('" + oneDependency.dependency + "'," + oneDependency.callback + ');\n';
    }
    return declareDependencies;
}

function extractFunctionNames(fileContent) {
    var rawFunctionNames = fileContent.match(/function (.*?)\(/g);
    var functionNames = [];
    for (var functionIndex in rawFunctionNames) {
        var functionName = rawFunctionNames[functionIndex].replace('function ', '').replace('(', '').trim();
        if (functionName) {
            functionNames.push(functionName);
        }
    }
    return functionNames;
}

function parse(fileName) {
    var sourceFile = fs.readFileSync(fileName);
    var fileContent = declareDependencies() + sourceFile.toString();
    var functionNames = extractFunctionNames(fileContent);
    return {fileName: fileName, fileContent: fileContent, functionNames: functionNames};
}

function getSourceUrl(fileName) {
    var rootDir = __dirname + '/../../';
    fileName += fileName.endsWith('.js') ? '' : '.js';
    return fs.realpathSync(rootDir + fileName)
}

function removeDirFromPath(src) {
    return src.fileName.substring(src.fileName.lastIndexOf('/') + 1);
}

function appendClassWithMethod(classObject, staticMethodName) {
    classObject[staticMethodName] = function () {
        throw staticMethodName + ' is not implemented. It is declared for static dependency stubbing only!'
    };
}

exports.modularize = modularize;
exports.include = include;
exports.compile = compile;
exports.dependsOnStatic = dependsOnStatic;
