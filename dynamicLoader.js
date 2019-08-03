const fs = require('fs'),
    path = require('path');

module.exports = function dynamicLoader (dir) {
    let parameters = [];
    if ( arguments.length > 1 ) {
        parameters = [...arguments];
        parameters.shift();
    }
    return new Promise(function(resolve, reject) {
        const aret = [];
        fs.readdirSync(dir).forEach(function (library) {
            const isLibrary = library.split(".").length > 0 && library.split(".")[1] === 'js',
                libName = library.split(".")[0];
            if (isLibrary) {
                aret[libName] = require(path.join(dir, library))(...parameters);
            }
        });
        return resolve(aret);
    })
};