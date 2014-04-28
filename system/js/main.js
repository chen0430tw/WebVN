// requireJs配置文件
require.config({
    baseUrl: 'system/js',
    paths: {
        'script': '../../script'
    }
});

// 程序主入口
define(['nav/nav', 'screen', 'game/logo', 'game/video', 'game/clickArea',
    'config', 'mainmenu/mainmenu'], function(nav, screen, logo, video, clickArea, config, mainmenu) {

// 显示OP
function showOp() {
    video
    .show()
    .loadAndPlay(config.OP)
    .setFinishCallback(function() {
        video.hide().setFinishCallback(function() {
            video.hide();
        });
        mainmenu.fadeIn();
    })
    .setClickHandler(function() {
        video.stop();
    });
}

// 显示Logo
if (logo.isActivated) {
    logo.fadeIn();
    setTimeout(function() {
        // 在指定时间后显示OP
        logo.fadeOut();
        if (config.OP_OR_NOT) {
            showOp();
        } else {
            mainmenu.fadeIn();
        }
    }, logo.duration);
} else if (config.OP_OR_NOT) {
    showOp();
} else {
    mainmenu.fadeIn();
}

});