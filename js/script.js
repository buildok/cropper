$(window).load(function() {
    var cropper = new CropperObj({
        width: 5, 
        height: 3,
        fixed: true,
        srcIMG: '.source-image',
    });
    cropper.init();
    
    
    $('.btn-crop').on('click', '', {'obj':cropper}, onCrop);    
});

function onCrop(e)
{
    var cropper = e.data.obj;
    
    cropper.onCrop(function() {
        $('.dest > .preview-image').attr('src', cropper.dataURL);
    });
}

