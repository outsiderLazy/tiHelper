#!/usr/bin/env node
// var program = require('commander');
var callProcess = require('child_process');

var co = require('co');
var prompt = require('co-prompt');
var colors = require('colors');

var execFileSync = callProcess.execFileSync;
var spawn = callProcess.spawn;


var fse = require('fs-extra');
var path = require('path');

var ACTION_CREATE = 0;
var ACTION_BUILD = 1;

var moduleName = 'tihelper';
var isWin32 = process.platform === 'win32';

var conf = null;
var appModulesPath = '',
    modulePath = '',
    appPath = '',
    sampleApp = '',
    sampleModule = '';

//使用于OSX系统，系统环境必须能够全局运行以下字符串中的命令 
var unzipcmd = 'unzip';
var ticmd = 'ti';
var antcmd = 'ant';

var initWorkplace = process.cwd();
var isFound = false;
var tiArgv = [];

if (isWin32) {
    unzipcmd = path.resolve(initWorkplace, 'bin','unzip.exe');
    ticmd = 'ti.cmd';
    antcmd='ant.bat';
}

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  tip:'blue'
});

var execTi = function(pmsg, pcallback) {
    if (tiArgv)
        var ti = spawn(ticmd, tiArgv);
    else
        throw new Error(colors.error('the param of Ti does not exist'));
    console.log(colors.info('tiArgv=' + tiArgv));
    ti.stdout.on('data', (data) => {
        console.log(colors.data('stdout: '+ data));
    });

    ti.stderr.on('data', (data) => {
        console.log(colors.data('stderr: '+data));
    });

    ti.on('close', (code) => {
        if (code == 0) {
            if (pmsg)
                console.log(pmsg);
            if (pcallback)
                pcallback(code);
        } else
            console.log(colors.error('child process exit code is '+code));
    });
}

var unzipModule = function() {
    //解压module
    if (fse.existsSync(appModulesPath = path.join(appPath, 'modules')))
        fse.removeSync(appModulesPath);
    console.log(colors.info('unzip the module files....'));
    var arr = fse.readdirSync(path.join(modulePath, 'dist'));
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].indexOf('zip') >= 0)
            execFileSync(unzipcmd, [path.join(modulePath, 'dist', arr[i]), '-d', appPath]);
    }
    console.log(colors.info('unzip module fiels success!'));
}

var buildModule = function() {
    process.chdir(modulePath);
    //将module打包成压缩文件
    execFileSync(antcmd, ['clean']);
    execFileSync(ticmd, ['build', '-p', 'android', '--build-only']);
    // execFileSync(antcmd);
    process.chdir(initWorkplace);
}

var initBuildEnv = function() {
    var _configPath = path.resolve(initWorkplace, 'conf.json');
    if (!fse.existsSync(_configPath))
        throw new Error(colors.error('\"' + _configPath + '\"could not be found'));

    conf = require(_configPath);
    modulePath = conf.TiModulePath;
    appPath = conf.TiAppPath;
    if (!modulePath || !appPath)
        throw new Error(colors.error('the content in \"' + _configPath + '\" must be something wrong'));
}

var handleBuildParam = function(pStartIndex) {
   for (var i = pStartIndex; i < process.argv.length; i++) 
      tiArgv.push(process.argv[i]);
}

var contactAppAndModule = function(pbaseDir) {
    var _confJson = {
        TiModulePath: path.resolve(pbaseDir, sampleModule, 'android'),
        TiAppPath: path.resolve(pbaseDir, sampleApp)
    };
    var _configPath = path.resolve(pbaseDir, 'conf.json');
    fse.ensureFileSync(_configPath);
    fse.writeJsonSync(_configPath, _confJson);
}

var handleCreateAction = function() {
    co(function*() {
        var _str = isWin32 ? '(all|android|mobileweb|windows) ['+colors.tip('all')+']:' : '(all|android|mobileweb|iphone|ipad) ['+colors.tip('all')+']:'
        var _platform = yield prompt(colors.info('A sample app and a sample moudle will be created in the same time\n') +
            colors.info('\nTarget platform ') +colors.info( _str + ' '));
        if (!_platform)
            _platform = 'all';

        var _projectName = '',
            _appId = '',
            _url = null,
            _dir = '.',
            _isPrompt = false,
            _promtMsg = '';

        while (!_projectName) { //project name should not be null
            _promtMsg =colors.info('\nProject name:');
            if (_isPrompt)
                _promtMsg =colors.error('[ERROR] Please specify a project name\n') + _promtMsg;
            else
                _isPrompt = true;
            _projectName = yield prompt(_promtMsg);
            sampleApp = _projectName + 'App';
            sampleModule = _projectName + 'Module';
        }

        _isPrompt = false;
        while (!_appId) { //App ID should not be null;
            _promtMsg =colors.info('\nApp ID: ');
            if (_isPrompt)
                _promtMsg =colors.error('[ERROR] Please specify an App ID'+'\n') + _promtMsg;
            else
                _isPrompt = true;
            _appId = yield prompt(_promtMsg);
        }

        var lurl = yield prompt(colors.info('\nYour company/personal URL: '));
        if (lurl)
            _url = lurl;
        var ldir = yield prompt(colors.info('\nDirectory to place project [.]: '));
        if (ldir)
            _dir = ldir;

        _dir = path.join(_dir, _projectName);
        fse.ensureDirSync(_dir);

        var _typeIndex = -1,
            _projectNameIndex = -1;
        var _createAppParam = ['-t', 'app', '-p', _platform, '-n', sampleApp, '--id', _appId, '-u', _url, '-d', _dir];

        for (var i = 0; i < _createAppParam.length; i++) { //构建创建APP相关的参数
            if (_createAppParam[i] == 'app')
                _typeIndex = tiArgv.length;
            else if (_createAppParam[i] == sampleApp)
                _projectNameIndex = tiArgv.length;
            tiArgv.push(_createAppParam[i]);
        };

        execTi('[tihelper]A sample app \"' + sampleApp + '\" has been created', function(pcode) { //
            if (pcode == 0) {
                tiArgv[_typeIndex] = 'module';
                tiArgv[_projectNameIndex] = sampleModule;
                execTi(colors.info('[tihelper]A sample module \"' + sampleModule + '\" has been created'), function() {
                    console.log(colors.info('the project ' + _projectName + ' build sucessful!'));
                    contactAppAndModule(_dir);
                    process.exit();
                });
            }
        });
        // console.log(_projectName + '--' + _appId + '--' + _url + '--' + _dir);
    });
}

var init = function() {
   /* program
        .version('0.0.1')
        .option('-w, --workplace [workplace]', 'the workplace,default is current')
        .parse(process.argv);

    if (program.workplace)
        initWorkplace = path.resolve(program.workplace);*/

    var _tiAction;
    var _tiActionIndex=2;//开发环境
    if (process.argv[0].indexOf(moduleName) > 0) 
        _tiActionIndex=1;//生产环境，适用于通过npm install 安装本模块的场景
    _tiAction = process.argv[_tiActionIndex];

    tiArgv.push(_tiAction);
    console.log('tiArgv=' + tiArgv);

    if (_tiAction != 'create' && _tiAction != 'build')
        throw new Error(colors.error('only support action \"create\" and \"build\"'));

    if (_tiAction == 'create') {
        handleCreateAction();
        return ACTION_CREATE;
    }

    handleBuildParam(_tiActionIndex+1);

    return ACTION_BUILD;
}

var run = function() {
    if (init() == ACTION_BUILD) { //ACTION_CREATE的逻辑在handleCreateAction中异步执行
        initBuildEnv();        
        buildModule();
        unzipModule();
        //将工作目录切换到
        process.chdir(appPath);
        execTi();
    }
}

run();
