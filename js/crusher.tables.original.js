(function(mw, $) {
    $(function(){
        tableCrusher(); // run first thing, because we dont need a resize to be broken.

        var tableCrusherRTime;
        var tableCrusherTimeout = false;
        var tableCrusherDelta = 500;

        $(window).resize(function() {
            tableCrusherRTime = new Date();
            if (tableCrusherTimeout === false) {
                tableCrusherTimeout = true;
                setTimeout(tableCrusherResizeEnd, tableCrusherDelta);
            }
        });

        function tableCrusherResizeEnd() {
            if (new Date() - tableCrusherRTime < tableCrusherDelta) {
                setTimeout(tableCrusherResizeEnd, tableCrusherDelta);
            } else {
                tableCrusherTimeout = false;
                tableCrusher();
            }
        }

        function crushTable(self) {
            var parent = $(self).parent();
            var colCount = 0;
            self.find('tr:nth-child(1)').first().find('td, th').each(function () {
                if ($(this).attr('colspan')) {
                   colCount += +$(this).attr('colspan');
                } else {
                   colCount++;
                }
            });
            var max = Math.floor(parent.width() / colCount);
            self.addClass('crushedTable');
            self.find('th').each(function(){
                $(this).width(max).addClass('crushTh');
            });
            self.find('td').each(function(){
                $(this).width(max).addClass('crushTd');
                $(this).find('img').each(function(){
                    var img = $(this);
                    if (typeof img.attr("data-orig-height") == 'undefined') {
                        img.attr("data-orig-height", img.height());
                        img.attr("data-orig-width", img.width());
                    }
                    var aspect = img.width() / img.height();
                    var newWidth = max;
                    var newHeight = newWidth / aspect;
                    img.width(newWidth).css('width',newWidth).attr('width',newWidth);
                    img.height(newHeight).css('height',newHeight).attr('height',newHeight);
                });
            });
            self.width(parent.width()-2).addClass('crushedTable');
            return colCount;
        };

        function uncrushTable(self) {
            self.find('td').each(function(){
                $(this).removeClass('crushTd').css('width','');
                $(this).find('img').each(function(){
                    var img = $(this);
                    var originalWidth = img.attr("data-orig-width");
                    var originalHeight = img.attr("data-orig-height");
                    img.width(originalWidth).css('width',originalWidth).attr('width',originalWidth);
                    img.height(originalHeight).css('height',originalHeight).attr('height',originalHeight);
                });
            });
            self.find('th').each(function(){
                $(this).removeClass('crushTh').css('width','');
            });
            self.removeClass('crushedTable').css('width','');

            // verify it doesn't actually *need* too be crushed tho..
            var parent = $(self).parent();
            if (self.width() >= parent.width() && !self.hasClass("dontCrush")) {
                tableCrusher();
            }
        };

        function tableCrusher() {
            tablecount = 0;
            $('#mw-content-text table').each(function(){
                var parent = $(this).parent();
                var self = $(this);
                if (typeof self.attr('id') == "undefined") {
                    tablecount++;
                    self.attr("id","tc-table-"+tablecount);
                }
                // remove tableHelpers
                self.find('.crushedTableHelper').each(function(){ $(this).remove(); });
                if (self.width() >= parent.width()) {
                    colCount = crushTable(self);
                    var crushedTableHelper = '<tr class="crushedTableHelper">'
                                           + '<td colspan="'+colCount+'" class="crushedTableHelperTd">'
                                           + '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> This table is too large to view on your screen, and has been collpased.'
                                           + '<a href="#" id="crusher-toggle-for-'+self.attr('id')+'" onClick="return toggleCrushedTable(\''+self.attr('id')+'\');" class="showTableCrusherFullSize"><i class="fa fa-plus-square-o" aria-hidden="true"></i>Expand</a>'
                                           + '</td>'
                                           + '</tr>';

                    self.prepend(crushedTableHelper);
                } else {
                    uncrushTable(self);
                }
            });
        }

        toggleCrushedTable = function(id) {
            self = $("#"+id);
            toggle = $("#crusher-toggle-for-"+id);
            if (self.hasClass('crushedTable')) {
                self.addClass("dontCrush");
                uncrushTable(self);
                toggle.html('<i class="fa fa-minus-square-o" aria-hidden="true"></i>Collapse');
            } else {
                self.removeClass("dontCrush");
                crushTable(self);
                toggle.html('<i class="fa fa-plus-square-o" aria-hidden="true"></i>Expand');
            }
            return false;
        };

    });
}(mediaWiki, jQuery));

