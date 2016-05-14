
$(function () {

    $('.btn').prop('disabled', true);

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function randomData() {
        return {
            S110: {
                actualValue: randomIntFromInterval(1, 100),
                subValue: randomIntFromInterval(1, 100),
                value: randomIntFromInterval(1, 100)
            },
            S120: {
                actualValue: randomIntFromInterval(1, 100),
                subValue: randomIntFromInterval(1, 100),
                value: randomIntFromInterval(1, 100)
            },
            S130: {
                actualValue: randomIntFromInterval(1, 100),
                subValue: randomIntFromInterval(1, 100),
                value: randomIntFromInterval(1, 100)
            }
        }
    }

    var name = getParameterByName('name') || 'test';

    var loadHtml = '<div class="spinner">\
                      <div class="rect1"></div>\
                      <div class="rect2"></div>\
                      <div class="rect3"></div>\
                      <div class="rect4"></div>\
                      <div class="rect5"></div>\
                    </div>';

    $('#content').html(loadHtml);
    $.get('demo/' + name + '/table.html').done(function (tpl) {
        LazyLoad.js(['demo/' + name + '/table.js'], function () {
            LazyLoad.css(['demo/' + name + '/table.css'], function () {

                $('.btn').prop('disabled', false);

                // 主要代码
                var displayTpl = _.template('<%- data.val %> (<%- data.subValue %>) <span class="<%- data.cls%>"><%- data.difValue %></span>', { 'variable': 'data' });

                $('#enable').click(function () {
                    $('#content .editable').editable('toggleDisabled');
                });

                $('#btnFetch').click(function () {
                    var editable = $('.tableEditable').data('tableEditable');
                    editable.render();
                });

                
                // 调用 tableEditable
                $('#content').tableEditable({
                    template: _.template(tpl, { 'variable': 'Model' }),
                    fetch: function () {
                        var deferred = $.Deferred();
                        deferred.resolve(randomData());
                        return deferred.promise();
                    },
                    fetchData: function (resp) {
                        resp.getDisplay = function (data) {
                            return data.Value + '(' + data.SubValue + ')';
                        }
                        return resp;
                    },
                    editableOptions: {
                        url: 'demo/save.json',
                        ajaxOptions: {
                            type: 'GET',
                            dataType: 'json'
                        },
                        display: function (value, response) {
                            var $this = $(this);
                            var key = $this.data('name');
                            var data = $this.closest('.tableEditable').data('tableEditable').data;
                            var item = data[key];
                            var difValue = value - item.subValue;
                            var html = displayTpl({
                                val: value,
                                subValue: item.subValue,
                                difValue: difValue === 0 ? difValue : difValue.toFixed(1),
                                cls: difValue >= 0 ? 'text-success' : 'text-danger'
                            });
                            $this.html(html);
                        }
                    }
                }).on('rendered.tableEditable', function () {
                    ChangeColspanHiddenData();
                }).focus();

            });
        });
    });


})