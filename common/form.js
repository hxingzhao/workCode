<script type="text/javascript">
    /**
     *  获取编辑表单数据
     *  @param selector 表单id
     *  @param pData 原始数据
     * */
    function getRiverFormValue(selector, pData) {
        var prData = pData[0]; // 年份投资计划
        delete prData['riverName'];
        delete prData['sjxzqId'];
        delete prData['sjxzqName'];
        var arr = [];  // 编辑后的投资年份集合
        var isOk = true;
        var info = '';
        var validateInfo = {
            common: true,
            required: true,
            number: true
        };
        var inputs = null;
        var trObj = {};
        inputs = $(selector + ' :input');
        inputs.each(function () {
            if ($(this).get(0).tagName != 'BUTTON') {
                var key = $(this).attr('name');
                var value = $(this).val();
                var validObj = {
                    common: true,
                    required: true,
                    number: true
                };
                var isNumberValid = $(this).attr('numberValid'); // number类型表单
                var isRequired = $(this).attr('required'); // 是否必填
                var v = $(this).val();
                var s = /\s+/g.test(v);
                if (value == null || value < 0) {
                    validObj.common = false;
                    validateInfo.common = false;
                }
                // 验证数字
                if (isNumberValid && value != '') {
                    var scope = isNumberValid.split('-');
                    var regTest = /(^[0-9]+$|^[0-9]+.[0-9]+$)/g.test(value);
                    if (value.length < scope[0] - 0 || value.length > scope[1] - 0 || !regTest) {
                        validObj.number = false;
                        validateInfo.number = false;
                    }
                }
                // 验证必填
                if (isRequired) {
                    if (value == '') {
                        validObj.required = false;
                        validateInfo.required = false;
                    }
                }
                $(this).removeClass("requireWarn");
                for (var name in validObj) {
                    if (!validObj[name]) {
                        $(this).addClass("requireWarn");
                        isOk = false;
                        break;
                    }
                }
                var value = $(this).val() == '' ? 0 : $(this).val();
                // 处理投资年份数据
                if ((key == 'zytz' || key == 'dftz') && !$(this).parents('.tzjh').length) {
                    prData[key] = $(this).val();
                    if (key == 'dftz') {
                        var objs = JSON.parse(JSON.stringify(prData));
                        arr.push(objs);
                        prData.pk.ssnf += 1;
                    }
                } else {
                    trObj[key] = value;
                }
            }
        });
        for (var name in validateInfo) {
            if (!validateInfo[name]) {
                switch (name) {
                    case 'common':
                        info += '数据格式不正确、';
                        break;
                    case 'required':
                        info += '必填项数据为空、';
                        break;
                    case 'number':
                        info += '数字数据不正确、';
                        break;
                }
            }
        }
        trObj.riverTzjhb = arr;
        return {obj: trObj, isOk: isOk, validateInfo: info};
    }

    /**
     * 设置表单值，传入的valueObj即后台回传的result[0]对象
     * @param selector
     * @param valueObj
     */
    function setFormValue(selector, valueObj) {
        var form = $(selector);
        for (var name in valueObj) {
            var formItem = form.find("[name='" + name + "']");
            if (formItem.length == 0) {
                continue;
            }
            var tagName = formItem.get(0).tagName;
            var value = valueObj[name];
            if (tagName == "INPUT") {
                var type = formItem.attr("type");
                if (type == "text" || type == "password" || type == "hidden" || type == 'number') {
                    formItem.val(value);
                    formItem.attr("value", value);
                } else if (type == "radio") {
                    formItem.each(function () {
                        if ($(this).attr("value") == value) {
                            $(this).prop("checked", true);
                        }
                    });
                } else if (type == "checkbox") {
                    var valArr = value.split("|");
                    for (var i = 0; i < valArr.length; i++) {
                        formItem.each(function () {
                            if ($(this).attr("value") == valArr[i]) {
                                $(this).prop("checked", true);
                            }
                        });
                    }
                }
            } else if (tagName == "SELECT" || tagName == "TEXTAREA") {
                formItem.val(value);
            }
        }
    }
</script>

