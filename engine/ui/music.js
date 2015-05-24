webvn.use(function (ui, select, media, config, storage, util, Class) {
    "use strict";
    var uiName = 'music',
        exports = ui.create(uiName),
        $el = exports.$el,
        lang = ui.lang.get(uiName),
        tpl = ui.template.get(uiName);

    var cfg = config.create('uiMusic'),
        cfgPath = cfg.get('path'),
        cfgExtension = cfg.get('extension');

    $el.addClass('fill').html(tpl({
        Music: lang.get('Music'),
        Close: lang.get('Close'),
        Play: lang.get('Play')
    }));

    var $progress = $el.find('.progress'),
        $progressFill = $progress.find('span'),
        $container = $el.find('.container'),
        $playBtn = $el.find('.play'),
        $nextBtn = $el.find('.next'),
        $preBtn = $el.find('.previous'),
        $all = $el.find('.container li');

    var controller = Class.module(function (exports) {
        var music = media.audio.create('music');
        music.asset = storage.createAsset(cfgPath, cfgExtension);
        music.loop = true;
        music.events({

            'timeupdate': function () {
                var percentage = music.curTime / music.duration;
                $progressFill.css('width', $progress.width() * percentage);
            }

        });

        $progress.on('click', function (e) {
            if (!music.isPlaying()) {
                return;
            }
            // OffsetX has to divided by scale
            e = e.originalEvent;
            var x = e.offsetX / ui.scale,
                percentage = x / $progress.width();
            music.curTime = music.duration * percentage;
        });

        var files = cfg.get('files'), html = '';
        util.each(files, function (file, index) {
            html += '<li class="num' + index + '" data-num="' + index + '">' + file + '</li>';
        });
        $container.html(html);

        var curNum = -1,
            total = files.length;

        var play = exports.play = function (num) {
            if (num === undefined) {
                if (!music.isLoaded()) {
                    return;
                }
                if (music.isPlaying()) {
                    $playBtn.text(lang.get('Play'));
                    music.pause();
                } else {
                    $playBtn.text(lang.get('Pause'));
                    music.play();
                }
            } else {
                $playBtn.removeClass('disabled').text(lang.get('Pause'));
                $nextBtn.removeClass('disabled');
                $preBtn.removeClass('disabled');
                $all.removeClass('playing');
                curNum = num;
                $el.find('.num' + num).addClass('playing');
                music.load(files[num]);
            }
        };

        exports.next = function () {
            if (curNum < 0) return;
            curNum++;
            if (curNum >= total) curNum = curNum - total;
            play(curNum);
        };

        exports.previous = function () {
            if (curNum < 0) return;
            curNum--;
            if (curNum < 0) curNum = total - 1;
            play(curNum);
        };

        exports.pause = function () {
            $playBtn.text(lang.get('Play'));
            music.pause();
        };
    });

    exports.stopPropagation().properties({
        fadeIn: cfg.get('fadeIn'),
        fadeOut: cfg.get('fadeOut'),
        duration: cfg.get('duration')
    }).events({

        'click .close': function () {
            controller.pause();
            var menu = ui.get('menu');
            menu.playBgm();
            hide();
        },

        'click .container li': function () {
            controller.play(this.data('num'));
        },

        'click .play': function () {
            controller.play();
        },

        'click .next': function () {
            controller.next();
        },

        'click .previous': function () {
            controller.previous();
        }

    });

    exports.show = function () {
        exports.fadeIn ? $el.fadeIn(exports.duration) : $el.show();
    };

    var hide = exports.hide = function () {
        exports.fadeOut ? $el.fadeOut(exports.duration) : $el.hide();
    };
});