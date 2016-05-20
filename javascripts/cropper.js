var CropperObj = function(options) {
    if(!options.srcIMG) {
        return false;
    }
    console.log('Cropper: Wellcome!');
    
    var sourceParent = $(options.srcIMG).closest('div');
    var pos = $(sourceParent).css('position');

    if(pos != 'relative' && pos != 'fixed' && pos != 'absolute') {
        $(sourceParent).css({'position':'relative'});
    }
    
    $(sourceParent).append('<div class="frame-shadow"><div class="crop-frame"></div></div>');
    
    var cropAPI = {
        mime: options.mime || 'image/png',
        srcIMG: options.srcIMG,
        aspectRatio: ((options.aspectRatio === Infinity) ? false : options.aspectRatio) || 1,
        fixed: options.fixed || false,
        cropFrame: $(sourceParent).find('.crop-frame'),
        dataURL:'',
        _mouseX: 0,
        _mouseY: 0,
        init: function() {
            console.log(this);
            
            $(this.srcIMG).css({'user-select': 'none'});
            
            $(sourceParent).find('.frame-shadow').width($(this.srcIMG).width()).height($(this.srcIMG).height());
            
            $(document).on('dragstart', '', {}, function(e) {
                return false; 
            });
            
            this._initFrame();
            

        },
        onStartMove: function(e) {
            if(!$(this).hasClass('move')) {
                var crop = e.data.crop;
                
                crop._mouseX = e.pageX;
                crop._mouseY = e.pageY;
               
                $(this).addClass('move');
                $(document).on('mousemove', '', {'crop':crop}, crop.onMove);
                $(document).on('mouseup', '', {'crop':crop}, crop.onStopMove);                
            }            
        },
        onStopMove: function(e) {
           var crop = e.data.crop;
           
           if($(crop.cropFrame).hasClass('move')) {   
                $(document).off('mousemove');
                $(document).off('mouseup');
                $(crop.cropFrame).removeClass('move');
            }            
        },
        onMove: function(e) {
            var crop = e.data.crop;
            var pos = $(crop.cropFrame).offset();
            var dX = e.pageX - crop._mouseX;
            var dY = e.pageY - crop._mouseY;
            
            var dt = {
                left: pos.left + dX,
                top: pos.top + dY,
                width: pos.left + dX + crop.width,
                height: pos.top + dY + crop.height
            }
            
            if(dt.left < $(crop.srcIMG).offset().left) {
                dt.left = $(crop.srcIMG).offset().left;
            }
            
            if(dt.top < $(crop.srcIMG).offset().top) {
                dt.top = $(crop.srcIMG).offset().top;
            }
            
            if(dt.width > $(crop.srcIMG).offset().left + $(crop.srcIMG).width()) {
                dt.left = $(crop.srcIMG).offset().left + $(crop.srcIMG).width() - crop.width;
            }
            
            if(dt.height > $(crop.srcIMG).offset().top + $(crop.srcIMG).height()) {
                dt.top = $(crop.srcIMG).offset().top + $(crop.srcIMG).height() - crop.height;
            }
      
            crop._mouseX = e.pageX;
            crop._mouseY = e.pageY;
        
            $(crop.cropFrame).offset({'top':dt.top, 'left':dt.left});
        },
        onMarkerStartMove: function(e) {
            var crop = e.data.crop;
            
            if(!$(crop.cropFrame).hasClass('move')) {                
                crop._mouseX = e.pageX;
                crop._mouseY = e.pageY;
                
                $(crop.cropFrame).addClass('move');
                $(document).on('mousemove', '', {'crop':crop, 'marker':$(this).attr('class')}, crop.onMarkerMove);
                $(document).on('mouseup', '', {'crop':crop, 'marker':$(this).attr('class')}, crop.onMarkerStopMove);                
            }
        },
        onMarkerStopMove: function(e) {
            var crop = e.data.crop;
            
            if($(crop.cropFrame).hasClass('move')) {                
                $(document).off('mousemove');
                $(document).off('mouseup');
                $(crop.cropFrame).removeClass('move');
            }            
        },
        onMarkerMove: function (e) {            
            var crop = e.data.crop;
            var dX = e.pageX - crop._mouseX;
            var dY = e.pageY - crop._mouseY;
            var dt = $(crop.cropFrame).offset();
             
            switch (e.data.marker) {
                case 'nw':
                    dt.top = dt.top + dY;
                    dt.left = dt.left + dX;                  
                    
                    if(dt.left < $(crop.srcIMG).offset().left) {
                        dt.left = $(crop.srcIMG).offset().left;
                        dt.width = crop.width;
                    } else {
                        dt.width = crop.width - dX;
                    }
                
                    if(dt.top < $(crop.srcIMG).offset().top) {
                        dt.top = $(crop.srcIMG).offset().top;
                        dt.height = crop.height;
                    } else {
                        dt.height = crop.height - dY;
                    }
                    
                    crop.width = dt.width;
                    crop.height = dt.height;
                    $(crop.cropFrame).offset({'top':dt.top, 'left':dt.left});                   
                    break;
                    
                case 'ne':
                    dt.top = dt.top + dY;
                   
                    if(dt.top < $(crop.srcIMG).offset().top) {
                        dt.top = $(crop.srcIMG).offset().top;
                        dt.height = crop.height;
                    } else {
                        dt.height = crop.height - dY;
                    }
                    
                    dt.width = crop.width + dX;
                    if(dt.left + dt.width > $(crop.srcIMG).offset().left + $(crop.srcIMG).width()) {
                        dt.width = $(crop.srcIMG).offset().left + $(crop.srcIMG).width() - dt.left;
                    }
                    
                    crop.width = dt.width;
                    crop.height = dt.height;
                    $(crop.cropFrame).offset({'top':dt.top});
                    break;
                    
                case 'se':
                    dt.top = dt.top + dY;
                    dt.width = crop.width + dX;
                    dt.height = crop.height + dY;
                    
                    if(dt.left + dt.width > $(crop.srcIMG).offset().left + $(crop.srcIMG).width()) {
                        dt.width = crop.width;
                    } else {
                        dt.width = crop.width + dX;
                    }
                    
                    if(dt.top + dt.height > $(crop.srcIMG).offset().top + $(crop.srcIMG).height()) {
                        dt.height = crop.height;
                    }
                    
                    crop.width = dt.width;
                    crop.height = dt.height;
                    break;
                    
                case 'sw':
                    dt.top = dt.top + dY;
                    dt.left = dt.left + dX;
                    dt.width = crop.width - dX;
                    dt.height = crop.height + dY;    
                    
                    if(dt.left < $(crop.srcIMG).offset().left) {
                        dt.left = $(crop.srcIMG).offset().left;
                        dt.width = crop.width;
                    } 
                    
                    if(dt.top + dt.height > $(crop.srcIMG).offset().top + $(crop.srcIMG).height()) {
                        dt.height = crop.height;
                    }       
                
                    crop.width = dt.width;
                    crop.height = dt.height;
                    $(crop.cropFrame).offset({'left':dt.left});
                    break;
                    
                case 'n':
                    dt.top = dt.top + dY;

                    if(dt.top < $(crop.srcIMG).offset().top) {
                        dt.top = $(crop.srcIMG).offset().top;
                        dt.height = crop.height;
                    } else {
                        dt.height = crop.height - dY;
                    
                        dt.width = dt.height * crop.aspectRatio;
                        if(dt.width + dt.left > $(crop.srcIMG).offset().left + $(crop.srcIMG).width()) {
                            dt.width = $(crop.srcIMG).offset().left + $(crop.srcIMG).width() - dt.left;
                            dt.height = dt.width / crop.aspectRatio;
                        }                         
                    }  
                    crop.height = dt.height;
                    crop.width = crop.height * crop.aspectRatio;
                    $(crop.cropFrame).offset({'top':dt.top});
                    break;
                    
                case 'e':
                    dt.width = crop.width + dX;
                    
                    if(dt.left + dt.width > $(crop.srcIMG).offset().left + $(crop.srcIMG).width()) {
                        dt.width = $(crop.srcIMG).offset().left + $(crop.srcIMG).width() - dt.left;
                        dt.height = dt.width / crop.aspectRatio;
                    } else {
                        dt.height = dt.width / crop.aspectRatio;
                        
                        if(dt.top + dt.height > $(crop.srcIMG).offset().top + $(crop.srcIMG).height()) {
                            dt.height = $(crop.srcIMG).offset().top + $(crop.srcIMG).height() - dt.top;
                            dt.width = dt.height * crop.aspectRatio;
                        }
                    }
                    
                    crop.width = dt.width;
                    crop.height = crop.width / crop.aspectRatio;
                    break;
                    
                case 's':                    
                    dt.height = crop.height + dY;
                    
                    if(dt.top + dt.height > $(crop.srcIMG).offset().top + $(crop.srcIMG).height()) {
                        dt.height = $(crop.srcIMG).offset().top + $(crop.srcIMG).height() - dt.top;
                        dt.width = dt.height * crop.aspectRatio;
                    } else {
                        dt.width = dt.height * crop.aspectRatio;
                        
                        if(dt.left + dt.width > $(crop.srcIMG).offset().left + $(crop.srcIMG).width()) {
                            dt.width = $(crop.srcIMG).offset().left + $(crop.srcIMG).width() - dt.left;
                            dt.height = dt.width / crop.aspectRatio;
                        }
                    }
                    
                    crop.height = dt.height;
                    crop.width = crop.height * crop.aspectRatio;
                    break;
                    
                case 'w':
                    dt.left = dt.left + dX;
                    
                    if(dt.left < $(crop.srcIMG).offset().left) {
                        dt.left = $(crop.srcIMG).offset().left;
                        dt.width = crop.width;
                        dt.height = dt.width / crop.aspectRatio;
                        
                    } else {
                        dt.width = crop.width - dX;
                        dt.height = dt.width / crop.aspectRatio;
                        
                        if(dt.top + dt.height > $(crop.srcIMG).offset().top + $(crop.srcIMG).height()) {
                            dt.height = $(crop.srcIMG).offset().top + $(crop.srcIMG).height() - dt.top;
                            dt.width = dt.height * crop.aspectRatio;
                        }
                    }
                    
                    crop.width = dt.width;
                    crop.height = dt.height;
                    $(crop.cropFrame).offset({'left':dt.left});
                    break;
                    
                default:
                    break;
            }
            
            crop._mouseX = e.pageX;
            crop._mouseY = e.pageY;
            
            $(crop.cropFrame).width(crop.width);
            $(crop.cropFrame).height(crop.height);          
        },
        onCrop: function(callback) {
            var imageObj = new Image();
                       
            $(imageObj).on('load', '', {'crop':this}, function(e) {
                var crop = e.data.crop;
                var imgData = crop.imageData(this);
                
                var canvas = document.createElement('canvas');        
                canvas.width = imgData.Width;
                canvas.height = imgData.Height;
                
                var context = canvas.getContext('2d');
                context.drawImage(this, imgData.Left, imgData.Top, imgData.Width, imgData.Height, 0, 0, imgData.Width, imgData.Height);
                crop.dataURL = canvas.toDataURL(crop.mime, 1.0);
                
                callback();                
            });
            
            imageObj.src = $(this.srcIMG).attr('src');            
        },
        imageData: function(img) {
            var dX = img.width / $(this.srcIMG).width();
            var dY = img.height / $(this.srcIMG).height();
            
            return {
                Left: $(this.cropFrame).position().left * dX,
                Top: $(this.cropFrame).position().top * dY,
                Width: $(this.cropFrame).width() * dX,
                Height: $(this.cropFrame).height() * dY
            }            
        },
        reset: function(options) {
            this.mime = options.mime || this.mime;
            this.aspectRatio = ((options.aspectRatio === Infinity) ? false : options.aspectRatio) || this.aspectRatio;
            this.fixed = (Number(options.fixed) || options.fixed == 'true') ? true : false;//) || this.fixed;
            this.dataURL = '';
            this._mouseX = 0;
            this._mouseY = 0;
            
            $(sourceParent).find('.frame-shadow').width($(this.srcIMG).width()).height($(this.srcIMG).height());
            this._initFrame();
            
            console.log(this);
        },
        _initFrame: function() {
            $(this.cropFrame).off('mousedown');
            
            $(this.cropFrame).find('span').remove();
            
            if(this.fixed) {
                $(this.cropFrame).append('<span class="n"/><span class="e"/><span class="s"/><span class="w"/>');
                
                var ar = $(this.srcIMG).width() / $(this.srcIMG).height();
            
                if(this.aspectRatio < ar) {
                    this.height = $(this.srcIMG).height();
                    this.width = this.height * this.aspectRatio;
                } else {
                    this.width = $(this.srcIMG).width();
                    this.height = this.width / this.aspectRatio;
                }
            } else {
                $(this.cropFrame).append('<span class="nw"/><span class="ne"/><span class="se"/><span class="sw"/>');
                
                this.height = $(this.srcIMG).height();
                this.width = $(this.srcIMG).width();
            }

            $(this.cropFrame).offset($(this.srcIMG).offset());
            $(this.cropFrame).width(this.width);
            $(this.cropFrame).height(this.height);

            
            $(this.cropFrame).on('mousedown', '', {'crop':this}, this.onStartMove);            
            $(this.cropFrame).on('mousedown', 'span', {'crop':this}, this.onMarkerStartMove);            
        }
    }
    
    cropAPI.init();
    
    return cropAPI;
}