class Viewer {
    constructor (shell) {
        this.bindEvents();
        this.shell = shell;
        this.pageTitle = "";
        this.isVisibleRect = false;
    }

    renderSvgFile (f) {
        var $stage = $('#main');
        var $title = $('#site-title');
        var $url   = $('#btn-visit-org-site');
        $stage[0].innerHTML = '';

        var reader = new FileReader();
        reader.onload = e => {
            $('#hide')[0].innerHTML = reader.result;
            var svgRootTag = $('.svg-screenshot')[0];
            var viewbox = svgRootTag.viewBox.baseVal;
            var w = viewbox.width;
            var h = viewbox.height;
            $stage.css({
                width: w,
                height: h
            });
            var pageUrl = svgRootTag.getAttribute('data-url') || '';
            this.pageTitle = svgRootTag.getAttribute('data-title') || 'Viewer';
            $title[0].innerHTML = this.pageTitle;
            $url[0].dataset.href = pageUrl;
            svgRootTag.setAttributeNS(null, 'title', `${w} x ${h}`);
            $stage[0].appendChild(svgRootTag);
        }
        // File APIを用いてテキストを読み込む
        reader.readAsText(f);
    }

    bindEvents () {
        // SVGスクリーンショットファイルをドラッグドロップで読み込む
        $('html').bind('drop', e => {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            var reader = new FileReader();
            if (files.length <= 0) return false;

            // 複数与えられた場合でも，読み込むのは最初のファイルのみ
            var file = files[0];
            if (file.type.match('image/svg+xml') == -1) return false;
            this.renderSvgFile(file);

        }).bind('dragenter', e => {
            return false;
        }).bind('dragover', e => {
            return false;
        }).bind('dragleave', e => {
            return false;
        });

        $('#btn-visit-org-site').on('click', e => {
            var href = $(e.target).attr('data-href') || "";
            if (href.length > 0) {
                this.shell.openExternal(href);
            }
            return false;
        });

        // aタグをクリックされたときに外部ブラウザで開くようにオーバーライドする
        $("#main").on('click', 'a', e => {
            e.preventDefault();
            var $a = $(e.target).closest('a');
            var href = $a[0].href.baseVal;
            this.shell.openExternal(href);   
            return false;
        });

        $("#main").on('mouseover', 'a', e => {
            var $title = $('#site-title');
            var $a = $(e.target).closest('a');
            var href = $a[0].href.baseVal;
            $title[0].innerHTML = href;
        });

        $("#main").on('mouseleave', 'a', e => {
            var $title = $('#site-title');
            $title[0].innerHTML = this.pageTitle;
        });

        // SVG中のリンクRect要素の表示非表示を切り換える
        $('#btn_toggle_a_rect').on('click', e => {
            var rects = document.querySelectorAll('rect');
            var $btn = $('#btn_toggle_a_rect');
            if (rects.length === 0) return;
            if (!this.isVisibleRect) {
                // 表示する
                for (var i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    rect.setAttribute('class', 'visibleRect');
                }
                this.isVisibleRect = true;
                $btn.addClass('active');
            }else {
                // 隠す
                for (var i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    rect.setAttribute('class', '');
                }
                this.isVisibleRect = false;
                $btn.removeClass('active');
            }
        });
    }
}

module.exports = Viewer;
