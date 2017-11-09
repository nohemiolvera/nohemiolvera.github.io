jQuery(document).ready(function ($) {


    $(window).stellar();

    $('li[data-slide="1"]').addClass('active');

    var links = $('.navigation').find('li');
    slide = $('.slide');
    button = $('.button');
    mywindow = $(window);
    htmlbody = $('html,body');



    function goToByScroll(dataslide) {
        htmlbody.animate({
            scrollTop: $('.slide[data-slide="' + dataslide + '"]').offset().top
        }, 2000, 'easeInOutQuint');
    }


links.click(function (e) {
    e.preventDefault();
    dataslide = $(this).attr('data-slide');
    goToByScroll(dataslide);
    $('.active').removeClass('active');
    $(this).addClass('active');
});



    button.click(function (e) {
        e.preventDefault();
        dataslide = $(this).attr('data-slide');
        goToByScroll(dataslide);

    });


$('.btn.btn-dark').click(function (e) {
 /*e.preventDefault();*/
 goToByScroll('2');
 $('.active').removeClass('active');
 $('li[data-slide="2"]').addClass('active');
});


});