; (function ($, window, document, undefined) {

    "use strict";

    // helpers

    function setInputSelection(input, start, end) {
        input.focus();
        if (start == null) start = 0;
        if (end == null) end = input.value.length;
        if (input.setSelectionRange) {
            input.setSelectionRange(start, end);
        } else if (typeof input.selectionStart != 'undefined') {
            input.selectionStart = start;
            input.selectionEnd = end;
        } else if (input.createTextRange) {
            var selRange = input.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end - start);
            selRange.select();
        }
    };

    var pluginName = "tableEditable",
        defaults = {
            fetch: function () {
                var deferred = $.Deferred();
                deferred.resolve();
                return deferred.promise();
            },
            fetchData: function (resp) {
                return resp;
            },
            editableOptions: {
                // selector: '.editable',
                ajaxOptions: {
                    type: 'POST',
                    dataType: 'json'
                },
                pk: 1,
                showbuttons: false
            },
            template: function () {
                return '';
            }
        };

    function Plugin(element, options) {
        this.element = element;

        defaults.editableOptions.container = $(this.element);
        this.settings = $.extend(true, {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {
            var $el = $(this.element);
            var that = this;

            $el.addClass('tableEditable').attr('tabindex', 1);

            this._bindEvents();

            setTimeout(function() {
                that.render();
            }, 0);
        },
        render: function () {
            var that = this;
            var $el = $(this.element);

            this.settings.fetch.apply(this, Array.prototype.slice.call(arguments)).done(function (resp) {
                if (resp) {

                    var data = that.settings.fetchData(resp);
                    that.data = data;

                    var html = that.settings.template(data);
                    $el.html(html);
                }

                $el.trigger($.Event('rendered.tableEditable'));

                that._initNav();
                that._initEditable();
            });

        },
        _initNav: function () {
            var $el = $(this.element);
            var that = this;

           // var $editableTr = $el.find('tbody').find('tr:visible:has(.editable:visible)');
            var $allTr = $el.find('tbody tr:visible');
            that._maxY = $allTr.length - 1;

            var matrix = [];

            for (var i = 0; i < $allTr.length; i++) {

                matrix[i] = matrix[i] || [];
                var $row = $($allTr[i]);
                var cells = $row.children('td, th');

                for (var j = 0; j < cells.length; j++) {
                    var colIndex = null;
                    var l;

                    var $cell = $(cells[j]);
                    var colspan = $cell.prop('colspan') || 1;
                    var rowspan = $cell.prop('rowspan') || 1;
                    var rowIndex = $row.index();

                    matrix[rowIndex] = matrix[rowIndex] || [];

                    for (l = 0; l <= matrix[rowIndex].length && colIndex === null; l++) {
                        if (!matrix[rowIndex][l]) colIndex = l;
                    }

                    for (var k = rowIndex; k < rowIndex + rowspan; k++) {
                        for (l = colIndex; l < colIndex + colspan; l++) {
                            matrix[k] = matrix[k] || [];
                            matrix[k][l] = 1;
                        }
                    }

                    //if ($cell.get(0) === $td.get(0)) { // Short circuit if possible.
                    //    x = colIndex;
                    //    break;
                    //}

                    var $editable = $cell.find('.editable');
                    if ($editable.length > 0) {
                        $editable.attr('tabindex', 1).attr('data-x', colIndex).attr('data-y', rowIndex);
                    }

                }
            }

        },
        _bindEvents: function () {
            var $el = $(this.element);
            var that = this;

            $el.on('keydown', function (e) {
                if (!$(e.target).is($(this)) && !$(e.target).is('.editable')) return;
                var $current = $(this).find('.editable:focus');
                var $allEditable = $(this).find('.editable');
                var $next;
                if ($current.length === 0) {
                    $current = $(this).find('.editable').first();
                } else {
                    if (e.which === 37 || e.which === 39) {
                        e.preventDefault();
                        var idx = $allEditable.index($current);

                        switch (e.which) {
                            case 37:
                                idx = idx - 1;
                                break;
                            case 39:
                                idx = idx + 1;
                                break;
                        }

                        idx = idx < 0 ? $allEditable.length - 1 : (idx >= $allEditable.length ? 0 : idx);
                        $next = $allEditable.eq(idx);

                    }
                    if (e.which === 38 || e.which === 40) {
                        e.preventDefault();

                        var x = $current.data('x'); // $rowEditable.index($current);
                        var y = $current.data('y');
                        switch (e.which) {
                            case 38:
                                $next = that._findUntil(x, y, false);
                                break;
                            case 40:
                                $next = that._findUntil(x, y, true);
                                break;
                        }
                    }
                }

                if ($next != null && $next.length > 0) {
                    $current = $next;
                }

                $current.focus();
            });
        },
        _findEditable: function (x, y) {
            var $el = $(this.element);
            return $el.find('.editable[data-x=' + x + '][data-y=' + y + ']');
        },
        _findUntil: function (x, y, isNext) {
            var result = [];
            var maxY = this._maxY || 0;
            isNext ? y++ : y--;
            while (result.length === 0 && (isNext ? y <= maxY : y >= 0)) {
                result = this._findEditable(x, y);
                isNext ? y++ : y--;
            }
            return result;
        },
        _initEditable: function () {
            var $el = $(this.element);

            $el.find('.editable')
                .editable(this.settings.editableOptions)
                .on('shown', function (e, editable) {
                    editable.input.$input.on('keydown', function (e) {
                        if ([9, 37, 38, 39, 40].indexOf(e.which) >= 0) {
                            e.preventDefault();
                            editable.$element.editable('hide');  // 

                        }
                    });
                    setTimeout(function () {
                        setInputSelection(editable.input.$input.get(0));
                    }, 0);

                }).on('hidden', function (e, reason) {
                    $(e.target).focus();
                });
        }
    });

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new Plugin(this, options));
            }
        });
    };

    $.fn.editable.defaults.mode = 'popup';

})(jQuery, window, document);