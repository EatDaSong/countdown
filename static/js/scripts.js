(function($) {
    var $f = $('#change-time'),
        $s = $('#set-time'),
        $c = $('#counter'),
        $min = $('.counter-min', $c),
        $sec = $('.counter-sec', $c),
        $a = $('#end-timer'),
        timeRest = 60;
        localStorage.setItem('timer', timeRest);

    /*****************/
    /* INITIALISATIONS
    /* */
    /* Init interval */
    var interval = {
        start : function(fct) { //On fixe l'interval à 1s et on lance le décompte
            if(!interval.value) {
                interval.value = setInterval(fct, 1000);
            }
        },
        stop : function() {
            if(interval.value) { //on met en pause le countdown en définissant l'interval à zero
                clearTimeout(interval.value);
                interval.value = null;
            }
        },
        value : null
    };

    /* Init countdown */
    var countdown = {
        start : function(isBegin,reint) { //lancement du countdown avec une interval défini plus haut
            if(isBegin) {
                $('.last-time', $c).removeClass('last-time'); //On enlève la classe last time qui fait clignoter le compteur lors des 5 dérnière secondes
                if(reint) { /* Si reset true alors on remet le compteur à 1 minute */
                    timeRest = 60; //on défini le timeRest à 1 minute.
                    localStorage.setItem('timer', timeRest);
                    $('#time-head').html("1 minute"); /*<-- remise à 0 minute du time-head */
                } else {
                    timeRest = localStorage.getItem('timer'); //Si le reint n'est pas défini ou est sur false on reprend le temps du timer défini par le form
                /* timeRest = $s.data('time'); */ //reset du timer à la dernière valeur définie par l'utilisateur si reint = false ou n'éxiste pas
            }
            }

            interval.start(countdown.loop);
        },
        stop : function(isEnd) { //mise en pause du countdown
            if(isEnd) {
                $a[0].play();
                $('.counter-box',$c).click(function() {
                    countdown.start(true);
                });
            }
            interval.stop();
        },
        loop : function() {
            var min = Math.floor(timeRest/60),
                sec = timeRest%60;

            min = min.toString().length == 1 ? "0" + min : min;
            sec = sec.toString().length == 1 ? "0" + sec : sec;

            $min.text(min); //modification des minutes dans le compteur
            $sec.text(sec); //modification des secondes dans le compteur

            if(timeRest == 0) {
                countdown.stop(true); //Si le décompte est fini donc est égal à 0, on stop le compteur.
            } else if(timeRest < 5) {
                $('.counter-box', $c).addClass('last-time'); //S'il reste moins de 5 secondes, on charge la classe last time qui fait clignoter le timer
            }

            timeRest --;
        }
    };

    /*****************/
    /* FUNCTIONS
    /* */
    /* Change timer viewer */
    var setHeadTime = function() {  // Changement du temps afficher dans le head en fonction du nouveau temps défini
        var min = Math.floor(timeRest/60), // obtenir les minutes en divisant les secondes par 60 car 1 minutes = 60
            sec = timeRest%60,
            html = "";

        if(min>0) {
            html += min + ' minute' + (min>9 ? 's' : '') + ' ';
        }
        if(sec>0) {
            html += sec + ' seconde' + (sec>9 ? 's' : '');
        }

        $s.attr('data-time',timeRest).find('span').html(html);
    };
    var setMainTime = function() {
        var min = Math.floor(timeRest/60),
            sec = timeRest%60;

        min = min.toString().length == 1 ? "0" + min : min;
        sec = sec.toString().length == 1 ? "0" + sec : sec;

        $min.text(min); // Mise en place du nouveau temps 
        $sec.text(sec);
    };

    /*****************/
    /* BIND ELEMENTS
    /* */
    /* Start countdown */
    $('.js-starter', $c).click(function() { //Premier lancement du countdown
        $(this).fadeOut(500,function() {
            $('.js-countdown').fadeIn(500,function() {
                countdown.start(true);
            });
        });

    });
    /* Play/pause button */
    $('.js-stop', $c).click(function() {
        var $t = $(this);

        if(interval.value) { //Si le compteur à une valeur d'interval positive (return true) on le met sur pause et on change l'affichage des boutons.
            countdown.stop();
            $('.btn-pause', $t).attr('aria-hidden', 'true');
            $('.btn-play', $t).attr('aria-hidden', 'false');
        } else { //Sinon on le relance
            countdown.start();
            $('.btn-pause', $t).attr('aria-hidden', 'false');
            $('.btn-play', $t).attr('aria-hidden', 'true');
        }
    });
    /* Restart button */
    $('.js-start', $c).click(function() {
        countdown.start(true); /*<-- restart temps défini */
    });

    /* Bouton réinitialisation */

    $('.js-restart', $c).click(function(){
        countdown.start(true, true); /*<-- restart temps défini (second true correspond à l'argument reint dans countdown.start*/
    });

    /* Show form */
    $('button', $s).click(function() { //Afficher le formulaire de changement de temps
        $s.add($f).toggleClass('show');
    });

    /* Label effect on form inputs */
    $.fn.setVal = function(add) { //on ajoute la classe hasVal sur la class field
        var $elem = $(this).parent();

        if(add) {
            $elem.addClass('hasVal');
        } else {
            $elem.removeClass('hasVal');
        }
    };
    $('[type="number"]', $f).on('change', function() {
        $(this).setVal(true);
    }).focusin(function() {
        $(this).setVal(true);
    }).focusout(function() {
        $(this).setVal(!!$(this).val());
    });

    /* Change set time */
    $f.on('submit', function() { //envoi du changement de temps
        var newMin = parseInt($('#minutes').val()) || 0,
            newSec = parseInt($('#seconds').val()) || 0;

        /* Set timeRest */
        timeRest = (newMin*60) + newSec; //Défini le temps restant après envoi du formulaire de changement
        localStorage.setItem('timer', timeRest); //Définition de l'item timer avec la valeur timeRest;

        /* Set data-time */
        setHeadTime(); //modif du temps affiché dans le head
        setMainTime(); //modif du temps du countdown

        /* Hide form */
        $s.add($f).toggleClass('show'); //On cache le formulaire

        return false;
    });

    /*****************/
    /* INIT PAGE
    /* */
    /* Init input val */
    $('[type="number"]', $f).setVal(!!$('[type="number"]', $f).val());

    /* Init timer */
    timeRest = localStorage.getItem('timer') || 60; //chargement du timer et déffinition de TimeRest
    setHeadTime(); //chargement du temps à afficher dans le head
    setMainTime(); //Chargement du temps à compter dans le countdown
})(jQuery);
