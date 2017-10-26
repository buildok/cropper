# cropper

### example
```js
$(window).load(function() {
    var cropper = new CropperObj({
        aspectRatio: 5 / 4,
        fixed: true,
        srcIMG: '.source-image',
    });    
    
    $('.btn-crop').on('click', '', {'crop':cropper}, onCrop);    
});

function onCrop(e)
{
    var crop = e.data.crop;
    
    crop.onCrop(function() {
        $('.dest > .preview-image').attr('src', crop.dataURL);
    });
}
```

demo http://buildok.github.io/cropper
