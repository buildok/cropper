$(window).load(function() {
    var cropper = new CropperObj({
        aspectRatio: 5 / 4,
        fixed: true,
        srcIMG: '.source-image',
    });    
    
    $('.btn-crop').on('click', '', {'crop':cropper}, onCrop);    
    $('.btn-reset').on('click', '', {'crop':cropper}, onResetCrop)
});

function onResetCrop(e)
{
    var crop = e.data.crop;
    
    crop.reset({
       fixed: $('#crop_fixed').val(),
       aspectRatio:  $('#crop_width').val() / $('#crop_height').val(),
    });
}

function onCrop(e)
{
    var crop = e.data.crop;
    
    crop.onCrop(function() {
        $('.dest > .preview-image').attr('src', crop.dataURL);
    });
}

