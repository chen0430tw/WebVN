/**
 * The WebVN script controller <br>
 * Include lexer, javascript eval and a bunch of other things
 * for controlling the scripts.<br>
 * Note: the parser is generated by jison.
 * @namespace webvn.script
 */
webvn.module('script', ['config', 'parser', 'parserNode', 'util', 'loader', 'lexer', 'log'], function (config, parser, parserYy, util, loader, lexer, log) {
    "use strict";
    var exports = {};

    var conf = config.create('core-script');
    conf.set(config.script, false);

    lexer = lexer.lexer;

    // Parser
    parser = parser.parser;

    parser.lexer = {
        lex: function () {

            var tag, token;
            token = parser.tokens[this.pos++];

            if (token) {
                tag = token[0];
                this.yytext = token[1];
                this.yyloc = token[2];
                this.yylineno = this.yyloc.first_line;
            } else {
                tag = '';
            }

            return tag;

        },
        setInput: function (tokens) {

            parser.tokens = tokens;

            return this.pos = 0;

        }
    };

    parser.yy = parserYy;

    var parse = exports.parse = function (scenario) {

        var tokens = lexer(scenario);
        return parser.parse(tokens);

    };

    // Parse the source code and eval it
    var wvnEval = exports.eval = function (code) {

        jsEval(parse(code));

    };

    // JavaScript Eval.

    // Eval javaScript code with not return value.
    var jsEval = exports.jsEval = function (code) {

        _jsEval(code);

    };

    /* Eval javaScript code with return value.
     * Only simple expressions are allowed to pass in.
     */
    exports.jsEvalVal = function (code) {

        return _jsEval(code, true);

    };

    var emptyStr = '';

    function _jsEval(code, returnOrNot) {
        "use strict";

        if (util.trim(code) === '') {
            return emptyStr;
        }

        var scope = {};

        var functionName = util.guid('eval');

        code = 'scope["' + functionName + '"]=function(){' +
        (returnOrNot ? 'return (' : '') +
        code +
        (returnOrNot ? ');' : '') +'}';

        try {
            eval(code);
        } catch (e) {
            log.error(e.message);
            return emptyStr;
        }

        return scope[functionName]();

    }

    // Script controller

    /* Contains the result of source file eval:
     * [ ['command', 'dialog -d'], ['if', function () { if... }]... ]
     */
    var sources = [];

    // Middle scripts, temporary usage
    var middles = [];

    /* Final command waiting for executing
     */
    var executions = [];

    var isSource = true;

    //noinspection JSUnusedLocalSymbols
    var $$ = exports.$$ = function (type, value) {
        var source = util.makeArray(arguments);

        /* When executing,
         * command defined inside a if statement
         * should be loaded into middles.
         */
        if (isSource) {
            sources.push(source);
        } else {
            middles.push(source);
        }
    };

    // Load scenarios and begin executing them
    exports.load = function (scenarios) {

        scenarios = scenarios || conf.get('scenarios');

        var prefix = conf.get('prefix'),
            fileType = conf.get('fileType');

        if (!util.isArray(scenarios)) {
            scenarios = [scenarios];
        }

        scenarios = scenarios.map(function (val) {

            return prefix + val + '.' + fileType;

        });

        loader.scenario(scenarios, function (data, isLast) {

            loadText(data, isLast);

        });

    };

    /**
     * @function webvn.script.loadText
     * @param {string} str
     * @param {boolean=} startGame
     */
    var loadText = exports.loadText = function (str, startGame) {
        wvnEval(str);
        if (startGame) {
            start();
        }
    };

    // Execute command or code
    var exec = exports.exec = function (unit) {

        switch (unit[0]) {
            case 'command':
                execCommand(unit);
                break;
            case 'code':
                execCode(unit);
                break;
            default:
                log.warn("Unknown command type");
                break;
        }

    };

    function execCommand(command) {
        var lineNum = command[2],
            commandText = cmdBeautify(command[1]);
        command = exports.parseCommand(commandText);
        var name = command.name,
            options = command.options;
        var cmd = exports.getCommand(name);
        if (!cmd) {
            log.warn('Command ' + name + ' doesn\'t exist');
            return;
        }
        log.info('Command: ' + commandText + ' ' + lineNum);
        cmd.exec(options);
    }

    function cmdBeautify(str) {
        "use strict";
        return str.split('\n').
            map(function (value) {
                return util.trim(value);
            }).join(' ');
    }

    function execCode(code) {
        var lineNum = code[2];
        log.info('Code: ' + code[1] + ' ' + lineNum);
        jsEval(code[1]);
    }

    /* Indicate which line is being executed now,
     * related to sources array.
     */
    var curNum = 0;

    // Start executing the scripts from beginning.
    var start = exports.start = function () {

        reset();
        play();

    };

    // Reset everything to initial state
    var reset = exports.reset = function () {

        isPaused = false;
        curNum = 0;
        middles = [];
        executions = [];

    };

    // Whether
    var isPaused = false;

    // Similar to play, except the isPaused will be changed to true.
    //noinspection JSUnusedLocalSymbols
    var resume = exports.resume = function () {

        isPaused = false;
        play();

    };

    /* Play the next command,
     * if isPaused is true, then it's not going to work.
     */
    var play = exports.play = function () {
        if (isPaused) {
            return;
        }
        var execution = loadExecutions();
        if (execution) {
            exec(execution);
        }
    };

    // Load executions script
    function loadExecutions() {

        var source;

        while (true) {
            if (!_loadExecutions()) {
                return;
            }
            source = executions.shift();
            if (source[0] !== 'if') {
                break;
            }
            isSource = false;
            source[1]();
            isSource = true;
            executions = middles.concat(executions);
            middles = [];
        }

        return source;

    }

    function _loadExecutions() {

        if (executions.length === 0) {
            if (curNum >= sources.length) {
                log.warn('End of scripts');
                isPaused = true;
                return false;
            }
            executions.push(sources[curNum]);
            curNum++;
        }

        return true;

    }

    //noinspection JSUnusedLocalSymbols
    var pause = exports.pause = function (duration) {

        isPaused = true;

        if (duration) {
            setTimeout(function () {

                isPaused = false;

            }, duration);
        }

    };

    return exports;
});