$(window).load(function() {
    var cropper = new CropperObj({
        width: 5, 
        height: 3,
        fixed: true,
        srcIMG: '.source-image',
    });
    cropper.init();
    
    
    $('.btn-crop').on('click', '', {'crop':cropper}, onCrop);    
});

function onCrop(e)
{
    var crop = e.data.crop;
    
    crop.onCrop(function() {
        $('.dest > .preview-image').attr('src', crop.dataURL);
    });
}

