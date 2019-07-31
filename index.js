const YAML = require('yaml'),
    fs = require('fs'),
    csv=require('csvtojson'),
    {has,pick} = require('lodash');

module.exports = function FlowControl ( configFile, options = { csv: { output: 'json', delimiter: '|', noheader: false, trim: true } } ) {
    const obj = {
        start: async function () {
            const file = fs.readFileSync(configFile, 'utf8')
            const {config,scenarios} = YAML.parse(file);
            obj.config = config;
            obj.scenarios = scenarios;
            if (has(this,'config.payloads') ) {
                const payloads = {};
                for (const {name, path, fields} of this.config.payloads) {
                    let data = await csv(options.csv).fromFile(path);
                    payloads[name]=data.map(d=>pick(d, fields));
                }
                obj.config.payloads = payloads;
            }
            return this;
        }
    };
    return obj;
};