const YAML = require('yaml'),
    fs = require('fs'),
    Path = require('path'),
    csv=require('csvtojson'),
    {JSONPath} = require('jsonpath-plus'),
    {zip,has,pick} = require('lodash');



module.exports = function FlowControl ( configFile, options = { csv: { output: 'json', delimiter: ',', noheader: true, trim: true } } ) {

    const parameterPlugins = [
        function (parameter, Arguments) {
            if (has(parameter, 'jsonpath')) {
                Arguments.push(
                    JSONPath({...parameter.jsonpath, json: this.config.payloads})
                );
            }
        },
        function (parameter, Arguments) {
            if (has(parameter, 'eval')) {
                Arguments.push(
                    eval(parameter.eval.value)
                );
            }
        }
    ];
    const obj = {};
    obj.init = function init () {
        const self = this;
        return new Promise((resolve, reject) => {
            const {config, scenarios} = YAML.parse( fs.readFileSync(configFile, 'utf8') );
            self.config = config;
            self.scenarios = scenarios;
            if (has(self,'config.payloads') ) {
                const promises = [];
                const payloads = {};
                for (const {name, path, fields} of self.config.payloads) {
                    promises.push(
                        csv()
                            .fromFile(path)
                            .then(data => {
                                payloads[name] = (fields && Array.isArray(fields) && fields.length !== 0) ? data.map(d => pick(d, fields)) : data;
                            })
                    );
                }
                Promise
                    .all( promises )
                    .then( () => {
                        self.config.payloads = payloads;
                        resolve( self );
                    })
                    .catch(e => reject)
            }

        })
    };
    obj.init = obj.init.bind(obj);
    obj[Symbol.asyncIterator] = async function* asyncIterable() {
        const self = this;
        if ( has(self,'scenarios') ) {
            for (const {name, flow} of self.scenarios) {
                yield name;
                for (let i = 0; i < flow.length; i++) {
                    const flowElement = flow[i];
                    if ( has(flowElement,'exec') ) {
                        let {name,path,parameters,outbound} = flowElement.exec;
                        const Arguments = [];
                        // process all the arguments, applying all known parameter Plugins
                        for ( const parameter of parameters ) {
                            parameterPlugins.forEach(fn => {
                                fn.call(this, parameter, Arguments);
                            })
                        }
                        self.config.payloads[outbound] =
                                yield zip(...Arguments)
                                        .map(parameters => {
                                            return require(Path.join(this.config.baseDir, path))(...parameters)
                                        })
                    }
                    // yield flowElement
                }
            }
        }
    };
    obj[Symbol.asyncIterator] = obj[Symbol.asyncIterator].bind(obj);
    // obj.start = function start () {
    //     // this.scenarios.forEach(scenario=>{
    //     //     console.log('scenario=', JSON.stringify(scenario, null, 4));
    //     // });
    //     console.log('this=', JSON.stringify(this, null, 4));
    //     return this;
    // }
    // obj.start = obj.start.bind(obj);
    return obj;
};