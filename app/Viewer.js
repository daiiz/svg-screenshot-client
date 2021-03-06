const mime = require('mime');
const fs = require('fs');
const shell  = require('electron').shell;

class Viewer {
    constructor () {
        this.bindEvents();
        this.pageTitle = "";
        this.isVisibleRect = false;
        this.svgRefreshed = true;
        // 「open-file」モードでファイルを与えられた場合はファイルパスを保持
        this.givenFilePath = window.location.hash.replace(/^#/, '') || '';
        if (this.givenFilePath.length > 0) {
            console.info(mime.lookup(this.givenFilePath));
            if (mime.lookup(this.givenFilePath) === 'image/svg+xml') {
                fs.readFile(this.givenFilePath, (err, svgTagTxt) => {
                    this.drawSvg(svgTagTxt);
                });  
            }
        }
    }

    renderSvgFile (f) {
        var reader = new FileReader();
        reader.onload = e => {
            this.drawSvg(reader.result);
        }
        // File APIを用いてテキストを読み込む
        reader.readAsText(f);
    }

    drawSvg (svgTagTxt) {
        var $stage = $('#main');
        var $title = $('#site-title');
        var $url   = $('.btn-visit-org-site');
        $stage[0].innerHTML = '';
        
        $('#hide')[0].innerHTML = svgTagTxt;
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
        this.setWindowSize(w, h);
    }

    setWindowSize (w, h) {
        // TODO: リサイズ時にtop値を計算
        var width = Math.min(w, screen.width - 60);
        var height = Math.min(h + 55, screen.height - 80);
        this.svgRefreshed = true;
        if (h + 55 < screen.height - 80) {
            $('body').css({'overflow-y': 'hidden'});
        }else {
            $('body').css({'overflow-y': 'auto'});
        }
        window.resizeTo(width, height);
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
            if (file.type !== 'image/svg+xml') return false;
            this.renderSvgFile(file);

        }).bind('dragenter', e => {
            return false;
        }).bind('dragover', e => {
            return false;
        }).bind('dragleave', e => {
            return false;
        });

        $(".btn-visit-org-site").on("mouseover", e => {
            var $title = $('#site-title');
            var href = $(e.target).attr('data-href') || '';
            if (href.length > 0) {
                $title[0].innerHTML = href;
            }
        });

        $(".btn-visit-org-site").on("mouseleave", e => {
            var $title = $('#site-title');
            $title[0].innerHTML = this.pageTitle;
        });

        // aタグをクリックされたときに外部ブラウザで開くようにオーバーライドする
        $("#main").on('click', 'a', e => {
            e.preventDefault();
            var $a = $(e.target).closest('a');
            var href = $a[0].href.baseVal;
            shell.openExternal(href);   
            return false;
        });

        // スクリーンショットに含まれるa.rectがホバーされたら，リンク先URLを表示
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

        $(".btn-visit-org-site").on('click', e => {
            var href = $(e.target).closest(".btn-visit-org-site").attr('data-href') || "";
            if (href.length > 0) {
                shell.openExternal(href);
            }
            return false;
        });
        
        // SVG中のリンクRect要素の表示非表示を切り換える
        $(".btn_toggle_a_rect").on('click', e => {
            var rects = document.querySelectorAll('rect');
            var $btn = $(e.target).closest('.btn_toggle_a_rect');
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

        $(window).on('resize', e => {
            if (!this.svgRefreshed) {
                $('body').css({'overflow-y': 'auto'});
            }else {
                this.svgRefreshed = false;
            }
        });
    }
}

module.exports = Viewer;
