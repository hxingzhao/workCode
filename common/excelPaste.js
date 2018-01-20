define(function (require, exports, module) {
    var excel$ = null;
    var downTarget = null; // 鼠标按下时选中的td.target
    var curTarget = null; // 当前移入的td
    var preTarget = null; // 上一个移入的td
    var row = null; // 起始行
    var cos = null; // 起始列
    var row_number = null; // 行差
    var cos_number = null; // 列差
    var copy_row_number = null; // 复制的行数
    var copy_cos_number = null; // 复制的列数
    var selectValue = []; // 选中的td
    var copyValue = []; // ctrl+c以后存放的td
    var excelCopyValue = []; // 复制excel表 格式化后的数组
    var left = null; // left定位
    var top = null; // top定位
    var leftDiv = null; // leftBorder
    var rightDiv = null; // rightBorder
    var topDiv = null; // topBorder
    var bottomDiv = null; // bottomBorder
    var textarea$ = null; // textarea对象
    var select$ = null; // select对象
    var border_width = 0; // 选中区域宽度
    var border_height = 0; // 选中区域高度
    var cur_ele_width = 0; // 当前元素宽
    var cur_ele_height = 0; // 当前元素高
    var textarea_td = null;

    /**
     *  鼠标按下事件
     * */
    function mouseDown() {
        excel$.find('td:not(.noOperate)').mousedown(function (event) {
            var flag = $(event.currentTarget).parents('tr').attr('flag');
            var tr$ = $('.excel[flag="' + flag + '"]');
            preTarget = null;
            border_width = 0;
            border_height = 0;
            selectValue = [];
            downTarget = event.currentTarget; // 初始td
            curTarget = event.currentTarget;
            left = downTarget.offsetLeft; // left 相对于table
            top = downTarget.offsetTop; // top相对于table
            cur_ele_height = $(downTarget).outerHeight(true);
            cur_ele_width = $(downTarget).outerWidth(true);
            selectValue.push($(downTarget).parent()[0]);
            // 获取当前input的标记
            row = $(event.currentTarget).attr('row') - 0;
            cos = $(event.currentTarget).attr('cos') - 0;
            $('.excel').find('td').css('background-color', '#fff');
            $(downTarget).css('background-color', '#EEF4FF');
            clearStyle();
            initBorder(); // 初始化边框
            // 移入事件
            tr$.find('td:not(.noOperate)').mouseenter(function (e) {
                selectValue = [];
                curTarget = e.currentTarget;
                var curRow = $(e.target).attr('row') - 0;
                var curCos = $(e.target).attr('cos') - 0;
                var maxRow = curRow > row ? curRow : row;
                var minRow = curRow < row ? curRow : row;
                var maxCos = curCos > cos ? curCos : cos;
                var minCos = curCos < cos ? curCos : cos;
                cos_number = maxCos - minCos + 1;
                row_number = maxRow - minRow + 1;
                // 获取flag属性值
                var trFlag = $(e.target).parents('tr').attr('flag');
                // 匹配tr
                var tds = $('.excel[flag="' + trFlag + '"]').find('td');
                // 获取选中的td，根据td的row、cos属性来判断这个td是否在选中区域
                tds.each(function (i, ele) {
                    var ele_row = $(ele).attr('row');
                    var ele_cos = $(ele).attr('cos');
                    if (minRow <= ele_row && ele_row <= maxRow && minCos <= ele_cos && ele_cos <= maxCos) {
                        $(ele).css('background-color', '#EEF4FF ');
                        selectValue.push($(ele)[0]);// 将匹配上的td添加到数组中
                    } else {
                        $(ele).css('background-color', '#fff ');
                    }
                });
                // 设置宽高
                setBorder();
            });
        });
        /**
         * 鼠标抬起
         */
        excel$.mouseup(function (event) {
            var flag = $(event.currentTarget).attr('flag');
            var tr$ = $('.excel[flag="' + flag + '"]');
            tr$.find('td').unbind('mouseenter');
        })
    }

    /**
     *  双击事件
     *  @param flag tr标签flag属性的值
     * */
    function dblClick() {
        excel$.find('td:not(.noEditor)').dblclick(function () {
            textarea_td = downTarget;
            if ($(this).attr('type') == 'select') {
                select$.css({
                    left: left + 1 + 'px',
                    top: top + 1 + $(textarea_td).outerHeight(true) + 'px',
                    display: 'block',
                    width: cur_ele_width - 2 + 'px',
                    height: '49px'
                });
                select$.find('li').each(function () {
                    if ($(this).text() == downTarget.innerText) {
                        $(this).addClass('active');
                        $(this).siblings('li').removeClass('active');
                    }
                });

            } else {
                textarea$.css({
                    left: left + 'px',
                    top: top + 'px',
                    display: 'block',
                    width: cur_ele_width + 1 + 'px',
                    height: cur_ele_height + 1 + 'px',
                    lineHeight: cur_ele_height - 3 + 'px'
                });
                textarea$.val(downTarget.innerText);
                textarea$.focus();
            }
        });
        textarea$.blur(function () {
            if ($(textarea_td).attr('title') != textarea$.val()) {
                if ($(textarea_td).find('span').length) {
                    $(textarea_td).find('span').text(textarea$.val());
                } else {
                    $(textarea_td).text(textarea$.val());
                }
                $(textarea_td).attr('title', textarea$.val());
                $(textarea_td).parents('tr').addClass('editor');
                if (!$(textarea_td).parents('tr').attr('addTr')) {
                    $('.batch_update').removeAttrs('disabled');
                }
            }
            textarea$.css({
                display: 'none',
                bottom: 0,
                width: 0,
                height: 0
            });
        });
        select$.on('click', 'li', function () {
            $(textarea_td).text($(this).text());
            if (!$(textarea_td).parents('tr').attr('addTr')) {
                $('.batch_update').removeAttrs('disabled');
            }
            select$.css({
                display: 'none',
                bottom: 0,
                width: 0,
                height: 0
            });
        })
    }

    /**
     * 将格式化后的数据赋值给input
     */
    function formatting() {
        if (row_number > copy_row_number) {
            // 删除多余行
            selectValue.splice(copy_row_number * cos_number);
        }
        var max = Math.abs(cos_number - copy_cos_number);
        if (cos_number > copy_cos_number) {
            for (var i = 0; i < copy_row_number; i++) {
                selectValue.splice(copy_cos_number * (i + 1), max)
            }
        } else {
            for (var i = 0; i < copy_row_number; i++) {
                excelCopyValue.splice(cos_number * (i + 1), max)
            }
        }
        $('.excel').find('td').css('background-color', '#fff');
        $(selectValue).css('background-color', '#EEF4FF ');
        setBorder();
        debugger;
        $(selectValue).each(function (i, ele) {
            debugger;
            if (!$(ele).hasClass('noEditor')) {
                if (!$(this).parents('tr').hasClass('add_tr')) {
                    $('.batch_update').removeAttrs('disabled');
                }
                $(this).parents('tr').addClass('editor');
                if ($(ele).find('span').length) {
                    $(ele).find('span').text(excelCopyValue[i]);
                } else {
                    $(ele).text(excelCopyValue[i]);
                }
            }
        });
    }

    /**
     *  键盘复制粘贴事件
     */

    function copyAndPaste() {
        $(document).bind({
            copy: function (e) {//copy事件
                console.log('copy');
                copyValue = selectValue;
                copy_cos_number = cos_number;
                copy_row_number = row_number;
                $('td').removeClass('e_border');
                $(selectValue).addClass('e_border');
                var cpTxt = selectValue ? selectValue : '';
                var clipboardData = window.clipboardData; //for IE
                if (!clipboardData) { // for chrome
                    clipboardData = e.originalEvent.clipboardData;
                }
                // e.clipboardData.getData('text');//可以获取用户选中复制的数据
                clipboardData.setData('Text', cpTxt);
                return false;//否则设不生效
            }, paste: function (e) {//paste事件
                $('#save_value').focus();
                var eve = e.originalEvent;
                var data = null;
                var excelRow = [];
                var excelCos = [];
                excelCopyValue = [];
                var clipboardData = window.clipboardData; // IE
                if (!clipboardData) { //chrome
                    clipboardData = e.originalEvent.clipboardData
                }
                data = clipboardData.getData('Text');
                if (data.indexOf('\r') != -1) {
                    excelRow = data.split('\r\n');
                    copy_row_number = excelRow.length - 1;
                    for (var i = 0; i < excelRow.length - 1; i++) {
                        var a = excelRow[i].split('	');
                        if (i == 0) {
                            copy_cos_number = a.length;
                        }
                        excelCopyValue = excelCopyValue.concat(a);
                    }
                } else {
                    var ff = data.split('\n');
                    copy_row_number = ff.length - 1;
                    for (var i = 0, len = ff.length; i < len; i++) {
                        var f = ff[i].split('\t');
                        if (i == 0) {
                            copy_cos_number = f.length;
                        }
                        excelCopyValue = excelCopyValue.concat(f);
                    }
                }
                console.log(excelCopyValue);
                formatting();
            }
        });

    }

    /**
     *  设置宽高方法
     * */
    function setBorder() {

        var start_left = selectValue[0].offsetLeft;
        var start_top = selectValue[0].offsetTop;
        var end_left = selectValue[selectValue.length - 1].offsetLeft;
        var end_top = selectValue[selectValue.length - 1].offsetTop;
        cur_ele_width = $(selectValue[selectValue.length - 1]).outerWidth(true);
        cur_ele_height = $(selectValue[selectValue.length - 1]).outerHeight(true);
        /*   console.log('start_left : ' + start_left);
           console.log('start_top : ' + start_top);
           console.log('end_left : ' + end_left);
           console.log('end_top : ' + end_top);
           console.log('cur_ele_width : ' + cur_ele_width);
           console.log('cur_ele_height : ' + cur_ele_height);
           console.log('------------------------------');*/
        border_width = end_left - start_left + cur_ele_width;
        border_height = end_top - start_top + cur_ele_height;
        /* console.log(border_width);
         console.log(border_height);*/
        //设置边框
        leftDiv.css({
            height: border_height + 'px',
            width: '1px',
            left: start_left + 'px',
            top: start_top + 'px',
            display: 'block'
        });
        rightDiv.css({
            height: border_height + 'px',
            width: '1px',
            left: end_left + cur_ele_width + 'px',
            top: start_top + 'px',
            display: 'block'
        });
        topDiv.css({
            height: '1px',
            width: border_width + 'px',
            left: start_left + 'px',
            top: start_top + 'px',
            display: 'block'
        });
        bottomDiv.css({
            height: '1px',
            width: border_width + 'px',
            left: start_left + 'px',
            top: end_top + cur_ele_height + 'px',
            display: 'block'
        });
    }

    /**
     * 初始化边框
     * */
    function initBorder() {
        leftDiv.css({
            height: cur_ele_height + 'px',
            width: '1px',
            left: left + 'px',
            top: top + 'px',
            display: 'block'
        });
        rightDiv.css({
            height: cur_ele_height + 'px',
            width: '1px',
            left: left + cur_ele_width + 'px',
            top: top + 'px',
            display: 'block'
        });
        topDiv.css({
            height: '1px',
            width: cur_ele_width + 'px',
            left: left + 'px',
            top: top + 'px',
            display: 'block'
        });
        bottomDiv.css({
            height: '1px',
            width: cur_ele_width + 'px',
            left: left + 'px',
            top: top + cur_ele_height + 'px',
            display: 'block'
        });
    }

    /**
     * 初始化事件
     * */
    function tableChart(selector) {
        excel$ = $(selector + ' tbody').find('.excel');
        // 插入四条边框
        $('.scroll-body table').append('<div id="excel_left_border" class="excel_border_hide"></div><div id="excel_right_border" class="excel_border_hide"></div><div id="excel_top_border" class="excel_border_hide"></div><div id="excel_bottom_border" class="excel_border_hide"></div><textarea id="excel_textarea" class="excel_textarea"></textarea><textarea id="save_value" ></textarea><ul id="excel_select"><li>是</li><li>否</li></ul>');
        leftDiv = $('#excel_left_border');
        rightDiv = $('#excel_right_border');
        topDiv = $('#excel_top_border');
        bottomDiv = $('#excel_bottom_border');
        textarea$ = $('.excel_textarea');
        select$ = $('#excel_select');
        // 绑定键盘复制粘贴事件
        copyAndPaste();
    }

    exports.tableChart = tableChart;

    /**
     * tr绑定鼠标事件
     * @param flag
     * */
    function setMouseEvent(flag) {
        excel$ = $('.excel' + flag);
        mouseDown();
        dblClick();
    }

    exports.setMouseEvent = setMouseEvent;

    /**
     *  清空当前样式
     * */
    function clearStyle() {
        $('.excel').find('td').css('background-color', '#fff');
        select$.css({
            display: 'none',
            bottom: 0,
            width: 0,
            height: 0
        });
        $('.excel_border_hide').hide();
    }

    exports.clearStyle = clearStyle;
});

