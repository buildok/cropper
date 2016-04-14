var CropperObj = function(data) {
    var sourceParent = $(data.srcIMG).closest('div');
    var pos = $(sourceParent).css('position');

    if(pos != 'relative' && pos != 'fixed' && pos != 'absolute') {
        $(sourceParent).css({'position':'relative'});
    }
    
    $(sourceParent).append('<div class="frame-shadow"><div class="crop-frame"></div></div>');
    
    
    return {
        mime: 'image/png',
        srcIMG: data.srcIMG,
        previewIMG: data.previewIMG,
        width: data.width,
        height: data.height,
        aspectRatio: data.width / data.height,
        fixed: data.fixed,
        cropFrame: $(sourceParent).find('.crop-frame'),
        dataURL:'',
        mouseX: 0,
        mouseY: 0,
        init: function() {
            console.log('Cropper: init');
            $(this.srcIMG).css({'user-select': 'none'});
            $(sourceParent).find('.frame-shadow').width($(this.srcIMG).width()).height($(this.srcIMG).height());
            
            
            $(document).on('dragstart', '', {}, function(e) {
                return false; 
            });
            
            if(this.fixed) {
                $(this.cropFrame).addClass('fixed');
                $(this.cropFrame).append('<span class="n"/><span class="e"/><span class="s"/><span class="w"/>');
            } else {
                $(this.cropFrame).append('<span class="nw"/><span class="ne"/><span class="se"/><span class="sw"/>');
            }
            
            var ar = $(this.srcIMG).width() / $(this.srcIMG).height();
            
            console.log('SRC: width', $(this.srcIMG).width(), 'height', $(this.srcIMG).height(), 'aspectRatio:', ar);
            console.log('CROP: width', this.width, 'height', this.height, 'aspectRatio', this.aspectRatio);
                       
            if(this.aspectRatio < ar) {
                this.height = $(this.srcIMG).height();
                this.width = this.height * this.aspectRatio;
            } else {
                this.width = $(this.srcIMG).width();
                this.height = this.width / this.aspectRatio;
            }
            
            $(this.cropFrame).width(this.width);
            $(this.cropFrame).height(this.height);
            
            $(this.cropFrame).on('mousedown', '', {'crop':this}, this.onStartMove);            
            $(this.cropFrame).on('mousedown', 'span', {'crop':this}, this.onMarkerStartMove);
        },
        onStartMove: function(e) {
            if(!$(this).hasClass('move')) {
                var crop = e.data.crop;
                
                crop.mouseX = e.pageX;
                crop.mouseY = e.pageY;
               
                $(this).addClass('move');
                $(document).off('mousemove');
                $(document).on('mousemove', '', {'crop':crop}, crop.onMove);
                $(document).off('mouseup');
                $(document).on('mouseup', '', {'crop':crop}, crop.onStopMove);                
            }            
        },
        onStopMove: function(e) {
           var crop = e.data.crop;
           
           if($(crop.cropFrame).hasClass('move')) {   
                $(this).off('mousemove');
                $(crop.cropFrame).removeClass('move');
            }            
        },
        onMove: function(e) {
            var crop = e.data.crop;
            var pos = $(crop.cropFrame).offset();
            var dX = e.pageX - crop.mouseX;
            var dY = e.pageY - crop.mouseY;
            
            var crd = {
                x1: pos.left + dX,
                y1: pos.top + dY,
                x2: pos.left + dX + crop.width,
                y2: pos.top + dY + crop.height
            }
            if(crd.x1 < $(crop.srcIMG).offset().left) {
                crd.x1 = $(crop.srcIMG).offset().left;
            }
            
            if(crd.y1 < $(crop.srcIMG).offset().top) {
                crd.y1 = $(crop.srcIMG).offset().top;
            }
            
            if(crd.x2 > $(crop.srcIMG).offset().left + $(crop.srcIMG).width()) {
                crd.x1 = $(crop.srcIMG).offset().left + $(crop.srcIMG).width() - crop.width;
            }
            
            if(crd.y2 > $(crop.srcIMG).offset().top + $(crop.srcIMG).height()) {
                crd.y1 = $(crop.srcIMG).offset().top + $(crop.srcIMG).height() - crop.height;
            }
      
            crop.mouseX = e.pageX;
            crop.mouseY = e.pageY;
        
            $(crop.cropFrame).offset({'top':crd.y1, 'left':crd.x1});
        },
        onMarkerStartMove: function(e) {
            var crop = e.data.crop;
            
            if(!$(crop.cropFrame).hasClass('move')) {                
                crop.mouseX = e.pageX;
                crop.mouseY = e.pageY;
                
                $(crop.cropFrame).addClass('move');
                $(document).off('mousemove');
                $(document).on('mousemove', '', {'crop':crop, 'marker':$(this)}, crop.onMarkerMove);
                $(document).off('mouseup');
                $(document).on('mouseup', '', {'crop':crop, 'marker':$(this)}, crop.onMarkerStopMove);                
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
            var dX = e.pageX - crop.mouseX;
            var dY = e.pageY - crop.mouseY;
 
            var marker = e.data.marker;
            var pos = $(marker).offset();
             
            var dt = {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            }
 
            
            switch ($(marker).attr('class')) {
                case 'nw':
                    dt.top = $(crop.cropFrame).offset().top + dY;
                    dt.left = $(crop.cropFrame).offset().left + dX;                  
                    
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
                    dt.top = $(crop.cropFrame).offset().top + dY;
                    dt.left = $(crop.cropFrame).offset().left;
                    
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
                    dt.top = $(crop.cropFrame).offset().top + dY;
                    dt.left = $(crop.cropFrame).offset().left;
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
                    dt.top = $(crop.cropFrame).offset().top + dY;
                    dt.left = $(crop.cropFrame).offset().left + dX;
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
                    dt.top = pos.top + dY;
                    dt.left = $(crop.cropFrame).offset().left;
                    
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
                    dt.top = $(crop.cropFrame).offset().top;
                    dt.left = $(crop.cropFrame).offset().left;
                    
                    dt.width = $(crop.cropFrame).width() + dX;
                    
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
                    dt.top = $(crop.cropFrame).offset().top;
                    dt.left = $(crop.cropFrame).offset().left;
                    
                    dt.height = $(crop.cropFrame).height() + dY;
                    
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
                    dt.top = $(crop.cropFrame).offset().top;
                    dt.left = $(crop.cropFrame).offset().left + dX;
                    
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
            
            crop.mouseX = e.pageX;
            crop.mouseY = e.pageY;
            
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
                context.drawImage(imageObj, imgData.Left, imgData.Top, imgData.Width, imgData.Height, 0, 0, imgData.Width, imgData.Height);
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
        }
    }
}